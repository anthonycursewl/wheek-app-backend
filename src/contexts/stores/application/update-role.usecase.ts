import { Inject, Injectable } from "@nestjs/common";
import { ROLE_REPOSITORY, RoleRepository } from "../domain/repos/role.repository";
import { PERMISSION_REPOSITORY, PermissionRepository } from "../domain/repos/permission.repository";
import { Role } from "../../users/domain/entitys/role.entity";
import { Result, failure, success } from "../../shared/ROP/result";
import { RoleWithPermissions } from "../domain/repos/role.repository";
import { UpdateRoleDto } from "../infraestructure/dtos/update-role.dto";
import { BadRequestException } from "@nestjs/common";

@Injectable()
export class UpdateRoleUseCase {
    constructor(
         @Inject(ROLE_REPOSITORY)
         private readonly roleRepository: RoleRepository,
         @Inject(PERMISSION_REPOSITORY)
         private readonly permissionRepository: PermissionRepository
    ) {}

    async execute(id: string, data: UpdateRoleDto, permissions?: string[]): Promise<Result<RoleWithPermissions, Error>> {
        try {
            if (!data.store_id) {
                return failure(new BadRequestException('Wheek | store_id es requerido.'));
            }
            const existingRoleResult = await this.roleRepository.findById(id, data.store_id);
            if (!existingRoleResult) {
                return failure(new Error('Wheek | Rol no encontrado.'));
            }

            const existingRole = Role.fromPrimitive(existingRoleResult);

            const updatedRolePrimitive = {
                ...existingRole.toPrimitive(),
                ...(data.name !== undefined && { name: data.name }),
                ...(data.description !== undefined && { description: data.description }),
                ...(data.store_id !== undefined && { store_id: data.store_id }),
                ...(data.is_active !== undefined && { is_active: data.is_active }),
                updated_at: new Date(),
            };

            if (permissions !== undefined) {
                const permissionsIds = await this.permissionRepository.getAllPermissionsIds(permissions);
                await this.roleRepository.assignPermissions(id, permissionsIds);
            }

            const roleUpdated = await this.roleRepository.update(id, data.store_id, Role.fromPrimitive(updatedRolePrimitive));
            return success(roleUpdated);
        } catch (error) {
            return failure(error);
        }
    }
}
