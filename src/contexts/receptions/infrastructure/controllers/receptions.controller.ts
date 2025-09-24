import { Permissions } from "@/src/common/decorators/permissions.decorator";
import { Body, Controller, Post, UsePipes, ValidationPipe, BadRequestException, Get, Query, Delete, Param } from "@nestjs/common";
import { CreateReceptionDto } from "../dtos/create-reception.dto";
import { CreateReceptionUseCase } from "../../application/create-reception.usecase";
import { ReceptionsWithItems } from "../../domain/repos/reception.repository";
import { Result } from "@/src/contexts/shared/ROP/result";
import { GetAllReceptionsUseCase } from "../../application/get-receptions.usecase";
import { FilterAllReceptionDto } from "../dtos/filter-receptions.dto";
import { DeleteReceptionUseCase } from "../../application/delete-reception.usecase";

@Controller('receptions') 
export class ReceptionsController {
    constructor(
        private readonly createReceptionUseCase: CreateReceptionUseCase,
        private readonly getAllReceptionsUseCase: GetAllReceptionsUseCase,
        private readonly deleteReceptionUseCase: DeleteReceptionUseCase
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
    async getAll(
        @Query('store_id') store_id: string, @Query('skip') skip: string = '0', @Query('take') take: string = '10',
        @Query() filters: FilterAllReceptionDto
        ): Promise<Result<ReceptionsWithItems[], Error>> {

            const skipNumber = Number(skip)
            const takeNumber = Number(take)
            const result = await this.getAllReceptionsUseCase.execute(store_id, skipNumber, takeNumber, filters)
            
            if (!result.isSuccess) throw new BadRequestException(result.error.message)
            return result
    }

    @Delete('delete/:id')
    @Permissions('product:delete')
    async delete(
        @Param('id') id: string,
        @Query('isSoft_delete') isSoft_delete: string
    ): Promise<Result<ReceptionsWithItems, Error>> {
        const typeDelete = isSoft_delete === 'true'
        console.log(`Tipo de delete en la base de datos: ${typeDelete}`)
        const result = await this.deleteReceptionUseCase.execute(id, typeDelete)
        if (!result.isSuccess) throw new BadRequestException(result.error.message)
        return result
    }
}
