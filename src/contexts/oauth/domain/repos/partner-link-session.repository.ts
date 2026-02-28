import { PartnerLinkSession } from '../entities/partner-link-session.entity';
import { Transaction } from '@/src/contexts/shared/persistance/transactions';

export interface PartnerLinkSessionRepository {
    create(session: PartnerLinkSession, tx?: Transaction): Promise<PartnerLinkSession>;
    findById(id: string, tx?: Transaction): Promise<PartnerLinkSession | null>;
    delete(id: string, tx?: Transaction): Promise<void>;
    deleteExpired(tx?: Transaction): Promise<number>;
}

export const PARTNER_LINK_SESSION_REPOSITORY = Symbol('PartnerLinkSessionRepository');
