import { Injectable, Inject } from '@nestjs/common';
import { AuthorizationCodeRepository } from '../../domain/repos/authorization-code.repository';
import { AuthorizationCode } from '../../domain/entities/authorization-code.entity';
import { Transaction } from '@/src/contexts/shared/persistance/transactions';
import { PrismaService } from '@/src/shared/persistance/prisma.service';

@Injectable()
export class AuthorizationCodeRepositoryAdapter implements AuthorizationCodeRepository {
    constructor(
        @Inject(PrismaService)
        private readonly prisma: PrismaService,
    ) { }

    private mapPrismaToDomain(data: any): AuthorizationCode {
        return AuthorizationCode.fromPrimitives({
            id: data.id,
            code: data.code,
            client_id: data.client_id,
            user_id: data.user_id,
            redirect_uri: data.redirect_uri,
            scopes: data.scopes,
            code_challenge: data.code_challenge ?? undefined,
            code_challenge_method: data.code_challenge_method ?? undefined,
            state: data.state ?? undefined,
            expires_at: data.expires_at,
            used: data.used,
            created_at: data.created_at,
        });
    }

    async save(authCode: AuthorizationCode, tx?: Transaction): Promise<AuthorizationCode> {
        const dbClient = tx || this.prisma;
        const primitives = authCode.toPrimitives();

        const saved = await dbClient.oauth_authorization_codes.create({
            data: {
                id: primitives.id,
                code: primitives.code,
                client_id: primitives.client_id,
                user_id: primitives.user_id,
                redirect_uri: primitives.redirect_uri,
                scopes: primitives.scopes,
                code_challenge: primitives.code_challenge,
                code_challenge_method: primitives.code_challenge_method,
                state: primitives.state,
                expires_at: primitives.expires_at,
                used: primitives.used,
                created_at: primitives.created_at,
            },
        });

        return this.mapPrismaToDomain(saved);
    }

    async findByCode(code: string, tx?: Transaction): Promise<AuthorizationCode | null> {
        const dbClient = tx || this.prisma;

        const found = await dbClient.oauth_authorization_codes.findFirst({
            where: { code },
        });

        return found ? this.mapPrismaToDomain(found) : null;
    }

    async markAsUsed(code: string, tx?: Transaction): Promise<void> {
        const dbClient = tx || this.prisma;

        await dbClient.oauth_authorization_codes.updateMany({
            where: { code },
            data: { used: true },
        });
    }

    async deleteExpired(tx?: Transaction): Promise<number> {
        const dbClient = tx || this.prisma;

        const result = await dbClient.oauth_authorization_codes.deleteMany({
            where: {
                expires_at: { lt: new Date() },
            },
        });

        return result.count;
    }

    async deleteByUserId(userId: string, tx?: Transaction): Promise<void> {
        const dbClient = tx || this.prisma;

        await dbClient.oauth_authorization_codes.deleteMany({
            where: { user_id: userId },
        });
    }
}
