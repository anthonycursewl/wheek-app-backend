import { Injectable, Inject } from '@nestjs/common';
import { OAuthClientRepository } from '../../domain/repos/oauth-client.repository';
import { OAuthClient } from '../../domain/entities/oauth-client.entity';
import { Transaction } from '@/src/contexts/shared/persistance/transactions';
import { PrismaService } from '@/src/shared/persistance/prisma.service';

@Injectable()
export class OAuthClientRepositoryAdapter implements OAuthClientRepository {
    constructor(
        @Inject(PrismaService)
        private readonly prisma: PrismaService,
    ) { }

    private mapPrismaToDomain(data: any): OAuthClient {
        return OAuthClient.fromPrimitives({
            id: data.id,
            client_id: data.client_id,
            client_secret: data.client_secret,
            name: data.name,
            redirect_uris: data.redirect_uris,
            allowed_scopes: data.allowed_scopes,
            pkce_enabled: data.pkce_enabled,
            is_active: data.is_active,
            created_at: data.created_at,
            updated_at: data.updated_at ?? undefined,
            deleted_at: data.deleted_at ?? undefined,
        });
    }

    async create(client: OAuthClient, tx?: Transaction): Promise<OAuthClient> {
        const dbClient = tx || this.prisma;
        const primitives = client.toPrimitives();

        const created = await dbClient.oauth_clients.create({
            data: {
                id: primitives.id,
                client_id: primitives.client_id,
                client_secret: primitives.client_secret,
                name: primitives.name,
                redirect_uris: primitives.redirect_uris,
                allowed_scopes: primitives.allowed_scopes,
                pkce_enabled: primitives.pkce_enabled,
                is_active: primitives.is_active,
                created_at: primitives.created_at,
            },
        });

        return this.mapPrismaToDomain(created);
    }

    async findById(id: string, tx?: Transaction): Promise<OAuthClient | null> {
        const dbClient = tx || this.prisma;

        const found = await dbClient.oauth_clients.findUnique({
            where: { id },
        });

        return found ? this.mapPrismaToDomain(found) : null;
    }

    async findByClientId(clientId: string, tx?: Transaction): Promise<OAuthClient | null> {
        const dbClient = tx || this.prisma;

        const found = await dbClient.oauth_clients.findFirst({
            where: { client_id: clientId },
        });

        return found ? this.mapPrismaToDomain(found) : null;
    }

    async update(client: OAuthClient, tx?: Transaction): Promise<OAuthClient> {
        const dbClient = tx || this.prisma;
        const primitives = client.toPrimitives();

        const updated = await dbClient.oauth_clients.update({
            where: { id: primitives.id },
            data: {
                name: primitives.name,
                redirect_uris: primitives.redirect_uris,
                allowed_scopes: primitives.allowed_scopes,
                pkce_enabled: primitives.pkce_enabled,
                is_active: primitives.is_active,
                updated_at: new Date(),
                deleted_at: primitives.deleted_at,
            },
        });

        return this.mapPrismaToDomain(updated);
    }

    async delete(id: string, tx?: Transaction): Promise<void> {
        const dbClient = tx || this.prisma;

        await dbClient.oauth_clients.delete({
            where: { id },
        });
    }

    async findAll(tx?: Transaction): Promise<OAuthClient[]> {
        const dbClient = tx || this.prisma;

        const clients = await dbClient.oauth_clients.findMany({
            where: { is_active: true },
        });

        return clients.map(client => this.mapPrismaToDomain(client));
    }
}
