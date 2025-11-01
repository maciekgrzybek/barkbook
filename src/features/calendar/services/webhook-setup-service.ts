/**
 * Service for programmatically setting up Cal.com webhooks
 * Used during user onboarding to automatically configure webhooks
 */

export interface WebhookSetupConfig {
  subscriberUrl: string; // Your webhook endpoint
  eventTriggers: CalComWebhookTrigger[];
  active?: boolean;
  payloadTemplate?: string;
}

export type CalComWebhookTrigger =
  | 'BOOKING_CREATED'
  | 'BOOKING_RESCHEDULED'
  | 'BOOKING_CANCELLED'
  | 'BOOKING_REJECTED'
  | 'BOOKING_REQUESTED'
  | 'BOOKING_PAYMENT_INITIATED'
  | 'MEETING_ENDED'
  | 'FORM_SUBMITTED'
  | 'INSTANT_MEETING';

export interface CalComWebhook {
  id: string;
  subscriberUrl: string;
  eventTriggers: CalComWebhookTrigger[];
  active: boolean;
  payloadTemplate: string | null;
  createdAt: string;
}

export class WebhookSetupService {
  /**
   * Automatically set up webhook for a new user during onboarding
   */
  static async setupWebhookForUser(
    accessToken: string,
    appUrl: string = process.env.NEXT_PUBLIC_APP_URL || ''
  ): Promise<CalComWebhook | null> {
    try {
      const webhookUrl = `${appUrl}/api/webhooks/calcom`;

      const config: WebhookSetupConfig = {
        subscriberUrl: webhookUrl,
        eventTriggers: [
          'BOOKING_CREATED',
          'BOOKING_RESCHEDULED',
          'BOOKING_CANCELLED',
          'MEETING_ENDED',
        ],
        active: true,
      };

      return await this.createWebhook(accessToken, config);
    } catch (error) {
      console.error('Failed to setup webhook automatically:', error);
      return null;
    }
  }

  /**
   * Create a webhook using Cal.com API
   */
  static async createWebhook(
    accessToken: string,
    config: WebhookSetupConfig
  ): Promise<CalComWebhook> {
    const response = await fetch('https://api.cal.com/v1/webhooks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        subscriberUrl: config.subscriberUrl,
        eventTriggers: config.eventTriggers,
        active: config.active ?? true,
        payloadTemplate: config.payloadTemplate || null,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to create webhook: ${error}`);
    }

    const data = await response.json();
    return data.webhook;
  }

  /**
   * List all webhooks for a user
   */
  static async listWebhooks(accessToken: string): Promise<CalComWebhook[]> {
    const response = await fetch('https://api.cal.com/v1/webhooks', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch webhooks');
    }

    const data = await response.json();
    return data.webhooks || [];
  }

  /**
   * Delete a webhook
   */
  static async deleteWebhook(
    accessToken: string,
    webhookId: string
  ): Promise<void> {
    const response = await fetch(
      `https://api.cal.com/v1/webhooks/${webhookId}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to delete webhook');
    }
  }

  /**
   * Update webhook configuration
   */
  static async updateWebhook(
    accessToken: string,
    webhookId: string,
    config: Partial<WebhookSetupConfig>
  ): Promise<CalComWebhook> {
    const response = await fetch(
      `https://api.cal.com/v1/webhooks/${webhookId}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(config),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to update webhook');
    }

    const data = await response.json();
    return data.webhook;
  }

  /**
   * Check if webhook is already set up for a user
   */
  static async isWebhookSetup(
    accessToken: string,
    webhookUrl: string
  ): Promise<boolean> {
    try {
      const webhooks = await this.listWebhooks(accessToken);
      return webhooks.some((w) => w.subscriberUrl === webhookUrl && w.active);
    } catch (error) {
      console.error('Error checking webhook setup:', error);
      return false;
    }
  }

  /**
   * Ensure webhook is set up, create if missing
   */
  static async ensureWebhookSetup(
    accessToken: string,
    appUrl?: string
  ): Promise<CalComWebhook | null> {
    const url = appUrl || process.env.NEXT_PUBLIC_APP_URL || '';
    const webhookUrl = `${url}/api/webhooks/calcom`;

    try {
      // Check if webhook already exists
      const isSetup = await this.isWebhookSetup(accessToken, webhookUrl);

      if (isSetup) {
        console.log('✅ Webhook already configured');
        return null;
      }

      // Create webhook
      console.log('📝 Creating webhook automatically...');
      const webhook = await this.setupWebhookForUser(accessToken, url);

      if (webhook) {
        console.log('✅ Webhook created:', webhook.id);
      }

      return webhook;
    } catch (error) {
      console.error('Error ensuring webhook setup:', error);
      return null;
    }
  }
}
