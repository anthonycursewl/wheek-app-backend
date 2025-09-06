import { Inject, Injectable } from "@nestjs/common";
import { Result, failure, success } from "../../shared/ROP/result";
import { Role } from "@/src/contexts/users/domain/entitys/role.entity";
import { ROLE_REPOSITORY, RoleWithPermissions } from "../domain/repos/role.repository";
import { RoleRepository } from "../domain/repos/role.repository";

@Injectable()
export class GetRolesByStoreIdUseCase {
    constructor(
        @Inject(ROLE_REPOSITORY)
        private readonly roleRepository: RoleRepository
    ) {}

    async execute(store_id: string, skip: number, take: number): Promise<Result<RoleWithPermissions[], Error>> {
        try {
            const roles = await this.roleRepository.findAllByStoreId(store_id, skip, take);
            return success(roles);
        } catch (error) {
            return failure(new Error('Error inesperado al obtener los roles'));
        }
    }
}
