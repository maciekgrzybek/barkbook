export interface DateRange {
  start: Date;
  end: Date;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  durationMinutes?: number;
  status?: string;
}

export interface CreateEventRequest {
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  attendees?: { email?: string; phone?: string }[];
}

export type UpdateEventRequest = Partial<CreateEventRequest>;

export interface Calendar {
  id: string;
  name: string;
}

export interface AvailabilitySlot {
  startTime: string;
  endTime: string;
}

export interface WebhookConfig {
  url: string;
  secret?: string;
}

export interface OAuthCredentials {
  accessToken: string;
  refreshToken?: string;
}

export interface AuthResult {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: string;
}

export interface CalendarProvider {
  authenticate(credentials: OAuthCredentials): Promise<AuthResult>;
  refreshAuth(refreshToken: string): Promise<AuthResult>;
  createEvent(event: CreateEventRequest): Promise<CalendarEvent>;
  updateEvent(
    eventId: string,
    updates: UpdateEventRequest
  ): Promise<CalendarEvent>;
  deleteEvent(eventId: string): Promise<void>;
  getEvent(eventId: string): Promise<CalendarEvent>;
  getEvents(query: { start: string; end: string }): Promise<CalendarEvent[]>;
  getTodaysEvents(): Promise<CalendarEvent[]>;
  getCalendars(): Promise<Calendar[]>;
  getAvailability(dateRange: DateRange): Promise<AvailabilitySlot[]>;
  setupWebhook(webhookConfig: WebhookConfig): Promise<{ id: string }>;
  validateWebhook(payload: unknown, signature: string): boolean;
}
