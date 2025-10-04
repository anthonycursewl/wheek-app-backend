import { Module } from "@nestjs/common";
import { StoreController } from "./infraestructure/controllers/store.controller";
import { StoreRepositoryAdapter } from "./infraestructure/adapters/store.repository";
import { PrismaService } from "@shared/persistance/prisma.service";
import { STORE_REPOSITORY } from "./domain/repos/store.repository";
import { CreateStoreUseCase } from "./application/create-store.usecase";
import { UpdateStoreUseCase } from "./application/update-store.usecase";
import { FindByIdUseCase } from "./application/findby-id.usecase";
import { FindAllByIdUseCase } from "./application/findall-by-id.usecase";
import { ROLE_REPOSITORY } from "./domain/repos/role.repository";
import { RoleRepositoryAdapter } from "./infraestructure/adapters/role.repository";
import { GetRolesByStoreIdUseCase } from "./application/get-roles-by-store-id.usecase";
import { GetPermissionsUseCase } from "./application/get-permissions.usecase";
import { PERMISSION_REPOSITORY } from "./domain/repos/permission.repository";
import { PermissionRepositoryAdapter } from "./infraestructure/adapters/permission.repository";
import { CreateRoleUseCase } from "./application/create-role-usecase";
import { GetRoleByIdUseCase } from "./application/get-role-by-id.usecase";
import { UpdateRoleUseCase } from "./application/update-role.usecase";
import { SoftDeleteRoleUsecase } from "./application/soft-delete-role.usecase";

@Module({
    imports: [],
    controllers: [StoreController],
    providers: [
        PrismaService,
        {
            provide: STORE_REPOSITORY,
            useClass: StoreRepositoryAdapter,
        },
        {
            provide: ROLE_REPOSITORY,
            useClass: RoleRepositoryAdapter,
        },
        {
            provide: PERMISSION_REPOSITORY,
            useClass: PermissionRepositoryAdapter,
        },
        CreateStoreUseCase,
        UpdateStoreUseCase,
        FindByIdUseCase,
        FindAllByIdUseCase,
        GetRolesByStoreIdUseCase,
        GetPermissionsUseCase,
        CreateRoleUseCase,
        GetRoleByIdUseCase,
        UpdateRoleUseCase,
        SoftDeleteRoleUsecase
    ],
    exports: [],
})
export class StoresModule {}
