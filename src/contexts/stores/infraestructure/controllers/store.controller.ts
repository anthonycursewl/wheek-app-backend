// interfaces and common
import { BadRequestException, Body, Controller, Delete, Get, Param, Post, Put, Query } from "@nestjs/common";
import { StoreData } from "../../domain/entities/store.entity";
import { Store } from "../../domain/entities/store.entity";

import { Result } from '../../../shared/ROP/result'

// UseCases
import { CreateStoreUseCase } from "../../application/create-store.usecase";
import { UpdateStoreUseCase } from "../../application/update-store.usecase";
import { FindByIdUseCase } from "../../application/findby-id.usecase";
import { FindAllByIdUseCase } from "../../application/findall-by-id.usecase";
import { Permissions } from "@/src/common/decorators/permissions.decorator";
import { GetRolesByStoreIdUseCase } from "../../application/get-roles-by-store-id.usecase";
import { RoleAllData, RoleWithPermissions } from "../../domain/repos/role.repository";
import { Permission } from "@/src/contexts/users/domain/entitys/permission.entity";
import { GetPermissionsUseCase } from "../../application/get-permissions.usecase";
import { CreateRoleUseCase } from "../../application/create-role-usecase";

// DTOs
import { RoleDto } from "../dtos/role.dto";
import { UpdateRoleDto } from "../dtos/update-role.dto";
import { GetRoleByIdUseCase } from "../../application/get-role-by-id.usecase";
import { UpdateRoleUseCase } from "../../application/update-role.usecase";
import { SoftDeleteRoleUsecase } from "../../application/soft-delete-role.usecase";

@Controller('stores')
export class StoreController {
    constructor(
        private readonly storeUseCase: CreateStoreUseCase,
        private readonly updateStoreUseCase: UpdateStoreUseCase,
        private readonly findByIdUseCase: FindByIdUseCase,
        private readonly findAllByIdUseCase: FindAllByIdUseCase,
        private readonly getRolesByStoreIdUseCase: GetRolesByStoreIdUseCase,
        private readonly getPermissionsUseCase: GetPermissionsUseCase,
        private readonly createRoleUseCase: CreateRoleUseCase,
        private readonly getRoleByIdUseCase: GetRoleByIdUseCase,
        private readonly updateRoleUseCase: UpdateRoleUseCase,
        private readonly softDeleteRoleUsecase: SoftDeleteRoleUsecase
    ) {}

    @Post('create')
    async create(@Body() data: StoreData): Promise<Result<Store, Error>> {
        if (!data) {
            throw new BadRequestException('Wheek | Datos inválidos.');
        }
        const store = Store.create(data)
        const result = await this.storeUseCase.execute(store);

        if (!result.isSuccess) throw new BadRequestException('Wheek | Ha ocurrido un error al crear la tienda.');
        return result;
    }

    @Post('create/role')
    @Permissions('role:manage')
    async createRole(@Body() data: RoleDto) {
        const r = await this.createRoleUseCase.execute(data)
        if (!r.isSuccess) throw new BadRequestException(`Wheek | ${r.error.message}`);
        return r;
    }

    @Post('update')
    async update(@Body() data: StoreData): Promise<Result<Store, Error>> {
        if (!data) {
            throw new BadRequestException('Wheek | Datos inválidos.');
        }
        const store = Store.fromPrimitive(data)
        const result = await this.updateStoreUseCase.execute(store);

        if (!result.isSuccess) throw new BadRequestException('Wheek | Ha ocurrido un error al actualizar la tienda.');
        return result;
    }

    @Put('update/role/:id')
    async updateRole(@Param('id') id: string, @Body() data: UpdateRoleDto) {
        if (!id) throw new BadRequestException('Wheek | ID Inválido.');
        if (!data.store_id) throw new BadRequestException('Wheek | store_id es requerido en el body.');
        const r = await this.updateRoleUseCase.execute(id, data, data.permissions)
        if (!r.isSuccess) throw new BadRequestException(`Wheek | ${r.error.message}`);
        return r;
    }

    @Delete('delete/role/:id')
    @Permissions('role:manage')
    async softDeleteRole(
        @Param('id') id: string,
        @Query('store_id') store_id: string, // store_id is captured but not used in the use case directly
    ) {
        if (!id) throw new BadRequestException('Wheek | ID Inválido.');
        if (!store_id) throw new BadRequestException('Wheek | store_id es requerido.');
        const r = await this.softDeleteRoleUsecase.execute(id, store_id);
        if (!r.isSuccess) throw new BadRequestException(`Wheek | ${r.error.message}`);
        return r;
    }

    @Get('get/:id')
    async get(@Param('id') id: string): Promise<Result<Store | null, Error>> {
        if (!id) throw new BadRequestException('Wheek | ID Inválido.');

        const result = await this.findByIdUseCase.execute(id)
        if (!result.isSuccess) throw new BadRequestException('Wheek | Ha ocurrido un error al obtener la tienda.');
        return result;
    }

    @Get('get/all/:id')
    async getAll(@Param('id') id: string): Promise<Result<Store[], Error>> {
        if (!id) throw new BadRequestException('Wheek | ID Inválido.');
        const result = await this.findAllByIdUseCase.execute(id)
        if (!result.isSuccess) throw new BadRequestException('Wheek | Ha ocurrido un error al obtener las tiendas.');
        return result;
    }

    @Get('get/roles/all')
    @Permissions('role:manage')
    async getRoles(
        @Query('store_id') store_id: string,
        @Query('skip') skip: string = '0',
        @Query('take') take: string = '10'
    ): Promise<Result<RoleWithPermissions[], Error>> {
        const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
        if (!store_id || !uuidRegex.test(store_id)) {
            throw new BadRequestException('Wheek | El ID de la tienda debe ser un UUID válido.');
        }

        const skipNum = parseInt(skip, 10);
        const takeNum = parseInt(take, 10);
        
        if (isNaN(skipNum) || isNaN(takeNum) || skipNum < 0 || takeNum < 1) {
            throw new BadRequestException('Wheek | Los parámetros skip y take deben ser números válidos.');
        }

        const result = await this.getRolesByStoreIdUseCase.execute(store_id, skipNum, takeNum);
        if (!result.isSuccess) throw new BadRequestException(`Wheek | ${result.error.message}`);
        return result;
    }

    @Get('get/roles/:id')
    @Permissions('role:manage')
    async getRole(@Param('id') id: string): Promise<Result<RoleAllData, Error>> {
        if (!id) throw new BadRequestException('Wheek | ID Inválido.');
        const result = await this.getRoleByIdUseCase.execute(id);
        if (!result.isSuccess) throw new BadRequestException(`Wheek | ${result.error.message}`);
        return result;
    }

    @Get('get/permissions/all')
    @Permissions('role:manage')
    async getPermissions(): Promise<Result<Permission[], Error>> {
        const result = await this.getPermissionsUseCase.execute();
        if (!result.isSuccess) throw new BadRequestException(`Wheek | ${result.error.message}`);
        return result;
    }
}
