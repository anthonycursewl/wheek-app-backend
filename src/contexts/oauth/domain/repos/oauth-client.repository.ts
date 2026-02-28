import { OAuthClient } from '../entities/oauth-client.entity';
import { Transaction } from '@/src/contexts/shared/persistance/transactions';

export interface OAuthClientRepository {
    create(client: OAuthClient, tx?: Transaction): Promise<OAuthClient>;
    findById(id: string, tx?: Transaction): Promise<OAuthClient | null>;
    findByClientId(clientId: string, tx?: Transaction): Promise<OAuthClient | null>;
    update(client: OAuthClient, tx?: Transaction): Promise<OAuthClient>;
    delete(id: string, tx?: Transaction): Promise<void>;
    findAll(tx?: Transaction): Promise<OAuthClient[]>;
}

export const OAUTH_CLIENT_REPOSITORY = Symbol('OAuthClientRepository');
