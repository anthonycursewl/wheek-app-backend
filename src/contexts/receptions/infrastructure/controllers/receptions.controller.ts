import { Permissions } from "@/src/common/decorators/permissions.decorator";
import { Body, Controller, Post, UsePipes, ValidationPipe, BadRequestException, Get, Query } from "@nestjs/common";
import { CreateReceptionDto } from "../dtos/create-reception.dto";
import { CreateReceptionUseCase } from "../../application/create-reception.usecase";
import { Reception, ReceptionsWithItems } from "../../domain/repos/reception.repository";
import { Result } from "@/src/contexts/shared/ROP/result";
import { GetAllReceptionsUseCase } from "../../application/get-receptions.usecase";

@Controller('receptions') 
export class ReceptionsController {
    constructor(
        private readonly createReceptionUseCase: CreateReceptionUseCase,
        private readonly getAllReceptionsUseCase: GetAllReceptionsUseCase
    ) {}

    @Post('create')
    @Permissions('product:create')
    @UsePipes(new ValidationPipe({
        whitelist: false,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
            enableImplicitConversion: true,
        },
        exceptionFactory: (errors) => {
            console.log('Validation errors:', JSON.stringify(errors, null, 2));
            const errorMessages = errors.map(error => ({
                field: error.property,
                message: Object.values(error.constraints || {}).join(', '),
            }));
            return new BadRequestException({
                isSuccess: false,
                message: errorMessages,
            });
        },
    }))
    async create(@Body() reception: CreateReceptionDto): Promise<Result<ReceptionsWithItems, Error>> {
        const result = await this.createReceptionUseCase.execute(reception)
        if (!result.isSuccess) {
            throw new BadRequestException(result.error.message)
        }

        return result
    }

    @Get('get/all')
    @Permissions('product:read')
    async getAll(@Query('store_id') store_id: string, @Query('skip') skip: string = '0', @Query('take') take: string = '10'): Promise<Result<ReceptionsWithItems[], Error>> {
        const skipNumber = Number(skip)
        const takeNumber = Number(take)
        const result = await this.getAllReceptionsUseCase.execute(store_id, skipNumber, takeNumber)
        if (!result.isSuccess) {
            throw new BadRequestException(result.error.message)
        }

        return result
    }
}
