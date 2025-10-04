import { Controller, Post, UsePipes, ValidationPipe, Body, Get, Query, Put, Param, Delete, BadRequestException } from "@nestjs/common";
import { CreateProviderUseCase } from "../../application/providers/create-provider.usecase";
import { CreateProviderDto } from "../dtos/providers/create-provider.dto";
import { GetAllProvidersUseCase } from "../../application/providers/get-all-providers.usecase";
import { Permissions } from "@/src/common/decorators/permissions.decorator";
import { UpdateProviderUseCase } from "../../application/providers/update-provider.usecase";
import { UpdateProviderDTO } from "../dtos/providers/update-provider.dto";
import { SoftDeleteProviderUseCase } from "../../application/providers/soft-delete-provider.usecase"; // Re-add this import
import { FilterAllProviderDto } from "../dtos/providers/filter-all-provider.dto";
import { GetAllProvidersQueryDto } from "../dtos/providers/get-all-providers-query.dto";
import { ProviderQueryDto } from "../dtos/providers/provider-query.dto";

@Controller('providers')
export class ProvidersController {
    constructor(
        private readonly createProviderUseCase: CreateProviderUseCase,
        private readonly getAllProvidersUseCase: GetAllProvidersUseCase,
        private readonly updateProviderUseCase: UpdateProviderUseCase,
        private readonly softDeleteProviderUseCase: SoftDeleteProviderUseCase // Re-inject this
    ) {}

    @Post('create')
    @Permissions('provider:create', 'provider:update')
    @UsePipes(new ValidationPipe({ transform: true }))
    async create(@Body() provider: CreateProviderDto) {
        return this.createProviderUseCase.execute(provider);
    }

    @Get('all')
    @Permissions('provider:read')
    async getAllProviders(
        @Query() query: GetAllProvidersQueryDto
    ) {
        if (!query.store_id) throw new Error('Store ID is required')
        const skip = query.skip ? parseInt(query.skip) : 0;
        const take = query.take ? parseInt(query.take) : 10;

        return this.getAllProvidersUseCase.execute(query.store_id, skip, take, query)
    }

    @Put('update/:id')
    @Permissions('provider:update')
    async update(
        @Param('id') id: string,
        @Query() query: ProviderQueryDto,
        @Body() provider: UpdateProviderDTO
    ) {
        const providerWithStoreId = { ...provider, store_id: query.store_id };
        return this.updateProviderUseCase.execute(id, providerWithStoreId);
    }

    @Delete('delete/:id')
    @Permissions('provider:delete')
    async delete(@Param('id') id: string) {
        if (!id) throw new BadRequestException('Provider ID is required');
        return this.softDeleteProviderUseCase.execute(id);
    }
    
}
