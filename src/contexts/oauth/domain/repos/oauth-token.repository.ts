import { OAuthToken } from '../entities/oauth-token.entity';
import { Transaction } from '@/src/contexts/shared/persistance/transactions';

export interface OAuthTokenRepository {
    save(token: OAuthToken, tx?: Transaction): Promise<OAuthToken>;
    findByAccessToken(accessToken: string, tx?: Transaction): Promise<OAuthToken | null>;
    findByRefreshToken(refreshToken: string, tx?: Transaction): Promise<OAuthToken | null>;
    findByUserId(userId: string, tx?: Transaction): Promise<OAuthToken[]>;
    revokeByAccessToken(accessToken: string, tx?: Transaction): Promise<void>;
    revokeByRefreshToken(refreshToken: string, tx?: Transaction): Promise<void>;
    revokeAllByUserId(userId: string, tx?: Transaction): Promise<void>;
    revokeAllByClientId(clientId: string, tx?: Transaction): Promise<void>;
    deleteExpired(tx?: Transaction): Promise<number>;
}

export const OAUTH_TOKEN_REPOSITORY = Symbol('OAuthTokenRepository');
