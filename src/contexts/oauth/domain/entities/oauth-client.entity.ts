import { v4 as uuidv4 } from 'uuid';
import * as crypto from 'crypto';

export interface OAuthClientPrimitive {
    id: string;
    client_id: string;
    client_secret: string;
    name: string;
    redirect_uris: string[];
    allowed_scopes: string[];
    pkce_enabled: boolean;
    is_active: boolean;
    created_at: Date;
    updated_at?: Date;
    deleted_at?: Date;
}

export class OAuthClient {
    private constructor(
        private readonly id: string,
        private readonly client_id: string,
        private readonly client_secret: string,
        private name: string,
        private redirect_uris: string[],
        private allowed_scopes: string[],
        private pkce_enabled: boolean,
        private is_active: boolean,
        private readonly created_at: Date,
        private updated_at?: Date,
        private deleted_at?: Date,
    ) { }

    static create(data: {
        name: string;
        redirect_uris: string[];
        allowed_scopes: string[];
        pkce_enabled?: boolean;
    }): OAuthClient {
        return new OAuthClient(
            uuidv4(),
            `client_${crypto.randomBytes(16).toString('hex')}`,
            `secret_${crypto.randomBytes(32).toString('hex')}`,
            data.name,
            data.redirect_uris,
            data.allowed_scopes,
            data.pkce_enabled ?? true,
            true,
            new Date(),
        );
    }

    static fromPrimitives(data: OAuthClientPrimitive): OAuthClient {
        return new OAuthClient(
            data.id,
            data.client_id,
            data.client_secret,
            data.name,
            data.redirect_uris,
            data.allowed_scopes,
            data.pkce_enabled,
            data.is_active,
            data.created_at,
            data.updated_at,
            data.deleted_at,
        );
    }

    toPrimitives(): OAuthClientPrimitive {
        return {
            id: this.id,
            client_id: this.client_id,
            client_secret: this.client_secret,
            name: this.name,
            redirect_uris: this.redirect_uris,
            allowed_scopes: this.allowed_scopes,
            pkce_enabled: this.pkce_enabled,
            is_active: this.is_active,
            created_at: this.created_at,
            updated_at: this.updated_at,
            deleted_at: this.deleted_at,
        };
    }

    // Validation methods
    validateRedirectUri(uri: string): boolean {
        // Allow exact matches or pattern matching for deep links
        return this.redirect_uris.some(registeredUri => {
            if (registeredUri === uri) return true;
            // Support wildcard patterns
            if (registeredUri.includes('*')) {
                const pattern = registeredUri.replace(/\*/g, '.*');
                return new RegExp(`^${pattern}$`).test(uri);
            }
            return false;
        });
    }

    validateScopes(requestedScopes: string[]): { valid: boolean; invalidScopes: string[] } {
        const invalidScopes = requestedScopes.filter(
            scope => !this.allowed_scopes.includes(scope)
        );
        return {
            valid: invalidScopes.length === 0,
            invalidScopes,
        };
    }

    validateSecret(secret: string): boolean {
        return this.client_secret === secret;
    }

    // Getters
    get idValue(): string { return this.id; }
    get clientIdValue(): string { return this.client_id; }
    get clientSecretValue(): string { return this.client_secret; }
    get nameValue(): string { return this.name; }
    get redirectUrisValue(): string[] { return this.redirect_uris; }
    get allowedScopesValue(): string[] { return this.allowed_scopes; }
    get pkceEnabledValue(): boolean { return this.pkce_enabled; }
    get isActiveValue(): boolean { return this.is_active; }
    get createdAtValue(): Date { return this.created_at; }
    get updatedAtValue(): Date | undefined { return this.updated_at; }
    get deletedAtValue(): Date | undefined { return this.deleted_at; }

    // Setters
    updateName(name: string): void {
        this.name = name;
        this.updated_at = new Date();
    }

    updateRedirectUris(uris: string[]): void {
        this.redirect_uris = uris;
        this.updated_at = new Date();
    }

    updateAllowedScopes(scopes: string[]): void {
        this.allowed_scopes = scopes;
        this.updated_at = new Date();
    }

    deactivate(): void {
        this.is_active = false;
        this.deleted_at = new Date();
        this.updated_at = new Date();
    }

    activate(): void {
        this.is_active = true;
        this.deleted_at = undefined;
        this.updated_at = new Date();
    }
}
