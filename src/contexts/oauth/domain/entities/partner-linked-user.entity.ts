import { v4 as uuidv4 } from 'uuid';

export interface PartnerLinkedUserPrimitive {
    id: string;
    partner_id: string;
    external_user_id: string;
    wheek_user_id: string;
    external_email?: string;
    external_name?: string;
    created_at: Date;
    updated_at?: Date;
    last_token_at?: Date;
}

export class PartnerLinkedUser {
    private constructor(
        private readonly id: string,
        private readonly partner_id: string,
        private readonly external_user_id: string,
        private readonly wheek_user_id: string,
        private external_email: string | undefined,
        private external_name: string | undefined,
        private readonly created_at: Date,
        private updated_at: Date | undefined,
        private last_token_at: Date | undefined,
    ) { }

    static create(data: {
        partner_id: string;
        external_user_id: string;
        wheek_user_id: string;
        external_email?: string;
        external_name?: string;
    }): PartnerLinkedUser {
        return new PartnerLinkedUser(
            uuidv4(),
            data.partner_id,
            data.external_user_id,
            data.wheek_user_id,
            data.external_email,
            data.external_name,
            new Date(),
            undefined,
            undefined,
        );
    }

    static fromPrimitives(data: PartnerLinkedUserPrimitive): PartnerLinkedUser {
        return new PartnerLinkedUser(
            data.id,
            data.partner_id,
            data.external_user_id,
            data.wheek_user_id,
            data.external_email,
            data.external_name,
            data.created_at,
            data.updated_at,
            data.last_token_at,
        );
    }

    toPrimitives(): PartnerLinkedUserPrimitive {
        return {
            id: this.id,
            partner_id: this.partner_id,
            external_user_id: this.external_user_id,
            wheek_user_id: this.wheek_user_id,
            external_email: this.external_email,
            external_name: this.external_name,
            created_at: this.created_at,
            updated_at: this.updated_at,
            last_token_at: this.last_token_at,
        };
    }

    updateLastTokenAt(): void {
        this.last_token_at = new Date();
        this.updated_at = new Date();
    }

    // Getters
    get idValue(): string { return this.id; }
    get partnerIdValue(): string { return this.partner_id; }
    get externalUserIdValue(): string { return this.external_user_id; }
    get wheekUserIdValue(): string { return this.wheek_user_id; }
    get externalEmailValue(): string | undefined { return this.external_email; }
    get externalNameValue(): string | undefined { return this.external_name; }
    get createdAtValue(): Date { return this.created_at; }
    get updatedAtValue(): Date | undefined { return this.updated_at; }
    get lastTokenAtValue(): Date | undefined { return this.last_token_at; }
}
