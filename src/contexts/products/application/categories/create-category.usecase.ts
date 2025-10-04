import { Inject, Injectable } from "@nestjs/common";
import { CATEGORY_REPOSITORY, CategoryRepository } from "../../domain/repos/category.repository";
import { Category, CategoryPrimitives } from "../../domain/entities/categories.entity";
import { EmailService } from "@/src/contexts/shared/infrastructure/email/email.service";
import { FindByIdUseCase as FindStoreByIdUseCase } from "@/src/contexts/stores/application/findby-id.usecase";
import { UserUseCase } from "@/src/contexts/users/application/user.usecase";
import { Result, failure, success } from "@/src/contexts/shared/ROP/result";

@Injectable()
export class CreateCategoryUseCase {
    constructor(
        @Inject(CATEGORY_REPOSITORY)
        private readonly categoryRepository: CategoryRepository,
        private readonly emailService: EmailService,
        private readonly findStoreByIdUseCase: FindStoreByIdUseCase,
        private readonly userUseCase: UserUseCase,
    ) {}

    async execute(categoryData: Omit<CategoryPrimitives, 'id' | 'created_at' | 'updated_at'>): Promise<Result<Category, Error>> {
        try {
            const categoryToSave = Category.create(categoryData);
            const createdCategory = await this.categoryRepository.save(categoryToSave);

            // Send email notification in parallel
            (async () => {
                try {
                    const storeId = categoryData.store_id;
                    const storeResult = await this.findStoreByIdUseCase.execute(storeId);

                    if (storeResult.isSuccess && storeResult.value) {
                        const store = storeResult.value;
                        const ownerId = store.getOwner();
                        const ownerUserResult = await this.userUseCase.execute(ownerId);

                        if (ownerUserResult.isSuccess && ownerUserResult.value) {
                            const ownerEmail = ownerUserResult.value.emailValue;
                            const subject = `Nueva Categoría Creada en ${store.getName()}`;
                            const htmlContent = `
                                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                                    <h2 style="color: #333;">Notificación de Creación de Categoría</h2>
                                    <p>Hola,</p>
                                    <p>Se ha creado una nueva categoría en tu tienda <strong>${store.getName()}</strong>.</p>
                                    <p>Detalles de la categoría:</p>
                                    <ul>
                                        <li><strong>Nombre:</strong> ${createdCategory.toPrimitives().name}</li>
                                        <li><strong>ID:</strong> ${createdCategory.toPrimitives().id}</li>
                                    </ul>
                                    <p>Saludos,<br>El equipo de Wheek App</p>
                                </div>
                            `;
                            await this.emailService.sendNotificationEmail(ownerEmail, subject, htmlContent);
                        } else {
                            console.error(`Failed to find owner user with ID ${ownerId} for category creation notification. Error: ${!ownerUserResult.isSuccess ? ownerUserResult.error.message : 'User not found'}`);
                        }
                    } else {
                        console.error(`Failed to find store with ID ${storeId} for category creation notification. Error: ${!storeResult.isSuccess ? storeResult.error.message : 'Store not found'}`);
                    }
                } catch (emailError) {
                    console.error('Error sending category creation email notification:', emailError);
                }
            })();

            return success(createdCategory);
        } catch (error) {
            return failure(error);
        }
    }
}
