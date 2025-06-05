import { Injectable } from '@nestjs/common';
import { UserRepository } from '@users/domain/repos/user.repository';
import { User, UserData } from '@users/domain/entitys/user.entity';
import { Transaction } from '@shared/persistance/transactions';
import { PrismaService } from '@shared/persistance/prisma.service';
import { PrismaClient } from '@prisma/client';
import { UserRole, UserRoleEnum } from '@users/domain/value-objects/user-role.vo';

@Injectable()
export class UserRepositoryAdapter implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  private mapPrismaUserToDomain(user: any): User {
    return User.fromPrimitives({
      id: user.id,
      email: user.email,
      password: user.password,
      role: UserRole.create(user.role as UserRoleEnum),
      name: user.name,
      last_name: user.last_name,
      username: user.username,
      created_at: user.created_at,
      is_active: user.is_active,
      icon_url: user.icon_url,
    });
  }

  async create(user: User, tx?: Transaction): Promise<User> {
    const client = tx as PrismaClient || this.prisma;
    try {
      const created = await client.users.create({
        data: {
          id: user.getId(),
          name: user.getName(),
          last_name: user.getLastName(),
          username: user.getUsername(),
          email: user.getEmail(),
          password: user.getPassword(),
          role: user.getRole().getValue(),
          created_at: user.getCreatedAt(),
          is_active: user.getIsActive(),
          icon_url: user.getIconUrl(),
        },
      });

      return this.mapPrismaUserToDomain(created);
    } catch (error) {
      throw error;
    }
  }

  async findById(id: string, tx?: Transaction): Promise<User | null> {
    const client = tx as PrismaClient || this.prisma;
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
    const client = tx as PrismaClient || this.prisma;
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

  async update(user: User, tx?: Transaction): Promise<User> {
    const client = tx as PrismaClient || this.prisma;
    try {
      const updated = await client.users.update({
        where: { id: user.getId() },
        data: {
          email: user.getEmail(),
          password: user.getPassword(),
          role: user.getRole().getValue(),
          is_active: user.getIsActive(),
          icon_url: user.getIconUrl(),
        },
      });

      return this.mapPrismaUserToDomain(updated);
    } catch (error) {
      throw error;
    }
  }
} 