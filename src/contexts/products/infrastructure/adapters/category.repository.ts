import { Injectable } from "@nestjs/common";
import { Category } from "../../domain/entities/categories.entity";
import { CategoryRepository } from "../../domain/repos/category.repository";
import { PrismaService } from "@/src/shared/persistance";

@Injectable()
export class CategoryRepositoryAdapter implements CategoryRepository {
    constructor(
        private readonly prisma: PrismaService
    ) {}

    async save(category: Category): Promise<Category> {
        const categoryPrimitives = category.toPrimitives()
        const createdCategory = await this.prisma.categories.upsert({
            where: { id: categoryPrimitives.id },
            create: categoryPrimitives,
            update: {
                name: categoryPrimitives.name,
                is_active: categoryPrimitives.is_active,
                updated_at: new Date()
            }
        });

        return Category.fromPrimitives(createdCategory);
    }

    async findAllByStoreId(storeId: string, skip: number, take: number, criteria: any): Promise<Category[]> {
        const categories = await this.prisma.categories.findMany({
            where: {
                store_id: storeId,
                is_active: criteria.where.is_active,
                created_at: criteria.where.created_at,
            },
            skip,
            take,
            orderBy: criteria.orderBy
        });

        return categories.map(category => Category.fromPrimitives(category));
    }

    async findById(id: string): Promise<Category | null> {
        const category = await this.prisma.categories.findUnique({
            where: { id }
        });

        if (!category) {
            return null;
        }

        return Category.fromPrimitives(category);
    }

    async update(id: string, data: Category): Promise<Category> {
        const { id: _, name, is_active } = data.toPrimitives();

        const category = await this.prisma.categories.update({
            where: { id },
            data: {
                name,
                is_active,
                updated_at: new Date()
            }
        });

        return Category.fromPrimitives(category);
    }

    async delete(id: string, isActive: boolean): Promise<Category | null> {
        const updatedCategory = await this.prisma.categories.update({
            where: { id },
            data: { is_active: isActive },
            select: {
                id: true,
                name: true,
                store_id: true,
                created_at: true,
                updated_at: true,
                is_active: true,
                deleted_at: true, // Include deleted_at for consistency, even if not directly used for toggle
            }
        });
        return Category.fromPrimitives(updatedCategory);
    }
}
