import { Controller, Post, Body, UsePipes, ValidationPipe, UseGuards, BadRequestException, Get, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CreateProductUseCase } from '../../application/products/create-product.usecase';
import { CreateProductDto } from '../dtos/products/create-product.dto';
import { GetProductsDto } from '../dtos/products/get-products.dto';

@Controller('products')
export class ProductController {
    constructor(
        private readonly createProductUseCase: CreateProductUseCase
    ) {}

    @Post('create')
    @UsePipes(new ValidationPipe({ transform: true }))
    @UseGuards(AuthGuard('jwt'))
    async create(@Body() createProductDto: CreateProductDto) {
        const { w_ficha, ...productData } = createProductDto;
        
        const result = await this.createProductUseCase.execute({
            id: productData.id,
            name: productData.name,
            barcode: productData.barcode,
            store_id: productData.store_id,
            provider_id: productData.provider_id,
            category_id: productData.category_id,
            w_ficha: w_ficha ? {
                id: '',
                condition: w_ficha.condition,
                cost: w_ficha.cost,
                benchmark: w_ficha.benchmark,
                tax: w_ficha.tax,
                product_id: productData.id
            } : null
        });

        if (!result.isSuccess) {
            throw new BadRequestException(result.error?.message || 'Error al crear el producto');
        }

        const { id, barcode, name, store_id, created_at, provider_id, category_id, w_ficha: ficha } = result.value.toPrimitive();
        
        return {
            id,
            barcode,
            name,
            store_id,
            created_at,
            provider_id,
            category_id,
            w_ficha: ficha
        };
    }

    @Get('get/all')
    @UsePipes(new ValidationPipe({ transform: true }))
    getAll(@Query() query: GetProductsDto) {
        return { data: [] };
    }
}