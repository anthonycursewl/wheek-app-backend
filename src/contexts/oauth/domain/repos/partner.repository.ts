import { Partner } from '../entities/partner.entity';
import { Transaction } from '@/src/contexts/shared/persistance/transactions';

export interface PartnerRepository {
    create(partner: Partner, tx?: Transaction): Promise<Partner>;
    findById(id: string, tx?: Transaction): Promise<Partner | null>;
    findByApiKey(apiKey: string, tx?: Transaction): Promise<Partner | null>;
    findByName(name: string, tx?: Transaction): Promise<Partner | null>;
    update(partner: Partner, tx?: Transaction): Promise<Partner>;
    delete(id: string, tx?: Transaction): Promise<void>;
    findAll(tx?: Transaction): Promise<Partner[]>;
}

export const PARTNER_REPOSITORY = Symbol('PartnerRepository');
