import { Controller, Post, UsePipes, ValidationPipe, Body, Get, Query } from "@nestjs/common";
import { CreateProviderUseCase } from "../../application/providers/create-provider.usecase";
import { CreateProviderDto } from "../dtos/providers/create-provider.dto";
import { GetAllProvidersUseCase } from "../../application/providers/get-all-providers.usecase";
import { Permissions } from "@/src/common/decorators/permissions.decorator";

@Controller('providers')
export class ProvidersController {
    constructor(
        private readonly createProviderUseCase: CreateProviderUseCase,
        private readonly getAllProvidersUseCase: GetAllProvidersUseCase
    ) {}

    @Post('create')
    @Permissions('provider:create')
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
}