# Role-Based Access Control (RBAC) Implementation

This document outlines the RBAC and permission-based access control implementation in the Wheek application backend.

## Core Concepts

### 1. Roles

Roles are groups of permissions assigned to users. The system supports the following default roles:

- `ADMIN`: Full system access
- `STORE_OWNER`: Can manage their own stores and products
- `STORE_MANAGER`: Can manage products in assigned stores
- `STORE_STAFF`: Can view products and perform limited actions
- `CUSTOMER`: Basic access (read-only for most resources)

### 2. Permissions

Permissions are fine-grained access controls that define what actions can be performed on specific resources. They follow the format `resource:action`.

#### Available Permission Helpers

```typescript
// Product permissions
canCreateProduct()  // product:create
canReadProduct()    // product:read
canUpdateProduct()  // product:update
canDeleteProduct()  // product:delete
canManageProduct()  // product:manage

// Store permissions
canCreateStore()    // store:create
canReadStore()      // store:read
canUpdateStore()    // store:update
canDeleteStore()    // store:delete
canManageStore()    // store:manage

// User permissions
canCreateUser()     // user:create
canReadUser()       // user:read
canUpdateUser()     // user:update
canDeleteUser()     // user:delete
canManageUser()     // user:manage
```

## How to Use RBAC

### 1. Protecting Controllers with Roles

```typescript
import { Roles } from '@common/decorators/roles.decorator';
import { Role } from '@common/enums/roles.enum';

@Controller('products')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.STORE_OWNER)
export class ProductsController {
  // Controller methods
}
```

### 2. Protecting Routes with Permissions

```typescript
import { Permissions, PermissionsHelper } from '@common/decorators/permissions.decorator';

@Controller('products')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ProductsController {
  
  // Using permission helper (recommended)
  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @PermissionsHelper.canCreateProduct()
  async create() {
    // Implementation
  }

  // Using direct permission string
  @Get()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('product:read')
  async findAll() {
    // Implementation
  }
}
```

### 3. Accessing User Information

Use the `@CurrentUser()` decorator to access the authenticated user's information:

```typescript
@Get('profile')
async getProfile(@CurrentUser() user: JwtPayload) {
  // user.sub - User ID
  // user.email - User email
  // user.role - User role
  // user.permissions - Array of user's permissions (if using PermissionsGuard)
}
```

## Database Schema

The RBAC system uses the following tables:

- `roles`: Defines available roles
- `permissions`: Defines available permissions
- `role_permission`: Maps roles to permissions (many-to-many)
- `user_roles`: Maps users to roles (many-to-many)

## Managing Roles and Permissions

### 1. Creating a New Role

```typescript
const newRole = await prisma.roles.create({
  data: {
    name: 'INVENTORY_MANAGER',
    description: 'Manages inventory and stock levels',
    is_active: true
  }
});
```

### 2. Creating a New Permission

```typescript
const permission = await prisma.permissions.create({
  data: {
    name: 'inventory:manage',
    description: 'Manage inventory levels',
    resource: 'inventory',
    action: 'manage',
    is_active: true
  }
});
```

### 3. Assigning Permissions to a Role

```typescript
await prisma.role_permission.create({
  data: {
    role_id: roleId,
    permission_id: permissionId
  }
});
```

### 4. Assigning a Role to a User

```typescript
await prisma.user_roles.create({
  data: {
    user_id: userId,
    role_id: roleId,
    is_active: true
  }
});
```

## Best Practices

1. **Least Privilege**: Always assign the minimum permissions necessary
2. **Use Permission Helpers**: Prefer using the permission helpers for better readability
3. **Audit Logging**: Consider adding audit logging for permission changes
4. **Caching**: Implement caching for frequently accessed permissions
5. **Testing**: Always test your permission logic thoroughly

## Troubleshooting

- **Permission Denied?** Check that:
  - The user has the required role
  - The role has the necessary permissions
  - Both the role and permissions are active
  - The user's session is up-to-date

## Adding New Permissions

1. Add the new permission to `permissions.decorator.ts` if it follows a common pattern
2. Document the new permission in this file
3. Update any relevant role-permission mappings
4. Test the new permission thoroughly
