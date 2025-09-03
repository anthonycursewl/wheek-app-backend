import { Inject, Injectable } from "@nestjs/common";
import { Permission } from "../../users/domain/entitys/permission.entity";
import { failure, Result, success } from "../../shared/ROP/result";
import { PERMISSION_REPOSITORY } from "../domain/repos/permission.repository";
import { PermissionRepository } from "../domain/repos/permission.repository";

@Injectable()
export class GetPermissionsUseCase {
    constructor(
        @Inject(PERMISSION_REPOSITORY)
        private readonly permissionRepository: PermissionRepository
    ) {}

    async execute(): Promise<Result<Permission[], Error>> {
        try {
            const permissions = await this.permissionRepository.findAllPermissions();
            return success(permissions);
        } catch (error) {
            return failure(error as Error);
        }
    }
}