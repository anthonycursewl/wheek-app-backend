import { Injectable, Inject } from '@nestjs/common';
import { failure, Result, success } from '@/src/contexts/shared/ROP/result';
import { StoreRepository } from '../domain/repos/store.repository';
import { Store } from '../domain/entities/store.entity';
import { Transaction } from '@/src/contexts/shared/persistance/transactions';
import { STORE_REPOSITORY } from '../domain/repos/store.repository';
import { PrismaService } from '@shared/persistance/prisma.service';
import { DEFAULT_ROLES_PERMISSIONS } from '@/src/common/constants/roles.constants';
import { Role as RoleEnum } from '@/src/common/enums/roles.enum';

@Injectable()
export class CreateStoreUseCase {
    constructor(
        @Inject(STORE_REPOSITORY)
        private readonly storeRepository: StoreRepository,
        private readonly prisma: PrismaService,
    ) {}

    async execute(store: Store, tx?: Transaction): Promise<Result<Store, Error>> {
        try {
            const created = await this.storeRepository.create(store, tx);

            const storeId = created.getId();
            const ownerId = created.getOwner();

            await this.prisma.$transaction(async (prisma) => {
                let ownerRoleId: string | null = null;

                for (const roleName in DEFAULT_ROLES_PERMISSIONS) {
                    const roleData = DEFAULT_ROLES_PERMISSIONS[roleName as RoleEnum]

                    const newRole = await prisma.roles.create({
                        data: {
                            name: roleName,
                            description: roleData.description,
                            store_id: storeId,
                        },
                    });

                    if (roleName === RoleEnum.STORE_OWNER) {
                        ownerRoleId = newRole.id;
                    }

                    const permissionsToConnect = await prisma.permissions.findMany({
                        where: {
                            OR: roleData.permissions.map((p: string) => {
                                const [resource, action] = p.split(':');
                                return { resource, action };
                            }),
                        },
                        select: { id: true },
                    });

                    if (permissionsToConnect.length > 0) {
                        await prisma.role_permission.createMany({
                            data: permissionsToConnect.map(p => ({ role_id: newRole.id, permission_id: p.id }))
                        });
                    }
                }

                if (ownerRoleId) {
                    await prisma.user_roles.create({
                        data: {
                            user_id: ownerId,
                            role_id: ownerRoleId,
                            store_id: storeId,
                        },
                    });
                }
            });

            return success(created);
        } catch (error) {
            return failure(error as Error);
        }
    }
}
