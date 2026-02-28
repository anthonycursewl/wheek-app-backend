import { Injectable, Inject } from '@nestjs/common';
import { OAuthTokenRepository } from '../../domain/repos/oauth-token.repository';
import { OAuthToken } from '../../domain/entities/oauth-token.entity';
import { Transaction } from '@/src/contexts/shared/persistance/transactions';
import { PrismaService } from '@/src/shared/persistance/prisma.service';

@Injectable()
export class OAuthTokenRepositoryAdapter implements OAuthTokenRepository {
    constructor(
        @Inject(PrismaService)
        private readonly prisma: PrismaService,
    ) { }

    private mapPrismaToDomain(data: any): OAuthToken {
        return OAuthToken.fromPrimitives({
            id: data.id,
            access_token: data.access_token,
            refresh_token: data.refresh_token,
            client_id: data.client_id,
            user_id: data.user_id,
            scopes: data.scopes,
            access_token_expires_at: data.access_token_expires_at,
            refresh_token_expires_at: data.refresh_token_expires_at,
            revoked: data.revoked,
            created_at: data.created_at,
            updated_at: data.updated_at ?? undefined,
        });
    }

    async save(token: OAuthToken, tx?: Transaction): Promise<OAuthToken> {
        const dbClient = tx || this.prisma;
        const primitives = token.toPrimitives();

        const saved = await dbClient.oauth_tokens.create({
            data: {
                id: primitives.id,
                access_token: primitives.access_token,
                refresh_token: primitives.refresh_token,
                client_id: primitives.client_id,
                user_id: primitives.user_id,
                scopes: primitives.scopes,
                access_token_expires_at: primitives.access_token_expires_at,
                refresh_token_expires_at: primitives.refresh_token_expires_at,
                revoked: primitives.revoked,
                created_at: primitives.created_at,
            },
        });

        return this.mapPrismaToDomain(saved);
    }

    async findByAccessToken(accessToken: string, tx?: Transaction): Promise<OAuthToken | null> {
        const dbClient = tx || this.prisma;

        const found = await dbClient.oauth_tokens.findFirst({
            where: { access_token: accessToken },
        });

        return found ? this.mapPrismaToDomain(found) : null;
    }

    async findByRefreshToken(refreshToken: string, tx?: Transaction): Promise<OAuthToken | null> {
        const dbClient = tx || this.prisma;

        const found = await dbClient.oauth_tokens.findFirst({
            where: { refresh_token: refreshToken },
        });

        return found ? this.mapPrismaToDomain(found) : null;
    }

    async findByUserId(userId: string, tx?: Transaction): Promise<OAuthToken[]> {
        const dbClient = tx || this.prisma;

        const tokens = await dbClient.oauth_tokens.findMany({
            where: { user_id: userId, revoked: false },
        });

        return tokens.map(token => this.mapPrismaToDomain(token));
    }

    async revokeByAccessToken(accessToken: string, tx?: Transaction): Promise<void> {
        const dbClient = tx || this.prisma;

        await dbClient.oauth_tokens.updateMany({
            where: { access_token: accessToken },
            data: { revoked: true, updated_at: new Date() },
        });
    }

    async revokeByRefreshToken(refreshToken: string, tx?: Transaction): Promise<void> {
        const dbClient = tx || this.prisma;

        await dbClient.oauth_tokens.updateMany({
            where: { refresh_token: refreshToken },
            data: { revoked: true, updated_at: new Date() },
        });
    }

    async revokeAllByUserId(userId: string, tx?: Transaction): Promise<void> {
        const dbClient = tx || this.prisma;

        await dbClient.oauth_tokens.updateMany({
            where: { user_id: userId },
            data: { revoked: true, updated_at: new Date() },
        });
    }

    async revokeAllByClientId(clientId: string, tx?: Transaction): Promise<void> {
        const dbClient = tx || this.prisma;

        await dbClient.oauth_tokens.updateMany({
            where: { client_id: clientId },
            data: { revoked: true, updated_at: new Date() },
        });
    }

    async deleteExpired(tx?: Transaction): Promise<number> {
        const dbClient = tx || this.prisma;

        const result = await dbClient.oauth_tokens.deleteMany({
            where: {
                AND: [
                    { refresh_token_expires_at: { lt: new Date() } },
                    { revoked: true },
                ],
            },
        });

        return result.count;
    }
}
