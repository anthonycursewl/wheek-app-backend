# Documentación de RBAC (Control de Acceso Basado en Roles)

## Tabla de Contenidos
1. [Introducción](#introducción)
2. [Roles Disponibles](#roles-disponibles)
3. [Decoradores de Roles](#decoradores-de-roles)
4. [Decoradores de Permisos](#decoradores-de-permisos)
5. [Uso en Controladores](#uso-en-controladores)
6. [Combinando Múltiples Decoradores](#combinando-múltiples-decoradores)
7. [Manejo de Errores](#manejo-de-errores)

## Introducción

Este documento explica cómo implementar y utilizar el sistema de Control de Acceso Basado en Roles (RBAC). El sistema utiliza decoradores para controlar el acceso a los endpoints basado en roles y permisos específicos.

## Roles Disponibles

El sistema define los siguientes roles jerárquicos:

- `ADMIN`: Acceso completo al sistema
- `STORE_OWNER`: Dueño de tienda con amplios privilegios
- `STORE_MANAGER`: Gerente de tienda con privilegios moderados
- `STORE_STAFF`: Personal de tienda con privilegios limitados
- `CUSTOMER`: Cliente con acceso mínimo

## Decoradores de Roles

### `@Roles()`

El decorador `@Roles()` restringe el acceso a los controladores o métodos basado en los roles del usuario.

```typescript
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/roles.enum';

// Para un solo rol
@Roles(Role.ADMIN)

// Para múltiples roles
@Roles(Role.STORE_OWNER, Role.STORE_MANAGER)
```

## Decoradores de Permisos

### Permisos Básicos

El sistema utiliza un formato de `recurso:acción` para los permisos. Los decoradores de permisos más comunes son:

#### Para Usuarios
- `@canCreateUser()` - Permite crear usuarios
- `@canReadUser()` - Permite leer información de usuarios
- `@canUpdateUser()` - Permite actualizar usuarios
- `@canDeleteUser()` - Permite eliminar usuarios
- `@canManageUser()` - Permite gestionar usuarios (CRUD completo)

#### Para Tiendas
- `@canCreateStore()` - Permite crear tiendas
- `@canReadStore()` - Permite leer información de tiendas
- `@canUpdateStore()` - Permite actualizar tiendas
- `@canDeleteStore()` - Permite eliminar tiendas
- `@canManageStore()` - Permite gestionar tiendas (CRUD completo)

#### Para Productos
- `@canCreateProduct()` - Permite crear productos
- `@canReadProduct()` - Permite leer información de productos
- `@canUpdateProduct()` - Permite actualizar productos
- `@canDeleteProduct()` - Permite eliminar productos
- `@canManageProduct()` - Permite gestionar productos (CRUD completo)

### Uso de `@Permissions()`

Para permisos personalizados, usa el decorador `@Permissions()`:

```typescript
import { Permissions } from '../common/decorators/permissions.decorator';

// Un solo permiso
@Permissions('store:create')

// Múltiples permisos (todos requeridos)
@Permissions('store:create', 'store:read')
```

## Uso en Controladores

### Ejemplo Básico

```typescript
import { Controller, Get } from '@nestjs/common';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/roles.enum';
import { canReadStore } from '../common/decorators/permissions.decorator';

@Controller('stores')
export class StoresController {
  // Solo accesible por administradores
  @Get('all')
  @Roles(Role.ADMIN)
  async getAllStores() {
    // Lógica para obtener todas las tiendas
  }

  // Accesible por dueños o gerentes de tienda
  @Get('my-store')
  @Roles(Role.STORE_OWNER, Role.STORE_MANAGER)
  @canReadStore()
  async getMyStore() {
    // Lógica para obtener la tienda del usuario actual
  }
}
```

## Combinando Múltiples Decoradores

Puedes combinar múltiples decoradores para un control de acceso más granular:

```typescript
@Controller('products')
export class ProductsController {
  // Solo administradores pueden ver todos los productos
  @Get('all')
  @Roles(Role.ADMIN)
  async getAllProducts() {
    // Lógica para obtener todos los productos
  }

  // Dueños y gerentes pueden ver productos de sus tiendas
  @Get('store/:storeId')
  @Roles(Role.STORE_OWNER, Role.STORE_MANAGER)
  @canReadProduct()
  async getStoreProducts() {
    // Lógica para obtener productos de una tienda específica
  }

  // Cualquier usuario autenticado puede ver productos públicos
  @Get('public')
  @canReadProduct()
  async getPublicProducts() {
    // Lógica para obtener productos públicos
  }
}
```

## Manejo de Errores

El sistema lanza los siguientes errores:

- `ForbiddenException` - Cuando un usuario no tiene los permisos necesarios
- `UnauthorizedException` - Cuando el usuario no está autenticado

## Ejemplo

```typescript
import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/roles.enum';
import { 
  canCreateProduct, 
  canReadProduct, 
  canUpdateProduct, 
  canDeleteProduct 
} from '../common/decorators/permissions.decorator';

@Controller('api/products')
export class ProductsController {
  // Solo administradores pueden ver todos los productos
  @Get()
  @Roles(Role.ADMIN)
  @canReadProduct()
  async findAll() {
    return 'Todos los productos';
  }

  // Cualquier usuario autenticado puede ver un producto específico
  @Get(':id')
  @canReadProduct()
  async findOne(@Param('id') id: string) {
    return `Producto ${id}`;
  }

  // Solo dueños y gerentes pueden crear productos
  @Post()
  @Roles(Role.STORE_OWNER, Role.STORE_MANAGER)
  @canCreateProduct()
  async create(@Body() productData: any) {
    return 'Producto creado';
  }

  // Solo dueños pueden eliminar productos
  @Post(':id/delete')
  @Roles(Role.STORE_OWNER)
  @canDeleteProduct()
  async delete(@Param('id') id: string) {
    return `Producto ${id} eliminado`;
  }
}
```


