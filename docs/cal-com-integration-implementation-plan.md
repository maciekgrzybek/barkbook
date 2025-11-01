# Cal.com Integration Implementation Plan

## OAuth Authentication & Calendar Management

### Table of Contents

1. [Overview](#overview)
2. [OAuth Authentication Flow](#oauth-authentication-flow)
3. [UI Implementation Plan](#ui-implementation-plan)
4. [Backend Implementation Plan](#backend-implementation-plan)
5. [Testing Strategy](#testing-strategy)
6. [Third-party Integration Plan](#third-party-integration-plan)
7. [Security Considerations](#security-considerations)
8. [Implementation Timeline](#implementation-timeline)

---

## Overview

This document outlines the implementation plan for integrating Cal.com with BarkBook using OAuth authentication. The integration will allow groomers to authenticate with their Cal.com accounts and manage their calendar directly within BarkBook, providing a seamless scheduling experience.

### Key Features

- **OAuth Authentication**: Secure login/registration through Cal.com
- **Embedded Calendar**: Direct calendar management within BarkBook
- **API Integration**: Programmatic visit creation and management
- **Webhook Support**: Real-time synchronization of calendar changes
- **Visit Duration Management**: Customizable appointment lengths
- **Photo Storage**: Visit documentation with images

---

## OAuth Authentication Flow

### 1. Authentication Architecture

```typescript
// OAuth Flow States
enum AuthState {
  UNAUTHENTICATED = 'unauthenticated',
  AUTHENTICATING = 'authenticating',
  AUTHENTICATED = 'authenticated',
  ERROR = 'error',
}

// Cal.com OAuth Configuration
interface CalComOAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes: string[];
  authUrl: string;
  tokenUrl: string;
}
```

### 2. OAuth Implementation Steps

#### Phase 1: OAuth Setup

1. Register BarkBook application with Cal.com
2. Configure OAuth credentials in environment variables
3. Implement OAuth callback handling
4. Set up secure token storage

#### Phase 2: Authentication Flow

1. **Initial Login/Registration**:

   - User clicks "Connect with Cal.com"
   - Redirect to Cal.com authorization server
   - User grants permissions
   - Handle callback with authorization code
   - Exchange code for access/refresh tokens

2. **Token Management**:

   - Store tokens securely in Supabase
   - Implement automatic token refresh
   - Handle token expiration gracefully

3. **User Experience**:
   - Seamless integration with existing auth flow
   - Clear error messaging
   - Automatic salon profile creation post-OAuth

---

## UI Implementation Plan

### 1. Authentication Components

#### Enhanced Auth Pages

```typescript
// features/auth/components/OAuthLoginPage.tsx
interface OAuthLoginPageProps {
  providers: ('calcom' | 'email')[];
  onSuccess: (user: User) => void;
  onError: (error: AuthError) => void;
}
```

**Components to Implement:**

- `CalComAuthButton`: OAuth login button with Cal.com branding
- `AuthProviderSelector`: Choose between Cal.com OAuth or email auth
- `OAuthCallback`: Handle OAuth callback and loading states
- `AuthErrorBoundary`: Graceful error handling for auth failures

#### Updated Registration Flow

1. **Welcome Screen**: Choose authentication method
2. **Cal.com OAuth**: Redirect to Cal.com authorization
3. **Callback Processing**: Handle OAuth response
4. **Salon Setup**: Create salon profile (if first-time user)
5. **Dashboard**: Redirect to main application

### 2. Calendar Interface Components

#### Main Calendar Page

```typescript
// features/calendar/components/CalendarPage.tsx
interface CalendarPageProps {
  calComToken: string;
  onEventCreate: (event: CalendarEvent) => void;
  onEventUpdate: (eventId: string, updates: Partial<CalendarEvent>) => void;
}
```

**Key Components:**

- `EmbeddedCalComCalendar`: iframe with OAuth token integration
- `VisitCreationModal`: Create visits with client/pet linking
- `DurationSelector`: Choose from predefined or custom durations
- `SyncStatusIndicator`: Show last sync time and connection status
- `QuickActions`: Fast access to common calendar operations

#### Dashboard Integration

```typescript
// features/dashboard/components/TodayScheduleWidget.tsx
interface TodayScheduleWidgetProps {
  appointments: CalendarEvent[];
  isLoading: boolean;
  lastSyncTime: Date;
  onRefresh: () => void;
}
```

### 3. Settings & Configuration

#### Calendar Settings Page

- **OAuth Connection Status**: Show connected Cal.com account
- **Calendar Selection**: Choose which Cal.com calendar to use
- **Sync Preferences**: Webhook configuration, sync frequency
- **Default Settings**: Visit durations, notification timing
- **Disconnect Option**: Revoke OAuth access gracefully

#### Enhanced Salon Settings

- **Calendar Integration**: Link salon profile with Cal.com account
- **Business Hours**: Sync with Cal.com availability settings
- **Notification Templates**: SMS content with calendar event data

### 4. Mobile Responsiveness

- **Responsive Calendar**: Optimized iframe sizing for mobile devices
- **Touch-friendly Controls**: Large buttons for duration selection
- **Collapsible Panels**: Efficient screen space usage
- **Gesture Support**: Swipe navigation for calendar views

---

## Backend Implementation Plan

### 1. Database Schema Updates

```sql
-- Enhanced user table for OAuth
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS cal_com_user_id varchar;
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS cal_com_username varchar;

-- OAuth tokens storage
CREATE TABLE cal_com_tokens (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  access_token text NOT NULL,
  refresh_token text,
  token_type varchar DEFAULT 'Bearer',
  expires_at timestamptz,
  scope text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Calendar configuration per salon
ALTER TABLE salons ADD COLUMN cal_com_calendar_id varchar;
ALTER TABLE salons ADD COLUMN webhook_url varchar;
ALTER TABLE salons ADD COLUMN webhook_secret varchar;
ALTER TABLE salons ADD COLUMN default_visit_duration_minutes integer DEFAULT 60;

-- Enhanced calendar events table
CREATE TABLE calendar_events (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  cal_com_event_id varchar NOT NULL UNIQUE,
  salon_id uuid REFERENCES salons(id) ON DELETE CASCADE,
  client_id uuid REFERENCES clients(id) ON DELETE SET NULL,
  pet_id uuid REFERENCES pets(id) ON DELETE SET NULL,
  title varchar NOT NULL,
  description text,
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  duration_minutes integer,
  status varchar DEFAULT 'scheduled',
  attendee_email varchar,
  attendee_phone varchar,
  location varchar,
  meeting_url varchar,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  synced_at timestamptz DEFAULT now()
);

-- Visit photos linked to calendar events
CREATE TABLE visit_photos (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  calendar_event_id uuid REFERENCES calendar_events(id) ON DELETE CASCADE,
  pet_id uuid REFERENCES pets(id) ON DELETE CASCADE,
  file_path varchar NOT NULL,
  file_name varchar NOT NULL,
  file_size integer,
  uploaded_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Webhook processing logs
CREATE TABLE webhook_logs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  salon_id uuid REFERENCES salons(id),
  webhook_type varchar NOT NULL,
  payload jsonb NOT NULL,
  status varchar NOT NULL, -- success, error, pending
  error_message text,
  processed_at timestamptz DEFAULT now(),
  cal_com_event_id varchar
);

-- RLS Policies
ALTER TABLE cal_com_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE visit_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies Implementation
CREATE POLICY "Users can manage their own tokens" ON cal_com_tokens
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Salon owners can manage calendar events" ON calendar_events
  FOR ALL USING (
    salon_id IN (
      SELECT id FROM salons WHERE owner_id = auth.uid()
    )
  );
```

### 2. OAuth Implementation

#### OAuth Service Layer

```typescript
// core/services/oauth/cal-com-oauth.ts
class CalComOAuthService {
  private config: CalComOAuthConfig;

  constructor(config: CalComOAuthConfig) {
    this.config = config;
  }

  // Generate OAuth authorization URL
  generateAuthUrl(state: string, codeChallenge?: string): string;

  // Exchange authorization code for tokens
  async exchangeCodeForTokens(code: string): Promise<TokenResponse>;

  // Refresh access token
  async refreshAccessToken(refreshToken: string): Promise<TokenResponse>;

  // Revoke access token
  async revokeToken(token: string): Promise<void>;

  // Validate token and get user info
  async getUserInfo(accessToken: string): Promise<CalComUserInfo>;
}
```

#### API Routes (Next.js)

```typescript
// src/app/api/auth/calcom/route.ts - OAuth initiation
// src/app/api/auth/calcom/callback/route.ts - OAuth callback
// src/app/api/webhooks/calcom/route.ts - Webhook handler
// src/app/api/calendar/sync/route.ts - Manual sync endpoint
// src/app/api/calendar/events/route.ts - CRUD operations
```

### 3. Calendar Service Architecture

#### Abstract Calendar Provider

```typescript
// core/services/calendar/calendar-provider.interface.ts
interface CalendarProvider {
  // Authentication
  authenticate(credentials: OAuthCredentials): Promise<AuthResult>;
  refreshAuth(refreshToken: string): Promise<AuthResult>;

  // Event Management
  createEvent(event: CreateEventRequest): Promise<CalendarEvent>;
  updateEvent(
    eventId: string,
    updates: UpdateEventRequest
  ): Promise<CalendarEvent>;
  deleteEvent(eventId: string): Promise<void>;
  getEvent(eventId: string): Promise<CalendarEvent>;
  getEvents(query: GetEventsQuery): Promise<CalendarEvent[]>;
  getTodaysEvents(): Promise<CalendarEvent[]>;

  // Calendar Management
  getCalendars(): Promise<Calendar[]>;
  getAvailability(dateRange: DateRange): Promise<AvailabilitySlot[]>;

  // Webhook Management
  setupWebhook(webhookConfig: WebhookConfig): Promise<Webhook>;
  validateWebhook(payload: any, signature: string): boolean;
}
```

#### Cal.com Provider Implementation

```typescript
// core/services/calendar/cal-com-provider.ts
class CalComProvider implements CalendarProvider {
  private httpClient: CalComApiClient;
  private tokenManager: TokenManager;

  constructor(tokenManager: TokenManager) {
    this.tokenManager = tokenManager;
    this.httpClient = new CalComApiClient(tokenManager);
  }

  // Implementation of all CalendarProvider methods
  // with Cal.com specific API calls and data transformations
}
```

### 4. Webhook Processing

#### Webhook Handler

```typescript
// features/calendar/services/webhook-processor.ts
class CalComWebhookProcessor {
  async processWebhook(payload: CalComWebhookPayload): Promise<void> {
    // Validate webhook signature
    // Parse event data
    // Update local database
    // Trigger notifications if needed
    // Log processing result
  }

  private async handleEventCreated(event: CalComEvent): Promise<void>;
  private async handleEventUpdated(event: CalComEvent): Promise<void>;
  private async handleEventCancelled(event: CalComEvent): Promise<void>;
  private async linkEventToClientPet(event: CalComEvent): Promise<void>;
}
```

### 5. Background Jobs (Supabase Edge Functions)

#### Sync Job

```typescript
// supabase/functions/calendar-sync/index.ts
export default async function syncCalendarEvents(request: Request) {
  // Fetch events from Cal.com API
  // Compare with local database
  // Update/create/delete events as needed
  // Handle pagination for large datasets
  // Log sync results
}
```

#### Token Refresh Job

```typescript
// supabase/functions/token-refresh/index.ts
export default async function refreshExpiredTokens(request: Request) {
  // Find tokens expiring within 24 hours
  // Refresh them using refresh token
  // Update database with new tokens
  // Handle refresh failures gracefully
}
```

---

## Testing Strategy

### 1. Unit Tests (Vitest)

#### OAuth Service Tests

```typescript
// core/services/oauth/__tests__/cal-com-oauth.test.ts
describe('CalComOAuthService', () => {
  test('should generate valid authorization URL');
  test('should exchange code for tokens successfully');
  test('should refresh expired tokens');
  test('should handle OAuth errors gracefully');
  test('should validate token format');
});
```

#### Calendar Provider Tests

```typescript
// core/services/calendar/__tests__/cal-com-provider.test.ts
describe('CalComProvider', () => {
  test('should create calendar events with proper authentication');
  test('should handle API rate limiting');
  test('should transform Cal.com data to internal format');
  test('should handle authentication failures');
});
```

#### Component Tests

```typescript
// features/auth/components/__tests__/CalComAuthButton.test.tsx
describe('CalComAuthButton', () => {
  test('should initiate OAuth flow on click');
  test('should show loading state during authentication');
  test('should handle OAuth errors');
  test('should be accessible');
});
```

### 2. Integration Tests

#### OAuth Flow Integration

```typescript
// tests/integration/oauth-flow.test.ts
describe('OAuth Integration Flow', () => {
  test('complete OAuth flow from login to token storage');
  test('automatic salon creation after successful OAuth');
  test('token refresh flow');
  test('OAuth error handling and recovery');
});
```

#### Calendar API Integration

```typescript
// tests/integration/calendar-api.test.ts
describe('Calendar API Integration', () => {
  test('sync events from Cal.com API');
  test('create events via API and verify in Cal.com');
  test('webhook processing and database updates');
  test('handle API errors and timeouts');
});
```

### 3. End-to-End Tests (Playwright)

#### Complete User Flows

```typescript
// e2e/calendar-integration.spec.ts
test.describe('Cal.com Integration', () => {
  test('complete OAuth login and calendar setup', async ({ page }) => {
    // Navigate to login page
    // Click "Connect with Cal.com"
    // Handle OAuth redirect (mock Cal.com)
    // Verify successful authentication
    // Check salon creation
    // Verify calendar access
  });

  test('create visit through BarkBook interface', async ({ page }) => {
    // Login with existing Cal.com OAuth
    // Navigate to calendar
    // Create new visit with client/pet selection
    // Verify event appears in embedded calendar
    // Check database for event storage
  });

  test('webhook processing updates UI in real-time', async ({ page }) => {
    // Set up webhook listener
    // Trigger webhook from mock Cal.com
    // Verify UI updates without refresh
    // Check database consistency
  });
});
```

### 4. Security Tests

#### Authentication Security

```typescript
// tests/security/oauth-security.test.ts
describe('OAuth Security', () => {
  test('should validate OAuth state parameter');
  test('should handle CSRF attacks');
  test('should secure token storage');
  test('should validate webhook signatures');
  test('should handle token injection attempts');
});
```

### 5. Performance Tests

#### Calendar Loading Performance

```typescript
// tests/performance/calendar-performance.test.ts
describe('Calendar Performance', () => {
  test('calendar iframe should load within 3 seconds');
  test('API calls should complete within 2 seconds');
  test('webhook processing should complete within 1 second');
  test('large calendar datasets should render efficiently');
});
```

### 6. Mock Strategy (MSW)

#### Cal.com API Mocks

```typescript
// tests/mocks/cal-com-api.ts
export const calComApiHandlers = [
  rest.post('/oauth/token', (req, res, ctx) => {
    return res(ctx.json(mockTokenResponse));
  }),
  rest.get('/v1/me', (req, res, ctx) => {
    return res(ctx.json(mockUserInfo));
  }),
  rest.get('/v1/calendars', (req, res, ctx) => {
    return res(ctx.json(mockCalendars));
  }),
  rest.post('/v1/bookings', (req, res, ctx) => {
    return res(ctx.json(mockEventCreated));
  }),
];
```

---

## Third-party Integration Plan

### 1. Cal.com Integration Architecture

#### Provider Abstraction

```typescript
// core/services/calendar/providers/index.ts
export interface CalendarProviderFactory {
  createProvider(type: 'calcom' | 'google' | 'outlook'): CalendarProvider;
}

export class CalendarProviderFactoryImpl implements CalendarProviderFactory {
  createProvider(type: string): CalendarProvider {
    switch (type) {
      case 'calcom':
        return new CalComProvider(this.tokenManager);
      case 'google':
        return new GoogleCalendarProvider(this.tokenManager);
      default:
        throw new Error(`Unsupported provider: ${type}`);
    }
  }
}
```

#### Configuration Management

```typescript
// core/config/calendar-providers.ts
interface ProviderConfig {
  type: 'calcom' | 'google' | 'outlook';
  oauth: {
    clientId: string;
    clientSecret: string;
    redirectUri: string;
    scopes: string[];
    authUrl: string;
    tokenUrl: string;
  };
  api: {
    baseUrl: string;
    version: string;
    rateLimit: {
      requests: number;
      window: number;
    };
  };
  features: {
    supportsWebhooks: boolean;
    supportsRecurringEvents: boolean;
    maxEventDuration: number;
    timezoneSupport: boolean;
  };
}
```

### 2. Adapter Pattern Implementation

#### Cal.com Specific Adapter

```typescript
// core/services/calendar/adapters/cal-com-adapter.ts
class CalComAdapter {
  // Transform Cal.com API responses to internal format
  transformEventToInternal(calComEvent: CalComEvent): InternalCalendarEvent;
  transformInternalToCalCom(event: InternalCalendarEvent): CalComEventRequest;

  // Handle Cal.com specific error codes
  handleApiError(error: CalComApiError): CalendarError;

  // Validate Cal.com webhook payloads
  validateWebhookPayload(payload: any): CalComWebhookPayload;
}
```

### 3. Feature Detection and Fallbacks

#### Capability Matrix

```typescript
// core/services/calendar/capabilities.ts
interface CalendarCapabilities {
  oauth: boolean;
  webhooks: boolean;
  recurringEvents: boolean;
  customDurations: boolean;
  attendeeManagement: boolean;
  videoConferencing: boolean;
  multiCalendar: boolean;
}

class CapabilityDetector {
  async detectCapabilities(
    provider: CalendarProvider
  ): Promise<CalendarCapabilities>;
}
```

### 4. Migration Strategy

#### Provider Migration Tools

```typescript
// core/services/calendar/migration/provider-migrator.ts
class CalendarProviderMigrator {
  async migrateFromCalComToGoogle(userId: string): Promise<MigrationResult>;
  async validateMigration(userId: string): Promise<ValidationResult>;
  async rollbackMigration(userId: string): Promise<void>;
}
```

### 5. Error Handling & Circuit Breaker

#### Provider Health Monitoring

```typescript
// core/services/calendar/health/provider-health.ts
class ProviderHealthMonitor {
  private circuitBreakers: Map<string, CircuitBreaker>;

  async checkProviderHealth(provider: string): Promise<HealthStatus>;
  async handleProviderFailure(provider: string, error: Error): Promise<void>;
  isProviderAvailable(provider: string): boolean;
}
```

---

## Security Considerations

### 1. OAuth Security

#### Token Security

- **Secure Storage**: Tokens encrypted at rest in Supabase
- **Token Rotation**: Automatic refresh token rotation
- **Scope Limitation**: Request minimal required scopes
- **PKCE**: Use Proof Key for Code Exchange for enhanced security

#### State Management

- **CSRF Protection**: Unique state parameter for each OAuth flow
- **Session Security**: Secure session management with proper expiration
- **Nonce Validation**: Prevent replay attacks

### 2. API Security

#### Authentication & Authorization

- **Bearer Token Validation**: Verify Cal.com tokens on each API call
- **Rate Limiting**: Implement rate limiting to prevent abuse
- **Request Signing**: Sign sensitive API requests
- **RLS Policies**: Strict Row Level Security in Supabase

#### Data Protection

- **Data Encryption**: Encrypt sensitive data in transit and at rest
- **Input Validation**: Validate all user inputs and API responses
- **SQL Injection Prevention**: Use parameterized queries
- **XSS Protection**: Sanitize user-generated content

### 3. Webhook Security

#### Webhook Validation

- **Signature Verification**: Verify Cal.com webhook signatures
- **Payload Validation**: Validate webhook payload structure
- **Timestamp Checks**: Prevent replay attacks with timestamp validation
- **Rate Limiting**: Limit webhook processing rate

#### Error Handling

- **Graceful Degradation**: Handle webhook failures gracefully
- **Retry Logic**: Implement exponential backoff for failed webhooks
- **Dead Letter Queue**: Store failed webhooks for manual processing
- **Monitoring**: Monitor webhook processing health

### 4. Data Privacy (GDPR/RODO Compliance)

#### User Data Management

- **Data Minimization**: Store only necessary data
- **Right to Deletion**: Implement complete data deletion
- **Data Portability**: Allow users to export their data
- **Consent Management**: Track and manage user consent

#### Audit Logging

- **Access Logs**: Log all data access and modifications
- **API Logs**: Log all Cal.com API interactions
- **Webhook Logs**: Log all webhook processing
- **User Actions**: Log user actions for audit trails

---

## Implementation Timeline

### Phase 1: Foundation (Weeks 1-2)

#### Week 1: OAuth Setup

- [ ] Register Cal.com OAuth application
- [ ] Implement OAuth service layer
- [ ] Create database schema updates
- [ ] Set up environment configuration

#### Week 2: Authentication Flow

- [ ] Build OAuth login components
- [ ] Implement token management
- [ ] Create callback handling
- [ ] Add error handling and recovery

### Phase 2: Calendar Integration (Weeks 3-4)

#### Week 3: Basic Calendar Features

- [ ] Implement Cal.com API client
- [ ] Create calendar provider abstraction
- [ ] Build embedded calendar component
- [ ] Add event CRUD operations

#### Week 4: Advanced Features

- [ ] Implement visit duration management
- [ ] Add client/pet linking logic
- [ ] Create dashboard integration
- [ ] Build settings interface

### Phase 3: Real-time Sync (Weeks 5-6)

#### Week 5: Webhook Implementation

- [ ] Set up webhook endpoints
- [ ] Implement webhook processing
- [ ] Add real-time UI updates
- [ ] Create sync status monitoring

#### Week 6: Background Jobs

- [ ] Implement calendar sync job
- [ ] Add token refresh automation
- [ ] Create cleanup processes
- [ ] Add monitoring and alerting

### Phase 4: Testing & Polish (Weeks 7-8)

#### Week 7: Comprehensive Testing

- [ ] Write unit tests
- [ ] Create integration tests
- [ ] Implement E2E tests
- [ ] Add performance tests

#### Week 8: Final Polish

- [ ] Security audit and fixes
- [ ] Performance optimization
- [ ] UI/UX improvements
- [ ] Documentation completion

### Phase 5: Deployment & Monitoring (Week 9)

- [ ] Production deployment
- [ ] Monitoring setup
- [ ] Error tracking configuration
- [ ] User feedback collection

---

## Success Metrics

### Technical Metrics

- **OAuth Success Rate**: >99% successful authentications
- **API Response Time**: <2 seconds for all calendar operations
- **Webhook Processing**: <1 second processing time
- **Error Rate**: <1% for all calendar operations
- **Uptime**: 99.9% availability

### User Experience Metrics

- **Authentication Time**: <30 seconds for complete OAuth flow
- **Calendar Load Time**: <3 seconds for embedded calendar
- **Sync Accuracy**: 100% consistency between Cal.com and BarkBook
- **User Adoption**: >80% of groomers use calendar integration

### Business Metrics

- **Feature Adoption**: Track usage of calendar features
- **User Retention**: Monitor retention after OAuth implementation
- **Support Tickets**: Reduce calendar-related support requests
- **User Satisfaction**: Measure satisfaction with calendar integration

---

## Conclusion

This implementation plan provides a comprehensive roadmap for integrating Cal.com with BarkBook using OAuth authentication. The plan prioritizes security, user experience, and maintainability while providing a solid foundation for future enhancements.

The modular architecture ensures that the integration can evolve with changing requirements and potentially support additional calendar providers in the future. The extensive testing strategy guarantees reliability, while the security considerations ensure user data protection and compliance with privacy regulations.

Regular monitoring and feedback collection will enable continuous improvement and ensure the integration meets the evolving needs of grooming professionals using BarkBook.
