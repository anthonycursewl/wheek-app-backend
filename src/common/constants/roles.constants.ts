import { Role as RoleEnum } from '../enums/roles.enum';

export const PERMISSIONS_LIST = [
  // -- Products
  { action: 'create', resource: 'product' },
  { action: 'read', resource: 'product' },
  { action: 'update', resource: 'product' },
  { action: 'delete', resource: 'product' },

  // -- Categories
  { action: 'create', resource: 'category' },
  { action: 'read', resource: 'category' },
  { action: 'update', resource: 'category' },
  { action: 'delete', resource: 'category' },
  
  // -- Providers
  { action: 'create', resource: 'provider' },
  { action: 'read', resource: 'provider' },
  { action: 'update', resource: 'provider' },
  { action: 'delete', resource: 'provider' },
  
  // -- Members
  { action: 'create', resource: 'member' },
  { action: 'read', resource: 'member' },
  { action: 'update', resource: 'member' },
  { action: 'delete', resource: 'member' },
  
  // -- Roles
  { action: 'manage', resource: 'role' },
  
  // -- Store Settings
  { action: 'read', resource: 'store_settings' },
  { action: 'update', resource: 'store_settings' },
  
  // -- Analytics
  { action: 'read', resource: 'analytics' },
];

export const DEFAULT_ROLES_PERMISSIONS = {
  [RoleEnum.STORE_OWNER]: {
    description: 'Acceso total a todas las funcionalidades de la tienda.',
    permissions: PERMISSIONS_LIST.map(p => `${p.resource}:${p.action}`),
  },
  [RoleEnum.STORE_MANAGER]: {
    description: 'Permisos para gestionar el día a día de la tienda, pero sin acceso a configuraciones críticas.',
    permissions: [
      'product:create', 'product:read', 'product:update', 'product:delete',
      'category:create', 'category:read', 'category:update', 'category:delete',
      'provider:create', 'provider:read', 'provider:update', 'provider.delete',
      'member:create', 'member:read', 'member:update',
      'analytics:read',
    ],
  },
  [RoleEnum.STORE_STAFF]: {
    description: 'Permisos básicos para el personal, principalmente de lectura y gestión de inventario.',
    permissions: [
      'product:read',
      'category:read',
      'provider:read',
    ],
  },
};
