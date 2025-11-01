import { createClient } from '@/core/supabase/client';
import type { Database } from '@/core/db/database.types';

type CalendarEvent = Database['public']['Tables']['calendar_events']['Row'];

export interface CalendarEventWithDetails extends CalendarEvent {
  client?: {
    id: string;
    name: string;
    surname: string;
    phone_number: string;
    email: string | null;
  };
  pet?: {
    id: string;
    name: string;
    breed: string | null;
    type: string | null;
    allergies: string | null;
    health_issues: string | null;
  };
}

export class CalendarService {
  /**
   * Get today's appointments for a salon (client-side)
   */
  static async getTodaysAppointments(
    salonId: string
  ): Promise<CalendarEventWithDetails[]> {
    const supabase = createClient();

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const { data, error } = await supabase
      .from('calendar_events')
      .select(
        `
        *,
        client:clients (
          id,
          name,
          surname,
          phone_number,
          email
        ),
        pet:pets (
          id,
          name,
          breed,
          type,
          allergies,
          health_issues
        )
      `
      )
      .eq('salon_id', salonId)
      .gte('start_time', today.toISOString())
      .lt('start_time', tomorrow.toISOString())
      .in('status', ['scheduled', 'confirmed'])
      .order('start_time');

    if (error) {
      console.error("Error fetching today's appointments:", error);
      throw new Error('Failed to fetch appointments');
    }

    return (data || []) as CalendarEventWithDetails[];
  }

  /**
   * Get today's appointments for current user's salon (client-side)
   */
  static async getTodaysAppointmentsForCurrentUser(): Promise<
    CalendarEventWithDetails[]
  > {
    const supabase = createClient();

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('User not authenticated');
    }

    // Get user's salon
    const { data: salon } = await supabase
      .from('salons')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!salon) {
      throw new Error('Salon not found');
    }

    // Get today's appointments
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const { data, error } = await supabase
      .from('calendar_events')
      .select(
        `
        *,
        client:clients (
          id,
          name,
          surname,
          phone_number,
          email
        ),
        pet:pets (
          id,
          name,
          breed,
          type,
          allergies,
          health_issues
        )
      `
      )
      .eq('salon_id', salon.id)
      .gte('start_time', today.toISOString())
      .lt('start_time', tomorrow.toISOString())
      .in('status', ['scheduled', 'confirmed'])
      .order('start_time');

    if (error) {
      console.error("Error fetching today's appointments:", error);
      throw new Error('Failed to fetch appointments');
    }

    return (data || []) as CalendarEventWithDetails[];
  }

  /**
   * Get this week's appointments for current user's salon (client-side)
   */
  static async getThisWeeksAppointmentsForCurrentUser(): Promise<
    CalendarEventWithDetails[]
  > {
    const supabase = createClient();

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('User not authenticated');
    }

    // Get user's salon
    const { data: salon } = await supabase
      .from('salons')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!salon) {
      throw new Error('Salon not found');
    }

    // Calculate start of week (Monday)
    const now = new Date();
    const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, ...
    const daysFromMonday = currentDay === 0 ? 6 : currentDay - 1; // If Sunday, go back 6 days

    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - daysFromMonday);
    startOfWeek.setHours(0, 0, 0, 0);

    // Calculate end of week (Sunday)
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);

    const { data, error } = await supabase
      .from('calendar_events')
      .select(
        `
        *,
        client:clients (
          id,
          name,
          surname,
          phone_number,
          email
        ),
        pet:pets (
          id,
          name,
          breed,
          type,
          allergies,
          health_issues
        )
      `
      )
      .eq('salon_id', salon.id)
      .gte('start_time', startOfWeek.toISOString())
      .lt('start_time', endOfWeek.toISOString())
      .in('status', ['scheduled', 'confirmed'])
      .order('start_time');

    if (error) {
      console.error("Error fetching this week's appointments:", error);
      throw new Error('Failed to fetch appointments');
    }

    return (data || []) as CalendarEventWithDetails[];
  }

  /**
   * Get upcoming appointments for a pet
   */
  static async getUpcomingAppointmentsForPet(
    petId: string
  ): Promise<CalendarEventWithDetails[]> {
    const supabase = createClient();
    const now = new Date();

    const { data, error } = await supabase
      .from('calendar_events')
      .select(
        `
        *,
        client:clients (
          id,
          name,
          surname,
          phone_number,
          email
        ),
        pet:pets (
          id,
          name,
          breed,
          type,
          allergies,
          health_issues
        )
      `
      )
      .eq('pet_id', petId)
      .gte('start_time', now.toISOString())
      .in('status', ['scheduled', 'confirmed'])
      .order('start_time')
      .limit(10);

    if (error) {
      console.error('Error fetching pet appointments:', error);
      throw new Error('Failed to fetch pet appointments');
    }

    return (data || []) as CalendarEventWithDetails[];
  }

  /**
   * Get past appointments (visit history) for a pet
   */
  static async getPastAppointmentsForPet(
    petId: string
  ): Promise<CalendarEventWithDetails[]> {
    const supabase = createClient();
    const now = new Date();

    const { data, error } = await supabase
      .from('calendar_events')
      .select(
        `
        *,
        client:clients (
          id,
          name,
          surname,
          phone_number,
          email
        ),
        pet:pets (
          id,
          name,
          breed,
          type,
          allergies,
          health_issues
        )
      `
      )
      .eq('pet_id', petId)
      .lt('end_time', now.toISOString())
      .order('start_time', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching pet history:', error);
      throw new Error('Failed to fetch pet history');
    }

    return (data || []) as CalendarEventWithDetails[];
  }

  /**
   * Get all appointments in a date range
   */
  static async getAppointmentsInRange(
    salonId: string,
    startDate: Date,
    endDate: Date
  ): Promise<CalendarEventWithDetails[]> {
    const supabase = createClient();

    const { data, error } = await supabase
      .from('calendar_events')
      .select(
        `
        *,
        client:clients (
          id,
          name,
          surname,
          phone_number,
          email
        ),
        pet:pets (
          id,
          name,
          breed,
          type,
          allergies,
          health_issues
        )
      `
      )
      .eq('salon_id', salonId)
      .gte('start_time', startDate.toISOString())
      .lte('start_time', endDate.toISOString())
      .order('start_time');

    if (error) {
      console.error('Error fetching appointments in range:', error);
      throw new Error('Failed to fetch appointments');
    }

    return (data || []) as CalendarEventWithDetails[];
  }

  /**
   * Format time for display
   */
  static formatTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleTimeString('pl-PL', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  /**
   * Format date for display
   */
  static formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('pl-PL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  /**
   * Format date with weekday (short format)
   */
  static formatDateWithWeekday(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('pl-PL', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  }
}
