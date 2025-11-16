import { createServiceRoleClient } from '@/core/supabase/service';
import type { Database } from '@/core/db/database.types';

type CalendarEvent = Database['public']['Tables']['calendar_events']['Insert'];

// Cal.com webhook event types
export enum CalComWebhookEvent {
  BOOKING_CREATED = 'BOOKING_CREATED',
  BOOKING_RESCHEDULED = 'BOOKING_RESCHEDULED',
  BOOKING_CANCELLED = 'BOOKING_CANCELLED',
  BOOKING_REJECTED = 'BOOKING_REJECTED',
  BOOKING_REQUESTED = 'BOOKING_REQUESTED',
  BOOKING_PAYMENT_INITIATED = 'BOOKING_PAYMENT_INITIATED',
  MEETING_ENDED = 'MEETING_ENDED',
}

// Cal.com webhook payload structure
export interface CalComWebhookPayload {
  triggerEvent: CalComWebhookEvent;
  createdAt: string;
  payload: {
    type?: string;
    title?: string;
    description?: string;
    customInputs?: Record<string, any>;
    startTime: string;
    endTime: string;
    organizer?: {
      id: number;
      name: string;
      email: string;
      timeZone: string;
    };
    attendees?: Array<{
      email: string;
      name: string;
      timeZone: string;
      language?: { locale: string };
    }>;
    uid: string;
    bookingId?: number;
    metadata?: {
      groomioClientId?: string;
      groomioPetId?: string;
      source?: string;
      [key: string]: any;
    };
    status?: string;
    smsReminderNumber?: string;
    location?: string;
    destinationCalendar?: any;
    responses?: {
      name?: string;
      email?: string;
      phone?: string;
      notes?: string;
      [key: string]: any;
    };
  };
}

export interface WebhookProcessResult {
  success: boolean;
  eventId?: string;
  error?: string;
  action?: 'created' | 'updated' | 'cancelled' | 'skipped';
}

