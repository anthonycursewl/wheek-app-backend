import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ROLE_REPOSITORY, RoleRepository } from 'src/contexts/stores/domain/repos/role.repository';
import { Result, success, failure } from 'src/contexts/shared/ROP/result';
import { Role, RolePrimitive } from 'src/contexts/users/domain/entitys/role.entity';
import { RoleWithPermissions } from 'src/contexts/stores/domain/repos/role.repository';

@Injectable()
export class SoftDeleteRoleUsecase {
  constructor(
    @Inject(ROLE_REPOSITORY)
    private readonly roleRepository: RoleRepository
  ) {}

  async execute(
    id: string,
    storeId: string,
  ): Promise<Result<RoleWithPermissions, NotFoundException>> {
    try {
      const rolePrimitive = await this.roleRepository.findById(id, storeId);
  
      if (!rolePrimitive) {
        return failure(new NotFoundException(`Role with ID ${id} not found`));
      }
  
      const updatedRolePrimitive = { ...rolePrimitive, is_active: rolePrimitive.is_active ? false : true };
      const roleToUpdate = Role.update(updatedRolePrimitive);
  
      const updatedRole = await this.roleRepository.update(id, storeId, roleToUpdate);
      return success(updatedRole);
    } catch (error) {
      return failure(error);
    }
  }
}
