import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'permissions';

export const Permissions = (...permissions: string[]) => 
  SetMetadata(PERMISSIONS_KEY, permissions);

export const RequirePermission = (resource: string, action: string) => 
  SetMetadata(PERMISSIONS_KEY, [`${resource}:${action}`]);

export const PermissionsHelper = {
  // Product permissions
  canCreateProduct: () => RequirePermission('product', 'create'),
  canReadProduct: () => RequirePermission('product', 'read'),
  canUpdateProduct: () => RequirePermission('product', 'update'),
  canDeleteProduct: () => RequirePermission('product', 'delete'),
  canManageProduct: () => RequirePermission('product', 'manage'),
  
  // Store permissions
  canCreateStore: () => RequirePermission('store', 'create'),
  canReadStore: () => RequirePermission('store', 'read'),
  canUpdateStore: () => RequirePermission('store', 'update'),
  canDeleteStore: () => RequirePermission('store', 'delete'),
  canManageStore: () => RequirePermission('store', 'manage'),
  
  // User permissions
  canCreateUser: () => RequirePermission('user', 'create'),
  canReadUser: () => RequirePermission('user', 'read'),
  canUpdateUser: () => RequirePermission('user', 'update'),
  canDeleteUser: () => RequirePermission('user', 'delete'),
  canManageUser: () => RequirePermission('user', 'manage'),
};
