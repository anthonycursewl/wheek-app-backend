import { Controller, Post, Body, BadRequestException, Get, Query, Delete, Param } from '@nestjs/common';
import { CurrentUser } from '@/src/common/decorators/current-user.decorator';
import { JwtPayload } from '@/src/common/interfaces/jwt-payload.interface';
import { CreateProductUseCase } from '../../application/products/create-product.usecase';
import { GetAllProductsUseCase } from '../../application/products/get-all-products.usecase';
import { UpdateProductUseCase } from '../../application/products/update-product.usecase';
import { DeleteProductDto } from '../dtos/products/delete-product.dto';
import { DeleteProductUseCase } from '../../application/products/delete-product.usecase';
import { Permissions } from '@/src/common/decorators/permissions.decorator';
import { ProductPrimitive } from '../../domain/entities/product.entity';
import { SearchProductUseCase } from '../../application/products/search-product.usecase';
import { ProductFilterDto } from '../dtos/products/get-products.dto';
import { GetAllProductsQueryDto } from '../dtos/products/get-all-products-query.dto';

@Controller('products')
export class ProductController {
    constructor(
        private readonly createProductUseCase: CreateProductUseCase,
        private readonly getAllProductsUseCase: GetAllProductsUseCase,
        private readonly updateProductUseCase: UpdateProductUseCase,
        private readonly deleteProductUseCase: DeleteProductUseCase,
        private readonly searchProductUseCase: SearchProductUseCase 
    ) {}
    
    /**
     * Validates the product data
     * This private method validates the product data before creating or updating a product.
     * It throws a BadRequestException if the data is invalid.
     * It's a temporary method until we implement class-validator. Or in its place, move to a different file. 
     * 
     */
    private validateProductData(productData: Omit<ProductPrimitive, 'id' | 'created_at' | 'w_ficha'>) {
        if (!productData.name || productData.name.length < 1 || productData.name.length > 255) throw new BadRequestException('El nombre es requerido');
        if (!productData.barcode || productData.barcode.length < 1 || productData.barcode.length > 100) throw new BadRequestException('El código de barras es requerido');
        if (!productData.store_id || productData.store_id.length < 1 || productData.store_id.length > 100) throw new BadRequestException('El ID de la tienda es requerido');
        if (!productData.provider_id || productData.provider_id.length < 1 || productData.provider_id.length > 100) throw new BadRequestException('El ID del proveedor es requerido');
        if (!productData.category_id || productData.category_id.length < 1 || productData.category_id.length > 100) throw new BadRequestException('El ID de la categoría es requerido');
    }

    private validateFichaData(fichaData: Omit<ProductPrimitive['w_ficha'], 'id' | 'product_id' | 'created_at'>) {
        let isValid = false;
        if (fichaData.condition === 'UND' || fichaData.condition === 'KG') isValid = true;

        if (!fichaData) throw new BadRequestException('La ficha es requerida');
        if (!isValid) throw new BadRequestException('La condición es requerida y debe ser KG o UND.');
        if (!fichaData.cost || fichaData.cost < 0) throw new BadRequestException('El costo es requerido y debe ser mayor a 0.');
        if (!fichaData.benchmark || fichaData.benchmark < 0 || fichaData.benchmark > 99) throw new BadRequestException('El margen referencial es requerido y debe ser mayor a 0 y menor a 100.');
        if (fichaData.tax === undefined) throw new BadRequestException('El impuesto es requerido y debe ser true o false.');
    }
        

    @Post('create')
    @Permissions('product:create')
    async create(
        @Body() createProductDto: { 
            name: string; barcode: string; store_id: string; provider_id: string; category_id: string; 
            w_ficha: { 
                condition: string; cost: number; benchmark: number; tax: boolean; 
            } },
    ) {
        const { w_ficha, ...productData } = createProductDto;

        this.validateProductData(productData);
        this.validateFichaData(w_ficha);

        const product = await this.createProductUseCase.execute({
            ...productData,
            w_ficha: w_ficha
        });
        if (!product.isSuccess) throw new BadRequestException(product.error?.message || 'Error al crear el producto'); 
        return product;
    }

    @Get('get/all')
    @Permissions('product:read')
    async getAll(
        @Query() query: GetAllProductsQueryDto,
    ) {

        const skip = query.skip ? parseInt(query.skip) : 0;
        const take = query.take ? parseInt(query.take) : 10;

        const result = await this.getAllProductsUseCase.execute(query.store_id, skip, take, query);

        if (!result.isSuccess) {
            throw new BadRequestException(result.error?.message || 'Error al obtener los productos');
        }

        return result;
    }

    @Post('update')
    @Permissions('product:update')
    async update(
        @Body() updateProductDto: { 
            id: string; name: string; barcode: string; store_id: string; provider_id: string; category_id: string;
            created_at: Date;
            w_ficha: { 
                id: string;
                condition: string; cost: number; benchmark: number; tax: boolean; 
            } },
        @CurrentUser() user: JwtPayload
    ) {
        const { w_ficha, ...productData } = updateProductDto;

        this.validateProductData(productData);
        this.validateFichaData(w_ficha);
        
        const productUpdateData = {
            ...productData,
            created_at: productData.created_at,
            w_ficha: {
                ...w_ficha,
                product_id: productData.id,
            },
        };

        const result = await this.updateProductUseCase.execute(
            productUpdateData,
            user.sub
        );

        if (!result.isSuccess) {
            throw new BadRequestException(result.error?.message || 'Error al actualizar el producto');
        }
 
        return result;
    }

    @Delete('delete/:product_id')
    @Permissions('product:delete')
    async delete(
        @Param('product_id') product_id: string,
    ) {
        const result = await this.deleteProductUseCase.execute(product_id);
        if (!result.isSuccess) throw new BadRequestException(result.error?.message || 'Error al eliminar el producto.');
        return result;
    }

    @Get('search')
    @Permissions('product:read')
    async search(
        @Query() query: { store_id: string, q: string },
    ) {
        if (!query.store_id || !query.q) throw new BadRequestException('El store_id y query "q" son requeridos')
        
        const result = await this.searchProductUseCase.execute(query.store_id, query.q);
        if (!result.isSuccess) throw new BadRequestException(result.error?.message || 'Error al buscar el producto');
        return result;
    }
}
