import { Inject, Injectable } from "@nestjs/common";
import { ROLE_REPOSITORY, RoleRepository, RoleWithPermissions } from "../domain/repos/role.repository";
import { Role } from "@/src/contexts/users/domain/entitys/role.entity";
import { Result, failure, success } from "../../shared/ROP/result";
import { CreateRoleDto } from "../infraestructure/dtos/role.dto";
import { PERMISSION_REPOSITORY, PermissionRepository } from "../domain/repos/permission.repository";

@Injectable()
export class CreateRoleUseCase {
    constructor(
        @Inject(ROLE_REPOSITORY)
        private readonly roleRepository: RoleRepository,
        @Inject(PERMISSION_REPOSITORY)
        private readonly permissionRepository: PermissionRepository
    ) {}

    async execute(role: CreateRoleDto): Promise<Result<RoleWithPermissions, Error>> {
        try {
            const { permissions, ...roleData } = role;
            const roleDomain = Role.create(roleData);
            const permissionsIds = await this.permissionRepository.getAllPermissionsIds(permissions);
            const roleCreated = await this.roleRepository.create(roleDomain);
            const roleWithPermissions = await this.roleRepository.assignPermissions(roleCreated.getId(), permissionsIds);

            return success(roleWithPermissions);
        } catch (error) {
            return failure(error);
        }
    }
}