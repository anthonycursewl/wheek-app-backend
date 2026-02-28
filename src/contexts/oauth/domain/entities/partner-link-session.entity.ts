import { v4 as uuidv4 } from 'uuid';

export interface PartnerLinkSessionPrimitive {
    id: string;
    partner_id: string;
    client_id: string;
    redirect_uri: string;
    external_user_id: string;
    external_email?: string;
    external_name?: string;
    state: string;
    expires_at: Date;
    created_at: Date;
}

export class PartnerLinkSession {
    private constructor(
        private readonly id: string,
        private readonly partner_id: string,
        private readonly client_id: string,
        private readonly redirect_uri: string,
        private readonly external_user_id: string,
        private readonly external_email: string | undefined,
        private readonly external_name: string | undefined,
        private readonly state: string,
        private readonly expires_at: Date,
        private readonly created_at: Date,
    ) { }

    static create(data: {
        partner_id: string;
        client_id: string;
        redirect_uri: string;
        external_user_id: string;
        external_email?: string;
        external_name?: string;
        state: string;
        expires_in_minutes?: number;
    }): PartnerLinkSession {
        const expiresInMs = (data.expires_in_minutes || 10) * 60 * 1000;

        return new PartnerLinkSession(
            uuidv4(),
            data.partner_id,
            data.client_id,
            data.redirect_uri,
            data.external_user_id,
            data.external_email,
            data.external_name,
            data.state,
            new Date(Date.now() + expiresInMs),
            new Date(),
        );
    }

    static fromPrimitives(data: PartnerLinkSessionPrimitive): PartnerLinkSession {
        return new PartnerLinkSession(
            data.id,
            data.partner_id,
            data.client_id,
            data.redirect_uri,
            data.external_user_id,
            data.external_email,
            data.external_name,
            data.state,
            data.expires_at,
            data.created_at,
        );
    }

    toPrimitives(): PartnerLinkSessionPrimitive {
        return {
            id: this.id,
            partner_id: this.partner_id,
            client_id: this.client_id,
            redirect_uri: this.redirect_uri,
            external_user_id: this.external_user_id,
            external_email: this.external_email,
            external_name: this.external_name,
            state: this.state,
            expires_at: this.expires_at,
            created_at: this.created_at,
        };
    }

    isExpired(): boolean {
        return this.expires_at < new Date();
    }

    // Getters
    get idValue(): string { return this.id; }
    get partnerIdValue(): string { return this.partner_id; }
    get clientIdValue(): string { return this.client_id; }
    get redirectUriValue(): string { return this.redirect_uri; }
    get externalUserIdValue(): string { return this.external_user_id; }
    get externalEmailValue(): string | undefined { return this.external_email; }
    get externalNameValue(): string | undefined { return this.external_name; }
    get stateValue(): string { return this.state; }
    get expiresAtValue(): Date { return this.expires_at; }
    get createdAtValue(): Date { return this.created_at; }
}
