import { v4 as uuidv4 } from 'uuid';
import * as crypto from 'crypto';

export interface AuthorizationCodePrimitive {
    id: string;
    code: string;
    client_id: string;
    user_id: string;
    redirect_uri: string;
    scopes: string[];
    code_challenge?: string;
    code_challenge_method?: string;
    state?: string;
    expires_at: Date;
    used: boolean;
    created_at: Date;
}

export class AuthorizationCode {
    private constructor(
        private readonly id: string,
        private readonly code: string,
        private readonly client_id: string,
        private readonly user_id: string,
        private readonly redirect_uri: string,
        private readonly scopes: string[],
        private readonly code_challenge?: string,
        private readonly code_challenge_method?: string,
        private readonly state?: string,
        private readonly expires_at: Date = new Date(Date.now() + 10 * 60 * 1000), // 10 minutes default
        private used: boolean = false,
        private readonly created_at: Date = new Date(),
    ) { }

    static create(data: {
        client_id: string;
        user_id: string;
        redirect_uri: string;
        scopes: string[];
        code_challenge?: string;
        code_challenge_method?: string;
        state?: string;
    }): AuthorizationCode {
        const code = crypto.randomBytes(32).toString('base64url');

        return new AuthorizationCode(
            uuidv4(),
            code,
            data.client_id,
            data.user_id,
            data.redirect_uri,
            data.scopes,
            data.code_challenge,
            data.code_challenge_method,
            data.state,
            new Date(Date.now() + 10 * 60 * 1000), // 10 minutes expiration
            false,
            new Date(),
        );
    }

    static fromPrimitives(data: AuthorizationCodePrimitive): AuthorizationCode {
        return new AuthorizationCode(
            data.id,
            data.code,
            data.client_id,
            data.user_id,
            data.redirect_uri,
            data.scopes,
            data.code_challenge,
            data.code_challenge_method,
            data.state,
            data.expires_at,
            data.used,
            data.created_at,
        );
    }

    toPrimitives(): AuthorizationCodePrimitive {
        return {
            id: this.id,
            code: this.code,
            client_id: this.client_id,
            user_id: this.user_id,
            redirect_uri: this.redirect_uri,
            scopes: this.scopes,
            code_challenge: this.code_challenge,
            code_challenge_method: this.code_challenge_method,
            state: this.state,
            expires_at: this.expires_at,
            used: this.used,
            created_at: this.created_at,
        };
    }

    // Validation methods
    isExpired(): boolean {
        return new Date() > this.expires_at;
    }

    isUsed(): boolean {
        return this.used;
    }

    isValid(): boolean {
        return !this.isExpired() && !this.isUsed();
    }

    /**
     * Validates PKCE code_verifier against the stored code_challenge
     * Uses SHA256 for S256 method
     */
    validateCodeVerifier(codeVerifier: string): boolean {
        if (!this.code_challenge) {
            // PKCE not required for this authorization code
            return true;
        }

        if (this.code_challenge_method === 'S256') {
            const hash = crypto
                .createHash('sha256')
                .update(codeVerifier)
                .digest('base64url');
            return hash === this.code_challenge;
        }

        // Plain method (not recommended, but supported)
        if (this.code_challenge_method === 'plain') {
            return codeVerifier === this.code_challenge;
        }

        return false;
    }

    markAsUsed(): void {
        this.used = true;
    }

    // Getters
    get idValue(): string { return this.id; }
    get codeValue(): string { return this.code; }
    get clientIdValue(): string { return this.client_id; }
    get userIdValue(): string { return this.user_id; }
    get redirectUriValue(): string { return this.redirect_uri; }
    get scopesValue(): string[] { return this.scopes; }
    get codeChallengeValue(): string | undefined { return this.code_challenge; }
    get codeChallengeMethodValue(): string | undefined { return this.code_challenge_method; }
    get stateValue(): string | undefined { return this.state; }
    get expiresAtValue(): Date { return this.expires_at; }
    get usedValue(): boolean { return this.used; }
    get createdAtValue(): Date { return this.created_at; }
}
