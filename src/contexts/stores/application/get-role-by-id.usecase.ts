import { Inject, Injectable } from "@nestjs/common";
import { RoleRepositoryAdapter } from "../infraestructure/adapters/role.repository";
import { ROLE_REPOSITORY, RoleAllData } from "../domain/repos/role.repository";
import { Result, failure, success } from "../../shared/ROP/result";

@Injectable()
export class GetRoleByIdUseCase {
    constructor(
        @Inject(ROLE_REPOSITORY)
        private readonly roleRepository: RoleRepositoryAdapter
    ) {}

    async execute(id: string): Promise<Result<RoleAllData, Error>> {
        try {
            const role = await this.roleRepository.findUnique(id);
            if (!role) {
                throw new Error('Wheek | Role not found');
            }
            return success(role);   
        } catch (error) {
            return failure(error);
        }
    }
}