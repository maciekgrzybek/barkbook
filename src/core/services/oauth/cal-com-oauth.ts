export interface CalComOAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes: string[];
  authUrl: string;
  tokenUrl: string;
  apiBaseUrl: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in?: number;
  refresh_token?: string;
  scope?: string;
}

export interface CalComUserInfo {
  id: string;
  username: string;
  email?: string;
}

export class CalComOAuthService {
  private config: CalComOAuthConfig;

  constructor(config?: Partial<CalComOAuthConfig>) {
    this.config = {
      clientId: process.env.CALCOM_CLIENT_ID || '',
      clientSecret: process.env.CALCOM_CLIENT_SECRET || '',
      redirectUri:
        process.env.CALCOM_REDIRECT_URI ||
        `${process.env.NEXT_PUBLIC_APP_URL || ''}/api/auth/calcom/callback`,
      scopes: (
        process.env.CALCOM_SCOPES || 'openid profile offline_access'
      ).split(' '),
      authUrl:
        process.env.CALCOM_AUTH_URL || 'https://api.cal.com/oauth/authorize',
      tokenUrl:
        process.env.CALCOM_TOKEN_URL || 'https://api.cal.com/oauth/token',
      apiBaseUrl: process.env.CALCOM_API_BASE_URL || 'https://api.cal.com/v1',
      ...config,
    } as CalComOAuthConfig;
  }

  generateState(): string {
    const bytes = new Uint8Array(16);
    globalThis.crypto.getRandomValues(bytes);
    return Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }

  generateAuthUrl(state: string, codeChallenge?: string): string {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      scope: this.config.scopes.join(' '),
      state,
    });
    if (codeChallenge) {
      params.set('code_challenge', codeChallenge);
      params.set('code_challenge_method', 'S256');
    }
    return `${this.config.authUrl}?${params.toString()}`;
  }

  async exchangeCodeForTokens(code: string): Promise<TokenResponse> {
    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: this.config.redirectUri,
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
    });

    const response = await fetch(this.config.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to exchange code for tokens: ${errorText}`);
    }

    return (await response.json()) as TokenResponse;
  }

  async refreshAccessToken(refreshToken: string): Promise<TokenResponse> {
    const body = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
    });

    const response = await fetch(this.config.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to refresh access token: ${errorText}`);
    }

    return (await response.json()) as TokenResponse;
  }

  async revokeToken(token: string): Promise<void> {
    // If Cal.com supports revocation endpoint, implement here. No-op for now.
    void token;
  }

  async getUserInfo(accessToken: string): Promise<CalComUserInfo> {
    const response = await fetch(`${this.config.apiBaseUrl}/me`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch user info: ${errorText}`);
    }

    const data = (await response.json()) as {
      id: string | number;
      username: string;
      email?: string;
    };
    return {
      id: data.id?.toString?.() ?? data.id,
      username: data.username,
      email: data.email,
    } as CalComUserInfo;
  }
}
