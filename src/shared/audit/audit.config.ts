/**
 * Configuración central para el sistema de auditoría.
 * - La clave es el nombre del modelo de Prisma (en minúsculas).
 * - El valor es el objeto `include` que se usará para obtener
 *   el estado completo de la entidad antes y después de un cambio.
 */
export const AUDIT_INCLUDES: Record<string, any> = {
    products: {
      w_ficha: true,
    },
    categories: {},
    providers: {},
    roles: {
      permissions: {
        select: {
          permission: {
            select: { resource: true, action: true },
          },
        },
      },
    },
    user_roles: {
      user: { select: { email: true, name: true, last_name: true } },
      role: { select: { name: true } },
    },
    receptions: {
      items: true,
    },
    inventory_adjustments: {
      items: true,
    },
    stores: {},
  };