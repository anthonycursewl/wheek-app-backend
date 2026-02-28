import { v4 as uuidv4 } from 'uuid';
import * as crypto from 'crypto';

export interface PartnerPrimitive {
    id: string;
    name: string;
    api_key: string;
    allowed_ips: string[];
    permissions: string[];
    rate_limit: number;
    is_active: boolean;
    created_at: Date;
    updated_at?: Date;
    deleted_at?: Date;
    // New fields for linking with consent
    can_link_users: boolean;
    logo_url?: string;
    description?: string;
    allowed_redirect_uris: string[];
    default_scopes: string[];
    client_id?: string;
}

export class Partner {
    private constructor(
        private readonly id: string,
        private name: string,
        private readonly api_key: string,
        private allowed_ips: string[],
        private permissions: string[],
        private rate_limit: number,
        private is_active: boolean,
        private readonly created_at: Date,
        private updated_at?: Date,
        private deleted_at?: Date,
        // New fields for linking with consent
        private can_link_users: boolean = false,
        private logo_url?: string,
        private description?: string,
        private allowed_redirect_uris: string[] = [],
        private default_scopes: string[] = [],
        private client_id?: string,
    ) { }

    static create(data: {
        name: string;
        allowed_ips?: string[];
        permissions?: string[];
        rate_limit?: number;
        can_link_users?: boolean;
        logo_url?: string;
        description?: string;
        allowed_redirect_uris?: string[];
        default_scopes?: string[];
        client_id?: string;
    }): Partner {
        return new Partner(
            uuidv4(),
            data.name,
            `partner_key_${crypto.randomBytes(24).toString('hex')}`,
            data.allowed_ips || [],
            data.permissions || ['users:lookup', 'users:provision', 'users:status'],
            data.rate_limit || 100, // 100 requests per minute by default
            true,
            new Date(),
            undefined,
            undefined,
            data.can_link_users || false,
            data.logo_url,
            data.description,
            data.allowed_redirect_uris || [],
            data.default_scopes || [],
            data.client_id,
        );
    }

    static fromPrimitives(data: PartnerPrimitive): Partner {
        return new Partner(
            data.id,
            data.name,
            data.api_key,
            data.allowed_ips,
            data.permissions,
            data.rate_limit,
            data.is_active,
            data.created_at,
            data.updated_at,
            data.deleted_at,
            data.can_link_users,
            data.logo_url,
            data.description,
            data.allowed_redirect_uris,
            data.default_scopes,
            data.client_id,
        );
    }

    toPrimitives(): PartnerPrimitive {
        return {
            id: this.id,
            name: this.name,
            api_key: this.api_key,
            allowed_ips: this.allowed_ips,
            permissions: this.permissions,
            rate_limit: this.rate_limit,
            is_active: this.is_active,
            created_at: this.created_at,
            updated_at: this.updated_at,
            deleted_at: this.deleted_at,
            can_link_users: this.can_link_users,
            logo_url: this.logo_url,
            description: this.description,
            allowed_redirect_uris: this.allowed_redirect_uris,
            default_scopes: this.default_scopes,
            client_id: this.client_id,
        };
    }

    // Validation methods
    validateApiKey(key: string): boolean {
        return this.api_key === key && this.is_active;
    }

    validateIp(ip: string): boolean {
        // If no IPs are configured, allow all
        if (this.allowed_ips.length === 0) return true;

        // Check if IP is in allowed list
        return this.allowed_ips.some(allowedIp => {
            // Support CIDR notation in the future
            return allowedIp === ip;
        });
    }

    hasPermission(permission: string): boolean {
        return this.permissions.includes(permission);
    }

    // Getters
    get idValue(): string { return this.id; }
    get nameValue(): string { return this.name; }
    get apiKeyValue(): string { return this.api_key; }
    get allowedIpsValue(): string[] { return this.allowed_ips; }
    get permissionsValue(): string[] { return this.permissions; }
    get rateLimitValue(): number { return this.rate_limit; }
    get isActiveValue(): boolean { return this.is_active; }
    get createdAtValue(): Date { return this.created_at; }
    get updatedAtValue(): Date | undefined { return this.updated_at; }
    get deletedAtValue(): Date | undefined { return this.deleted_at; }

    // Setters
    updateName(name: string): void {
        this.name = name;
        this.updated_at = new Date();
    }

    updateAllowedIps(ips: string[]): void {
        this.allowed_ips = ips;
        this.updated_at = new Date();
    }

    updatePermissions(permissions: string[]): void {
        this.permissions = permissions;
        this.updated_at = new Date();
    }

    updateRateLimit(limit: number): void {
        this.rate_limit = limit;
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
