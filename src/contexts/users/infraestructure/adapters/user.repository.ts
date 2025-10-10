import { Injectable, Inject } from '@nestjs/common';
import { UserRepository } from '@users/domain/repos/user.repository';
import { User } from '@users/domain/entitys/user.entity';
import { Transaction } from '@/src/contexts/shared/persistance/transactions';
import { PrismaService } from '@/src/shared/persistance/prisma.service';
import { users } from '@prisma/client';

@Injectable()
export class UserRepositoryAdapter implements UserRepository {
  constructor(
    @Inject(PrismaService)
    private readonly prisma: PrismaService,
  ) {}

  private mapPrismaUserToDomain(user: users): User { 
    return User.fromPrimitives({
      ...user,
      updated_at: user.updated_at ?? undefined,
      deleted_at: user.deleted_at ?? undefined,
      icon_url: user.icon_url ?? undefined,
    });
  }

  async create(user: User, tx?: Transaction): Promise<User> {
    const client = tx || this.prisma; 
    try {
      const created = await client.users.create({ data: { id: user.idValue, name: user.nameValue, last_name: user.lastNameValue, username: user.usernameValue, email: user.emailValue, password: user.passwordValue, created_at: user.createdAtValue, is_active: user.isActiveValue, icon_url: user.iconUrlValue, }, });
      return (await this.findById(created.id, tx))!;
    } catch (error) {
      throw error;
    }
  }

  async findById(id: string, tx?: Transaction): Promise<User | null> {
    const client = tx || this.prisma;
    try {
      const found = await client.users.findUnique({
        where: { id },
      });

      if (!found) return null;
      return this.mapPrismaUserToDomain(found); 
    } catch (error) {
      throw error;
    }
  }

  async findByEmail(email: string, tx?: Transaction): Promise<User | null> {
    const client = tx || this.prisma; 
    try {
      const found = await client.users.findFirst({
        where: { email: email },
      });

      if (!found) return null;
      return this.mapPrismaUserToDomain(found);
    } catch (error) {
      throw error;
    }
  }

  async findByUsername(username: string, tx?: Transaction): Promise<boolean | null> {
    const client = tx || this.prisma;
    try {
      const found = await client.users.findUnique({
        where: { username: username },
        select: { id: true }
      });

      if (!found) return false;
      return true;
    } catch (error) {
      throw error;
    }
  }

  async update(user: User, tx?: Transaction): Promise<User> {
    const client = tx || this.prisma;
    try {
      await client.users.update({ where: { id: user.idValue }, data: { name: user.nameValue, last_name: user.lastNameValue, email: user.emailValue, password: user.passwordValue, is_active: user.isActiveValue, icon_url: user.iconUrlValue, updated_at: user.updatedAtValue, }, });
      return (await this.findById(user.idValue, tx))!;
    } catch (error) {
      throw error;
    }
  }
}
