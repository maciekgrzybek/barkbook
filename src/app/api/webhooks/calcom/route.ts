import { NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/core/supabase/service';
import {
  CalComWebhookProcessor,
  type CalComWebhookPayload,
} from '@/features/calendar/services/calcom-webhook-processor';

export async function POST(request: Request) {
  const supabase = createServiceRoleClient();
  const startTime = Date.now();

  try {
    // Parse webhook payload
    const payload: CalComWebhookPayload | null = await request
      .json()
      .catch(() => null);

    if (!payload || !payload.triggerEvent) {
      console.error('Invalid webhook payload received');
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    console.log(
      `📥 Received Cal.com webhook: ${payload.triggerEvent} for booking ${payload.payload?.uid}`
    );

    // Log webhook receipt
    const logEntry = {
      webhook_type: 'calcom',
      payload: payload as any,
      status: 'processing' as const,
      cal_com_event_id: payload.payload?.uid || null,
    };

    const { data: log } = await supabase
      .from('webhook_logs')
      .insert(logEntry)
      .select()
      .single();

    // Process the webhook
    const result = await CalComWebhookProcessor.processWebhook(payload);

    // Update webhook log with result
    if (log) {
      await supabase
        .from('webhook_logs')
        .update({
          status: result.success ? 'success' : 'error',
          error_message: result.error || null,
        })
        .eq('id', log.id);
    }

    const duration = Date.now() - startTime;

    if (result.success) {
      console.log(
        `✅ Webhook processed successfully in ${duration}ms: ${
          result.action
        } (event: ${result.eventId || 'N/A'})`
      );
      return NextResponse.json({
        ok: true,
        action: result.action,
        eventId: result.eventId,
        duration,
      });
    } else {
      console.error(`❌ Webhook processing failed: ${result.error}`);
      return NextResponse.json(
        {
          ok: false,
          error: result.error,
          duration,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('❌ Webhook error:', error);

    // Try to log the error
    try {
      await supabase.from('webhook_logs').insert({
        webhook_type: 'calcom',
        payload: { error: 'Failed to parse payload' } as any,
        status: 'error',
        error_message: error instanceof Error ? error.message : 'Unknown error',
      });
    } catch (logError) {
      console.error('Failed to log webhook error:', logError);
    }

    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        duration,
      },
      { status: 500 }
    );
  }
}
