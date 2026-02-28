import { v4 as uuidv4 } from 'uuid';
import * as crypto from 'crypto';

export interface OAuthTokenPrimitive {
    id: string;
    access_token: string;
    refresh_token: string;
    client_id: string;
    user_id: string;
    scopes: string[];
    access_token_expires_at: Date;
    refresh_token_expires_at: Date;
    revoked: boolean;
    created_at: Date;
    updated_at?: Date;
}

export class OAuthToken {
    private constructor(
        private readonly id: string,
        private readonly access_token: string,
        private readonly refresh_token: string,
        private readonly client_id: string,
        private readonly user_id: string,
        private readonly scopes: string[],
        private readonly access_token_expires_at: Date,
        private readonly refresh_token_expires_at: Date,
        private revoked: boolean,
        private readonly created_at: Date,
        private updated_at?: Date,
    ) { }

    static create(data: {
        client_id: string;
        user_id: string;
        scopes: string[];
        accessTokenExpiresInSeconds?: number;
        refreshTokenExpiresInDays?: number;
    }): OAuthToken {
        const accessTokenExpiresIn = data.accessTokenExpiresInSeconds || 3600; // 1 hour default
        const refreshTokenExpiresIn = data.refreshTokenExpiresInDays || 30; // 30 days default

        return new OAuthToken(
            uuidv4(),
            crypto.randomBytes(64).toString('hex'),
            crypto.randomBytes(64).toString('hex'),
            data.client_id,
            data.user_id,
            data.scopes,
            new Date(Date.now() + accessTokenExpiresIn * 1000),
            new Date(Date.now() + refreshTokenExpiresIn * 24 * 60 * 60 * 1000),
            false,
            new Date(),
        );
    }

    static fromPrimitives(data: OAuthTokenPrimitive): OAuthToken {
        return new OAuthToken(
            data.id,
            data.access_token,
            data.refresh_token,
            data.client_id,
            data.user_id,
            data.scopes,
            data.access_token_expires_at,
            data.refresh_token_expires_at,
            data.revoked,
            data.created_at,
            data.updated_at,
        );
    }

    toPrimitives(): OAuthTokenPrimitive {
        return {
            id: this.id,
            access_token: this.access_token,
            refresh_token: this.refresh_token,
            client_id: this.client_id,
            user_id: this.user_id,
            scopes: this.scopes,
            access_token_expires_at: this.access_token_expires_at,
            refresh_token_expires_at: this.refresh_token_expires_at,
            revoked: this.revoked,
            created_at: this.created_at,
            updated_at: this.updated_at,
        };
    }

    // Validation methods
    isAccessTokenExpired(): boolean {
        return new Date() > this.access_token_expires_at;
    }

    isRefreshTokenExpired(): boolean {
        return new Date() > this.refresh_token_expires_at;
    }

    isRevoked(): boolean {
        return this.revoked;
    }

    isAccessTokenValid(): boolean {
        return !this.isAccessTokenExpired() && !this.isRevoked();
    }

    isRefreshTokenValid(): boolean {
        return !this.isRefreshTokenExpired() && !this.isRevoked();
    }

    hasScope(scope: string): boolean {
        return this.scopes.includes(scope);
    }

    revoke(): void {
        this.revoked = true;
        this.updated_at = new Date();
    }

    /**
     * Returns the remaining seconds until access token expires
     */
    getAccessTokenExpiresIn(): number {
        const now = Date.now();
        const expiresAt = this.access_token_expires_at.getTime();
        return Math.max(0, Math.floor((expiresAt - now) / 1000));
    }

    // Getters
    get idValue(): string { return this.id; }
    get accessTokenValue(): string { return this.access_token; }
    get refreshTokenValue(): string { return this.refresh_token; }
    get clientIdValue(): string { return this.client_id; }
    get userIdValue(): string { return this.user_id; }
    get scopesValue(): string[] { return this.scopes; }
    get accessTokenExpiresAtValue(): Date { return this.access_token_expires_at; }
    get refreshTokenExpiresAtValue(): Date { return this.refresh_token_expires_at; }
    get revokedValue(): boolean { return this.revoked; }
    get createdAtValue(): Date { return this.created_at; }
    get updatedAtValue(): Date | undefined { return this.updated_at; }
}