export class CalComWebhookProcessor {
  /**
   * Main entry point for processing Cal.com webhooks
   */
  static async processWebhook(
    payload: CalComWebhookPayload
  ): Promise<WebhookProcessResult> {
    try {
      const { triggerEvent } = payload;

      switch (triggerEvent) {
        case CalComWebhookEvent.BOOKING_CREATED:
          return await this.handleBookingCreated(payload);

        case CalComWebhookEvent.BOOKING_RESCHEDULED:
          return await this.handleBookingRescheduled(payload);

        case CalComWebhookEvent.BOOKING_CANCELLED:
        case CalComWebhookEvent.BOOKING_REJECTED:
          return await this.handleBookingCancelled(payload);

        case CalComWebhookEvent.MEETING_ENDED:
          return await this.handleMeetingEnded(payload);

        default:
          console.log(`Unhandled webhook event: ${triggerEvent}`);
          return {
            success: true,
            action: 'skipped',
          };
      }
    } catch (error) {
      console.error('Error processing webhook:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Handle BOOKING_CREATED event
   */
  private static async handleBookingCreated(
    payload: CalComWebhookPayload
  ): Promise<WebhookProcessResult> {
    const supabase = createServiceRoleClient();
    const { payload: booking } = payload;

    try {
      // Check if booking already exists
      const { data: existing } = await supabase
        .from('calendar_events')
        .select('id')
        .eq('cal_com_event_id', booking.uid)
        .maybeSingle();

      if (existing) {
        console.log(`Booking ${booking.uid} already exists, skipping create`);
        return {
          success: true,
          action: 'skipped',
          eventId: existing.id,
        };
      }

      // Extract Groomio metadata
      const metadata = booking.metadata || {};
      const clientId = metadata.groomioClientId || null;
      const petId = metadata.groomioPetId || null;

      // Get salon_id from client or pet relationship
      let salonId = null;
      if (clientId) {
        const { data: clientData } = await supabase
          .from('clients')
          .select('salon_id')
          .eq('id', clientId)
          .maybeSingle();

        if (clientData) {
          salonId = clientData.salon_id;
        }
      } else if (petId) {
        const { data: petData } = await supabase
          .from('pets')
          .select('salon_id')
          .eq('id', petId)
          .maybeSingle();

        if (petData) {
          salonId = petData.salon_id;
        }
      }

      // Get attendee info
      const attendee = booking.attendees?.[0];
      const attendeeEmail = attendee?.email || booking.responses?.email;
      const attendeePhone =
        booking.smsReminderNumber ||
        booking.responses?.phone ||
        (attendee as any)?.phoneNumber;

      // Calculate duration
      const startTime = new Date(booking.startTime);
      const endTime = new Date(booking.endTime);
      const durationMinutes = Math.round(
        (endTime.getTime() - startTime.getTime()) / (1000 * 60)
      );

      // Create calendar event
      const calendarEvent: CalendarEvent = {
        cal_com_event_id: booking.uid,
        salon_id: salonId,
        client_id: clientId,
        pet_id: petId,
        title: booking.title || 'Appointment',
        description: booking.description || booking.responses?.notes || null,
        start_time: booking.startTime,
        end_time: booking.endTime,
        duration_minutes: durationMinutes,
        status: 'scheduled',
        attendee_email: attendeeEmail || null,
        attendee_phone: attendeePhone || null,
        location: booking.location || null,
        meeting_url: (booking as any).conferenceData?.url || null,
        synced_at: new Date().toISOString(),
      };

      const { data: created, error } = await supabase
        .from('calendar_events')
        .insert(calendarEvent)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create calendar event: ${error.message}`);
      }

      console.log(
        `✅ Created calendar event ${created.id} for booking ${booking.uid}`
      );

      // Create pet_visit if we have pet_id and salon_id
      if (petId && salonId) {
        try {
          const visitNotes = [
            booking.title || 'Wizyta',
            booking.description || '',
            attendeeEmail ? `Email: ${attendeeEmail}` : '',
            attendeePhone ? `Tel: ${attendeePhone}` : '',
            booking.location ? `Lokalizacja: ${booking.location}` : '',
          ]
            .filter(Boolean)
            .join('\n');

          const { data: petVisit, error: visitError } = await supabase
            .from('pet_visits')
            .insert({
              pet_id: petId,
              salon_id: salonId,
              visit_date: startTime.toISOString().split('T')[0], // Extract date only
              notes: visitNotes || 'Wizyta zarezerwowana przez Cal.com',
            })
            .select()
            .single();

          if (visitError) {
            console.error(
              `⚠️ Failed to create pet visit for pet ${petId}:`,
              visitError.message
            );
            // Don't throw - calendar event is already created
          } else {
            console.log(`✅ Created pet visit ${petVisit.id} for pet ${petId}`);
          }
        } catch (visitError) {
          console.error('Error creating pet visit:', visitError);
          // Don't throw - calendar event is already created
        }
      }

      return {
        success: true,
        action: 'created',
        eventId: created.id,
      };
    } catch (error) {
      console.error('Error handling BOOKING_CREATED:', error);
      throw error;
    }
  }

  /**
   * Handle BOOKING_RESCHEDULED event
   */
  private static async handleBookingRescheduled(
    payload: CalComWebhookPayload
  ): Promise<WebhookProcessResult> {
    const supabase = createServiceRoleClient();
    const { payload: booking } = payload;

    try {
      // Find existing event
      const { data: existing, error: findError } = await supabase
        .from('calendar_events')
        .select('id')
        .eq('cal_com_event_id', booking.uid)
        .maybeSingle();

      if (findError) {
        throw new Error(`Failed to find event: ${findError.message}`);
      }

      if (!existing) {
        console.log(
          `Event ${booking.uid} not found, creating instead of updating`
        );
        return await this.handleBookingCreated(payload);
      }

      // Calculate new duration
      const startTime = new Date(booking.startTime);
      const endTime = new Date(booking.endTime);
      const durationMinutes = Math.round(
        (endTime.getTime() - startTime.getTime()) / (1000 * 60)
      );

      // Update the event
      const { error: updateError } = await supabase
        .from('calendar_events')
        .update({
          title: booking.title || 'Appointment',
          description: booking.description || booking.responses?.notes || null,
          start_time: booking.startTime,
          end_time: booking.endTime,
          duration_minutes: durationMinutes,
          status: 'scheduled',
          synced_at: new Date().toISOString(),
        })
        .eq('id', existing.id);

      if (updateError) {
        throw new Error(`Failed to update event: ${updateError.message}`);
      }

      console.log(
        `✅ Updated calendar event ${existing.id} for booking ${booking.uid}`
      );

      // Update pet_visit date if it exists
      const { data: calEvent } = await supabase
        .from('calendar_events')
        .select('pet_id, salon_id')
        .eq('id', existing.id)
        .maybeSingle();

      if (calEvent?.pet_id && calEvent?.salon_id) {
        try {
          // Find and update the pet visit for this date
          const oldStartTime = new Date(booking.startTime);
          const newVisitDate = oldStartTime.toISOString().split('T')[0];

          const { error: visitUpdateError } = await supabase
            .from('pet_visits')
            .update({
              visit_date: newVisitDate,
              updated_at: new Date().toISOString(),
            })
            .eq('pet_id', calEvent.pet_id)
            .eq('salon_id', calEvent.salon_id)
            // Match visits on the same day (since we don't have a direct link)
            .gte('visit_date', oldStartTime.toISOString().split('T')[0])
            .lte('visit_date', oldStartTime.toISOString().split('T')[0]);

          if (visitUpdateError) {
            console.error(
              `⚠️ Failed to update pet visit date:`,
              visitUpdateError.message
            );
          } else {
            console.log(`✅ Updated pet visit date for pet ${calEvent.pet_id}`);
          }
        } catch (visitError) {
          console.error('Error updating pet visit:', visitError);
        }
      }

      return {
        success: true,
        action: 'updated',
        eventId: existing.id,
      };
    } catch (error) {
      console.error('Error handling BOOKING_RESCHEDULED:', error);
      throw error;
    }
  }

  /**
   * Handle BOOKING_CANCELLED or BOOKING_REJECTED event
   */
  private static async handleBookingCancelled(
    payload: CalComWebhookPayload
  ): Promise<WebhookProcessResult> {
    const supabase = createServiceRoleClient();
    const { payload: booking } = payload;

    try {
      // Find existing event
      const { data: existing, error: findError } = await supabase
        .from('calendar_events')
        .select('id')
        .eq('cal_com_event_id', booking.uid)
        .maybeSingle();

      if (findError) {
        throw new Error(`Failed to find event: ${findError.message}`);
      }

      if (!existing) {
        console.log(`Event ${booking.uid} not found, nothing to cancel`);
        return {
          success: true,
          action: 'skipped',
        };
      }

      // Update status to cancelled
      const { error: updateError } = await supabase
        .from('calendar_events')
        .update({
          status: 'cancelled',
          synced_at: new Date().toISOString(),
        })
        .eq('id', existing.id);

      if (updateError) {
        throw new Error(`Failed to cancel event: ${updateError.message}`);
      }

      console.log(
        `✅ Cancelled calendar event ${existing.id} for booking ${booking.uid}`
      );

      // Delete associated pet_visit if it exists
      const { data: calEvent } = await supabase
        .from('calendar_events')
        .select('pet_id, salon_id, start_time')
        .eq('id', existing.id)
        .maybeSingle();

      if (calEvent?.pet_id && calEvent?.salon_id) {
        try {
          const visitDate = new Date(calEvent.start_time)
            .toISOString()
            .split('T')[0];

          const { error: deleteError } = await supabase
            .from('pet_visits')
            .delete()
            .eq('pet_id', calEvent.pet_id)
            .eq('salon_id', calEvent.salon_id)
            .eq('visit_date', visitDate);

          if (deleteError) {
            console.error(
              `⚠️ Failed to delete pet visit:`,
              deleteError.message
            );
          } else {
            console.log(`✅ Deleted pet visit for pet ${calEvent.pet_id}`);
          }
        } catch (visitError) {
          console.error('Error deleting pet visit:', visitError);
        }
      }

      return {
        success: true,
        action: 'cancelled',
        eventId: existing.id,
      };
    } catch (error) {
      console.error('Error handling BOOKING_CANCELLED:', error);
      throw error;
    }
  }

  /**
   * Handle MEETING_ENDED event
   */
  private static async handleMeetingEnded(
    payload: CalComWebhookPayload
  ): Promise<WebhookProcessResult> {
    const supabase = createServiceRoleClient();
    const { payload: booking } = payload;

    try {
      // Find existing event
      const { data: existing, error: findError } = await supabase
        .from('calendar_events')
        .select('id')
        .eq('cal_com_event_id', booking.uid)
        .maybeSingle();

      if (findError || !existing) {
        console.log(`Event ${booking.uid} not found for MEETING_ENDED`);
        return {
          success: true,
          action: 'skipped',
        };
      }

      // Update status to completed
      const { error: updateError } = await supabase
        .from('calendar_events')
        .update({
          status: 'completed',
          synced_at: new Date().toISOString(),
        })
        .eq('id', existing.id);

      if (updateError) {
        throw new Error(`Failed to complete event: ${updateError.message}`);
      }

      console.log(
        `✅ Marked calendar event ${existing.id} as completed for booking ${booking.uid}`
      );

      return {
        success: true,
        action: 'updated',
        eventId: existing.id,
      };
    } catch (error) {
      console.error('Error handling MEETING_ENDED:', error);
      throw error;
    }
  }

  /**
   * Validate webhook signature (if Cal.com provides one)
   */
  static validateSignature(
    payload: string,
    signature: string,
    secret: string
  ): boolean {
    // TODO: Implement signature validation when Cal.com provides it
    // For now, return true (implement proper validation in production)
    return true;
  }
}
