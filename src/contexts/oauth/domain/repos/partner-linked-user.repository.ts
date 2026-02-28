import { PartnerLinkedUser } from '../entities/partner-linked-user.entity';
import { Transaction } from '@/src/contexts/shared/persistance/transactions';

export interface PartnerLinkedUserRepository {
    create(linkedUser: PartnerLinkedUser, tx?: Transaction): Promise<PartnerLinkedUser>;
    findById(id: string, tx?: Transaction): Promise<PartnerLinkedUser | null>;
    findByPartnerAndExternalUser(partnerId: string, externalUserId: string, tx?: Transaction): Promise<PartnerLinkedUser | null>;
    findByWheekUser(wheekUserId: string, tx?: Transaction): Promise<PartnerLinkedUser[]>;
    findByPartner(partnerId: string, tx?: Transaction): Promise<PartnerLinkedUser[]>;
    update(linkedUser: PartnerLinkedUser, tx?: Transaction): Promise<PartnerLinkedUser>;
    delete(id: string, tx?: Transaction): Promise<void>;
}

export const PARTNER_LINKED_USER_REPOSITORY = Symbol('PartnerLinkedUserRepository');
