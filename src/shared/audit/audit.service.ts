import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '@shared/persistance/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class AuditService {
  constructor(
    @Inject(forwardRef(() => PrismaService))
    private readonly prisma: PrismaService,
  ) {}
    
  async log(data: {
    store_id: string;
    user_id?: string | null;
    action_type: string;
    entity: string;
    entity_id: string;
    details?: string | null;
    changes?: any;
  }) {
    try {
        await this.prisma.auditLog.create({
          data: {
            store_id: data.store_id,
            user_id: data.user_id,
            action_type: data.action_type,
            entity: data.entity,
            entity_id: data.entity_id,
            details: data.details,
            changes: data.changes ?? Prisma.JsonNull,
          },
        });
    } catch (error) {
        console.error('Error logging audit:', error);
    }
  }
}
