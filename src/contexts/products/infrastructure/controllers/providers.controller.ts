import { Controller, Post, UsePipes, ValidationPipe, Body, Get, Query, Put, Param, Delete, BadRequestException } from "@nestjs/common";
import { CreateProviderUseCase } from "../../application/providers/create-provider.usecase";
import { CreateProviderDto } from "../dtos/providers/create-provider.dto";
import { GetAllProvidersUseCase } from "../../application/providers/get-all-providers.usecase";
import { Permissions } from "@/src/common/decorators/permissions.decorator";
import { UpdateProviderUseCase } from "../../application/providers/update-provider.usecase";
import { UpdateProviderDTO } from "../dtos/providers/update-provider.dto";
import { SoftDeleteProviderUseCase } from "../../application/providers/soft-delete-provider.usecase";

@Controller('providers')
export class ProvidersController {
    constructor(
        private readonly createProviderUseCase: CreateProviderUseCase,
        private readonly getAllProvidersUseCase: GetAllProvidersUseCase,
        private readonly updateProviderUseCase: UpdateProviderUseCase,
        private readonly softDeleteProviderUseCase: SoftDeleteProviderUseCase
    ) {}

    @Post('create')
    @Permissions('provider:create', 'provider:update')
    @UsePipes(new ValidationPipe({ transform: true }))
    async create(@Body() provider: CreateProviderDto) {
        return this.createProviderUseCase.execute(provider);
    }

    @Get('all')
    @Permissions('provider:read')
    async getAllProviders(@Query() query: { store_id: string, skip: string, take: string }) {
        if (!query.store_id) throw new Error('Store ID is required')
        if (!query.skip || !query.take) query.skip = '0'; query.take = '10'

        return this.getAllProvidersUseCase.execute(query.store_id, parseInt(query.skip), parseInt(query.take))
    }

    @Put('update/:id')
    @Permissions('provider:update')
    async update(@Param('id') id: string, @Body() provider: UpdateProviderDTO) {
        return this.updateProviderUseCase.execute(id, provider);
    }

    @Delete('delete/:id')
    @Permissions('provider:delete')
    async delete(@Param('id') id: string) {
        if (!id) throw new BadRequestException('Provider ID is required')
        return this.softDeleteProviderUseCase.execute(id);
    }
    
}