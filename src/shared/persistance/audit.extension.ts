import { Prisma } from '@prisma/client';
import { AuditService } from '../audit/audit.service';
import { AUDIT_INCLUDES } from '../audit/audit.config';

const modelsToAudit = Object.keys(AUDIT_INCLUDES);

// Helper function to calculate differences between two objects
function getChanges(before: any, after: any): Record<string, { old: any; new: any }> | null {
  if (!before && !after) return null;
  if (!before && after) return { new_record: { old: null, new: after } };
  if (before && !after) return { deleted_record: { old: before, new: null } };

  const changes: Record<string, { old: any; new: any }> = {};
  const allKeys = new Set([...Object.keys(before), ...Object.keys(after)]);

  for (const key of allKeys) {
    const beforeValue = before[key];
    const afterValue = after[key];

    if (JSON.stringify(beforeValue) !== JSON.stringify(afterValue)) {
      changes[key] = { old: beforeValue, new: afterValue };
    }
  }
  return Object.keys(changes).length > 0 ? changes : null;
}

export const auditExtension = (auditService: AuditService, basePrisma: any) => {
  return {
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          const actionsToAudit = ['create', 'update', 'delete', 'createMany', 'updateMany', 'deleteMany'];
          
          if (!model || !modelsToAudit.includes(model) || !actionsToAudit.includes(operation)) {
            return query(args);
          }
          
          console.log(`[Audit Debug] Auditing operation: ${operation} on model: ${model}`);
          console.log(`[Audit Debug] Args: ${JSON.stringify(args)}`);

          let beforeState: any = null;
          const include = AUDIT_INCLUDES[model];
          const userId: string | null = 'SYSTEM'; 

          if ((operation.startsWith('update') || operation.startsWith('delete')) && args.where) {
            const findArgs = {
              where: args.where,
              ...(Object.keys(include).length > 0 && { include }),
            };
            try {
              if (operation.endsWith('Many')) {
                beforeState = await basePrisma[model].findMany(findArgs);
              } else {
                beforeState = await basePrisma[model].findUnique(findArgs);
              }
              console.log(`[Audit Debug] Before State: ${JSON.stringify(beforeState)}`);
            } catch (e) {
              console.error(`Audit: Could not fetch beforeState for ${model} (operation: ${operation}): ${e.message}`);
            }
          }

          const result = await query(args);
          console.log(`[Audit Debug] Query Result: ${JSON.stringify(result)}`);

          Promise.resolve().then(async () => {
            try {
              let afterState: any = null;
              let entityId: string | null = null;
              let storeId: string | null = null;

              if (operation.startsWith('create')) {
                afterState = result;
                entityId = result?.id;
                storeId = result?.store_id;
              } else if (operation.startsWith('update')) {
                const findArgs = {
                  where: args.where || (result && result.id ? { id: result.id } : undefined),
                  ...(Object.keys(include).length > 0 && { include }),
                };
                if (findArgs.where) {
                  if (operation.endsWith('Many')) {
                    afterState = await basePrisma[model].findMany(findArgs);
                    entityId = afterState?.[0]?.id; 
                    storeId = afterState?.[0]?.store_id;
                  } else {
                    afterState = await basePrisma[model].findUnique(findArgs);
                    entityId = afterState?.id;
                    storeId = afterState?.store_id;
                  }
                } else {
                  afterState = result;
                  entityId = result?.id;
                  storeId = result?.store_id;
                }
              } else if (operation.startsWith('delete')) {
                afterState = null;
                entityId = beforeState?.id || (args.where && args.where.id);
                storeId = beforeState?.store_id;
              }

              if (Array.isArray(result) && result.length > 0) {
                if (!entityId) entityId = result[0]?.id;
                if (!storeId) storeId = result[0]?.store_id;
              }
              console.log(`[Audit Debug] After State: ${JSON.stringify(afterState)}`);

              const changes = getChanges(beforeState, afterState);
              console.log(`[Audit Debug] Calculated Changes: ${JSON.stringify(changes)}`);

              if (changes) { 
                const auditLogData = {
                  store_id: storeId || 'UNKNOWN_STORE',
                  user_id: userId,
                  action_type: operation.toUpperCase(),
                  entity: model,
                  entity_id: entityId || 'UNKNOWN',
                  details: `Operation ${operation} on ${model} with ID ${entityId || 'UNKNOWN'}`,
                  changes: changes,
                };
                console.log(`[Audit Debug] Logging Audit: ${JSON.stringify(auditLogData)}`);
                await auditService.log(auditLogData);
                console.log(`[Audit Debug] Audit log successfully sent to service.`);
              } else {
                console.log(`[Audit Debug] No changes detected for ${model} ${entityId || 'UNKNOWN'}, skipping audit log.`);
              }
            } catch (auditError) {
              console.error('CRITICAL: Failed to write audit trail asynchronously:', auditError);
            }
          });

          return result;
        },
      },
    },
  };
};
