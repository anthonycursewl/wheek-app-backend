import { Inject, Injectable } from "@nestjs/common";
import { PRODUCT_REPOSITORY, ProductRepository } from "../../domain/repos/product.repository";
import { Product, CreateProductData } from "../../domain/entities/product.entity";
import { EmailService } from "@/src/contexts/shared/infrastructure/email/email.service";
import { FindByIdUseCase as FindStoreByIdUseCase } from "@/src/contexts/stores/application/findby-id.usecase";
import { UserUseCase } from "@/src/contexts/users/application/user.usecase";
import { Result, success, failure } from "@/src/contexts/shared/ROP/result";

@Injectable()
export class CreateProductUseCase {
    constructor(
        @Inject(PRODUCT_REPOSITORY)
        private readonly productRepository: ProductRepository,
        private readonly emailService: EmailService,
        private readonly findStoreByIdUseCase: FindStoreByIdUseCase,
        private readonly userUseCase: UserUseCase,
    ) {}

    async execute(productData: CreateProductData): Promise<Result<Product, Error>> {
        try {
            const productToSave = Product.create(productData);
            
            const createdProduct = await this.productRepository.create(productToSave);

            // Send email notification in background
            setImmediate(async () => {
                try {
                    const storeId = productData.store_id;
                    const storeResult = await this.findStoreByIdUseCase.execute(storeId);

                    if (storeResult.isSuccess && storeResult.value) {
                        const store = storeResult.value;
                        const ownerId = store.getOwner();
                        const ownerUserResult = await this.userUseCase.execute(ownerId);

                        if (ownerUserResult.isSuccess && ownerUserResult.value) {
                            const ownerEmail = ownerUserResult.value.emailValue;
                            const subject = `Nuevo Producto Creado en ${store.getName()}`;
                            const htmlContent = `
                                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                                    <h2 style="color: #333;">Notificación de Creación de Producto</h2>
                                    <p>Hola,</p>
                                    <p>Se ha creado un nuevo producto en tu tienda <strong>${store.getName()}</strong>.</p>
                                    <p>Detalles del producto:</p>
                                    <ul>
                                        <li><strong>Nombre:</strong> ${createdProduct.toPrimitive().name}</li>
                                        <li><strong>Código de Barras:</strong> ${createdProduct.toPrimitive().barcode}</li>
                                        <li><strong>ID:</strong> ${createdProduct.toPrimitive().id}</li>
                                    </ul>
                                    <p>Saludos,<br>El equipo de Wheek App</p>
                                </div>
                            `;
                            await this.emailService.sendNotificationEmail(ownerEmail, subject, htmlContent);
                        } else {
                            console.error(`Failed to find owner user with ID ${ownerId} for product creation notification. Error: ${!ownerUserResult.isSuccess ? ownerUserResult.error.message : 'User not found'}`);
                        }
                    } else {
                        console.error(`Failed to find store with ID ${storeId} for product creation notification. Error: ${!storeResult.isSuccess ? storeResult.error.message : 'Store not found'}`);
                    }
                } catch (emailError) {
                    console.error('Error sending product creation email notification:', emailError);
                }
            });

            return success(createdProduct);
        } catch (error) {
            return failure(error);
        }
    }
}
