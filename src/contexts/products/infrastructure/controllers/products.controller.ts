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
            ...productData,
            w_ficha: w_ficha
        });

        if (!result.isSuccess) {
            throw new BadRequestException(result.error?.message || 'Error al crear el producto');
        }

        const product = result.value.toPrimitive();
        return product;
    }

    @Get('get/all')
    @UsePipes(new ValidationPipe({ transform: true }))
    getAll(@Query() query: GetProductsDto) {
        return { data: [] };
    }
}