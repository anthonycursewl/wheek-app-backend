import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

const connectionString = `${process.env.DATABASE_URL}`;

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const PERMISSIONS_LIST = [
  // --- Permisos sobre Productos ---
  { action: 'create', resource: 'product', description: 'Permite crear nuevos productos en la tienda' },
  { action: 'read', resource: 'product', description: 'Permite ver la lista y los detalles de los productos' },
  { action: 'update', resource: 'product', description: 'Permite editar la información de productos existentes' },
  { action: 'delete', resource: 'product', description: 'Permite eliminar productos de la tienda' },
  { action: 'report', resource: 'product', description: 'Permite generar reportes de productos' },

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
  { action: 'report', resource: 'provider', description: 'Permite generar reportes de proveedores' },

  // --- Permisos sobre Miembros de la Tienda ---
  { action: 'create', resource: 'member', description: 'Permite invitar nuevos miembros a la tienda' },
  { action: 'read', resource: 'member', description: 'Permite ver la lista de miembros y sus roles' },
  { action: 'update', resource: 'member', description: 'Permite cambiar el rol de un miembro existente' },
  { action: 'delete', resource: 'member', description: 'Permite expulsar a un miembro de la tienda' },

  // --- Permisos de las recepciones de la Tienda ---
  { action: 'create', resource: 'reception', description: 'Permite crear nuevas recepciones' },
  { action: 'read', resource: 'reception', description: 'Permite ver la lista de recepciones' },
  { action: 'update', resource: 'reception', description: 'Permite editar recepciones existentes' },
  { action: 'delete', resource: 'reception', description: 'Permite eliminar recepciones' },
  { action: 'report', resource: 'reception', description: 'Permite generar reportes de recepciones' },

  // --- Permisos sobre los ajustes de la Tienda ---
  { action: 'create', resource: 'adjustment', description: 'Permite crear nuevos ajustes' },
  { action: 'read', resource: 'adjustment', description: 'Permite ver la lista de ajustes' },
  { action: 'update', resource: 'adjustment', description: 'Permite editar ajustes existentes' },
  { action: 'delete', resource: 'adjustment', description: 'Permite eliminar ajustes' },
  { action: 'report', resource: 'adjustment', description: 'Permite generar reportes de ajustes' },

  // --- Permisos sobre los inventarios de la tienda --- 
  { action: 'read', resource: 'inventory', description: 'Permite ver la lista de inventarios' },

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
