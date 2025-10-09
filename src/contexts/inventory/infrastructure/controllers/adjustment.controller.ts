import { 
    BadRequestException, 
    Body, 
    Controller, 
    Get, 
    Post, 
    Query, 
    UsePipes, 
    ValidationPipe, 
    HttpStatus, 
    UseInterceptors
} from '@nestjs/common';
import { AdjustProductsUseCase } from "../../application/adjust-products.usecase";
import { GetAllAdjustmentsUseCase } from "../../application/get-all-adjustments.usecase";
import { AdjustProductsDto } from "../dtos/adjust-products.dto";
import { FilterGetAdjustmentsDto } from "../dtos/filter-get-adjustments.dto";
import { AdjustmentCriteriaBuilder } from "../../builders/adjustment-criteria.builder";
import { AdjustmentReportRangeDto } from "../dtos/adjusment-report-range.dto";
import { GenerateAdjusmentReportRangeUseCase } from "../../application/generate-adjusment-report-range.usecase";
import { Permissions } from "@/src/common/decorators/permissions.decorator";
import { ValidationError } from 'class-validator';
import { PdfResponseInterceptor } from '@/src/contexts/receptions/infrastructure/interceptors/pdf-response.interceptor';

@Controller('adjustments')
export class AdjustmentController {
    constructor(
        private readonly createAdjustmentUseCase: AdjustProductsUseCase,
        private readonly getAllAdjustmentsUseCase: GetAllAdjustmentsUseCase,
        private readonly adjustmentCriteriaBuilder: AdjustmentCriteriaBuilder,
        private readonly generateAdjusmentReportRangeUseCase: GenerateAdjusmentReportRangeUseCase
    ) {}
    @Post('create')
    @Permissions('adjustment:create')
    async createAdjustment(
        @Query('store_id') store_id: string,
        @Body() adjustProductsDto: AdjustProductsDto
    ) {
        const result = await this.createAdjustmentUseCase.execute(store_id, adjustProductsDto);
        if (!result.isSuccess) throw new BadRequestException(result.error.message);
        return result;
    }

    @Get('get/all')
    @Permissions('adjustment:read')
    async getAllAdjustments(
        @Query() filters: FilterGetAdjustmentsDto
    ) {
        const { where, orderBy } = this.adjustmentCriteriaBuilder.build(filters);
        const s = Number(filters.skip);
        const t = Number(filters.take);

        const result = await this.getAllAdjustmentsUseCase.execute(filters.store_id, s, t, where, orderBy);
        if (!result.isSuccess) throw new BadRequestException(result.error.message);
        return result;
    }

    @Get('report/range')
    @Permissions('adjustment:report')
    @UsePipes(new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
        exceptionFactory: (errors: ValidationError[]) => {
            const formattedErrors = errors.map(error => ({
                field: error.property,
                errors: error.constraints ? Object.values(error.constraints) : ['Error de validación'],
                value: error.value
            }));
            
            throw new BadRequestException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: 'Error de validación en los parámetros de la solicitud',
                errors: formattedErrors,
                timestamp: new Date().toISOString(),
                path: '/adjustments/report/range'
            });
        }
    }))

    @Permissions('adjustment:report')
    @UseInterceptors(PdfResponseInterceptor)
    async generateAdjusmentReportRange(
        @Query() adjustmentReportRangeDto: AdjustmentReportRangeDto
    ) {
        const startDate = new Date(adjustmentReportRangeDto.startDate_range);
        const endDate = new Date(adjustmentReportRangeDto.endDate_range);

        const result = await this.generateAdjusmentReportRangeUseCase.execute(
            adjustmentReportRangeDto.store_id, 
            startDate, 
            endDate
        );
        
        if (!result.isSuccess) {
            throw new BadRequestException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: result.error.message,
                timestamp: new Date().toISOString(),
                path: '/adjustments/report/range'
            });
        }

        return result.value;
    }
}
