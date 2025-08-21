import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const PERMISSIONS_LIST = [
  // --- Permisos sobre Productos ---
  { action: 'create', resource: 'product', description: 'Permite crear nuevos productos en la tienda' },
  { action: 'read', resource: 'product', description: 'Permite ver la lista y los detalles de los productos' },
  { action: 'update', resource: 'product', description: 'Permite editar la información de productos existentes' },
  { action: 'delete', resource: 'product', description: 'Permite eliminar productos de la tienda' },

  // --- Permisos sobre Categorías ---
  { action: 'create', resource: 'category', description: 'Permite crear nuevas categorías' },
  { action: 'read', resource: 'category', description: 'Permite ver las categorías' },
  { action: 'update', resource: 'category', description: 'Permite editar categorías existentes' },
  { action: 'delete', resource: 'category', description: 'Permite eliminar categorías' },

  // --- Permisos sobre Proveedores ---
  { action: 'create', resource: 'provider', description: 'Permite añadir nuevos proveedores' },
  { action: 'read', resource: 'provider', description: 'Permite ver la lista de proveedores' },
  { action: 'update', resource: 'provider', description: 'Permite editar proveedores existentes' },
  { action: 'delete', resource: 'provider', description: 'Permite eliminar proveedores' },
  
  // --- Permisos sobre Miembros de la Tienda ---
  { action: 'create', resource: 'member', description: 'Permite invitar nuevos miembros a la tienda' },
  { action: 'read', resource: 'member', description: 'Permite ver la lista de miembros y sus roles' },
  { action: 'update', resource: 'member', description: 'Permite cambiar el rol de un miembro existente' },
  { action: 'delete', resource: 'member', description: 'Permite expulsar a un miembro de la tienda' },

  // --- Permisos sobre Roles ---
  // "manage" es una acción común para englobar todo el CRUD de un recurso administrativo
  { action: 'manage', resource: 'role', description: 'Permite crear, editar, eliminar y asignar permisos a roles' },

  // --- Permisos sobre la Configuración de la Tienda ---
  { action: 'read', resource: 'store_settings', description: 'Permite ver la configuración de la tienda' },
  { action: 'update', resource: 'store_settings', description: 'Permite modificar la configuración de la tienda' },

  // --- Permisos sobre Analíticas o Reportes ---
  { action: 'read', resource: 'analytics', description: 'Permite ver los reportes y analíticas de la tienda' },
];

async function main() {
  console.log('🌱 Iniciando el proceso de seeding...');

  const permissionsResult = await prisma.permissions.createMany({
    data: PERMISSIONS_LIST,
    skipDuplicates: true,
  });
  console.log(`✅Seed finalizado. Se crearon ${permissionsResult.count} nuevos permisos.`);
}

main().catch((e) => {
    console.error('❌ Error durante el seeding:', e);
    process.exit(1);
}).finally(async () => {
    await prisma.$disconnect();
});
