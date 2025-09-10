import { Inject, Injectable } from "@nestjs/common";
import { ROLE_REPOSITORY, RoleRepository } from "../domain/repos/role.repository";
import { PERMISSION_REPOSITORY, PermissionRepository } from "../domain/repos/permission.repository";
import { Role, RolePrimitive } from "../../users/domain/entitys/role.entity";
import { Result, failure, success } from "../../shared/ROP/result";
import { RoleWithPermissions } from "../domain/repos/role.repository";

@Injectable()
export class UpdateRoleUseCase {
    constructor(
         @Inject(ROLE_REPOSITORY)
         private readonly roleRepository: RoleRepository,
         @Inject(PERMISSION_REPOSITORY)
         private readonly permissionRepository: PermissionRepository
    ) {}

    async execute(id: string, role: Omit<RolePrimitive, 'id' | 'created_at' | 'updated_at' | 'deleted_at' | 'permissions'>, permissions: string[]): Promise<Result<RoleWithPermissions, Error>> {
        try {
            const permissionsIds = await this.permissionRepository.getAllPermissionsIds(permissions);
            await this.permissionRepository.assignPermissions(id, permissionsIds);

            const roleDomain = Role.update(role)
            const roleUpdated = await this.roleRepository.update(id, roleDomain);
            return success(roleUpdated);
        } catch (error) {
            return failure(error);
        }
    }
}