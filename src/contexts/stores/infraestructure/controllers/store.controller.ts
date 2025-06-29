// interfaces and common
import { BadRequestException, Body, Controller, Get, Param, Post } from "@nestjs/common";
import { StoreData } from "../../domain/entities/store.entity";
import { Store } from "../../domain/entities/store.entity";

import { Result } from '../../../shared/ROP/result'

// UseCases
import { CreateStoreUseCase } from "../../application/create-store.usecase";
import { UpdateStoreUseCase } from "../../application/update-store.usecase";
import { FindByIdUseCase } from "../../application/findby-id.usecase";
import { FindAllByIdUseCase } from "../../application/findall-by-id.usecase";

@Controller('stores')
export class StoreController {
    constructor(
        private readonly storeUseCase: CreateStoreUseCase,
        private readonly updateStoreUseCase: UpdateStoreUseCase,
        private readonly findByIdUseCase: FindByIdUseCase,
        private readonly findAllByIdUseCase: FindAllByIdUseCase
    ) {}

    @Post('create')
    async create(@Body() data: StoreData): Promise<Result<Store, Error>> {
        if (!data) {
            throw new BadRequestException('Wheek | Datos inválidos.');
        }
        const store = Store.create(data)
        const result = await this.storeUseCase.execute(store);

        if (!result.isSuccess) {
            throw new BadRequestException('Wheek | Ha ocurrido un error al crear la tienda.');
        }

        return result;
    }

    @Post('update')
    async update(@Body() data: StoreData): Promise<Result<Store, Error>> {
        if (!data) {
            throw new BadRequestException('Wheek | Datos inválidos.');
        }
        const store = Store.fromPrimitive(data)
        const result = await this.updateStoreUseCase.execute(store);

        if (!result.isSuccess) {
            throw new BadRequestException('Wheek | Ha ocurrido un error al actualizar la tienda.');
        }

        return result;
    }

    @Get('get/:id')
    async get(@Param('id') id: string): Promise<Result<Store | null, Error>> {
        if (!id) throw new BadRequestException('Wheek | ID Inválido.');

        const result = await this.findByIdUseCase.execute(id)
        if (!result.isSuccess) {
            throw new BadRequestException('Wheek | Ha ocurrido un error al obtener la tienda.');
        }

        return result;
    }

    @Get('get/all/:id')
    async getAll(@Param('id') id: string): Promise<Result<Store[], Error>> {
        if (!id) throw new BadRequestException('Wheek | ID Inválido.');
        const result = await this.findAllByIdUseCase.execute(id)

        if (!result.isSuccess) {
            throw new BadRequestException('Wheek | Ha ocurrido un error al obtener las tiendas.');
        }

        return result;
    }
}