import { AuthorizationCode } from '../entities/authorization-code.entity';
import { Transaction } from '@/src/contexts/shared/persistance/transactions';

export interface AuthorizationCodeRepository {
    save(authCode: AuthorizationCode, tx?: Transaction): Promise<AuthorizationCode>;
    findByCode(code: string, tx?: Transaction): Promise<AuthorizationCode | null>;
    markAsUsed(code: string, tx?: Transaction): Promise<void>;
    deleteExpired(tx?: Transaction): Promise<number>;
    deleteByUserId(userId: string, tx?: Transaction): Promise<void>;
}

export const AUTHORIZATION_CODE_REPOSITORY = Symbol('AuthorizationCodeRepository');
