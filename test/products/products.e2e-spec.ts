import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/shared/persistance';
import { Prisma } from '@prisma/client';

describe('ProductsController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let adminToken: string;
  let userToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = moduleFixture.get<PrismaService>(PrismaService);
    
    await app.init();
    
    // Create test data
    await prisma.$transaction([
      // Create roles
      prisma.roles.createMany({
        data: [
          { name: 'ADMIN', description: 'Administrator' },
          { name: 'USER', description: 'Regular user' },
        ],
        skipDuplicates: true,
      }),
      // Create permissions
      prisma.permissions.createMany({
        data: [
          { 
            name: 'create_products',
            resource: 'products', 
            action: 'create', 
            description: 'Create products' 
          },
          { 
            name: 'read_products',
            resource: 'products', 
            action: 'read', 
            description: 'Read products' 
          },
          { 
            name: 'update_products',
            resource: 'products', 
            action: 'update', 
            description: 'Update products' 
          },
          { 
            name: 'delete_products',
            resource: 'products', 
            action: 'delete', 
            description: 'Delete products' 
          },
        ],
        skipDuplicates: true,
      }),
    ]);

    // Assign permissions to roles
    const [adminRole, userRole] = await Promise.all([
      prisma.roles.findUnique({ where: { name: 'ADMIN' } }),
      prisma.roles.findUnique({ where: { name: 'USER' } }),
    ]);

    const [createPerm, readPerm, updatePerm, deletePerm] = await Promise.all([
      prisma.permissions.findUnique({ where: { name: 'create_products' } }),
      prisma.permissions.findUnique({ where: { name: 'read_products' } }),
      prisma.permissions.findUnique({ where: { name: 'update_products' } }),
      prisma.permissions.findUnique({ where: { name: 'delete_products' } }),
    ]);

    if (!createPerm || !readPerm || !updatePerm || !deletePerm) {
      throw new Error('Failed to create permissions');
    }

    await prisma.$transaction([
      // Admin has all permissions
      prisma.$executeRaw`
        INSERT INTO role_permission (id, role_id, permission_id, created_at) 
        VALUES 
          (gen_random_uuid(), ${adminRole?.id || ''}, ${createPerm.id}, NOW()),
          (gen_random_uuid(), ${adminRole?.id || ''}, ${readPerm.id}, NOW()),
          (gen_random_uuid(), ${adminRole?.id || ''}, ${updatePerm.id}, NOW()),
          (gen_random_uuid(), ${adminRole?.id || ''}, ${deletePerm.id}, NOW())
        ON CONFLICT DO NOTHING
      `,
      // User only has read permission
      prisma.$executeRaw`
        INSERT INTO role_permission (id, role_id, permission_id, created_at) 
        VALUES (gen_random_uuid(), ${userRole?.id || ''}, ${readPerm.id}, NOW()) 
        ON CONFLICT DO NOTHING
      `
    ]);

    // Create test users
    const [adminUser, regularUser] = await Promise.all([
      prisma.users.create({
        data: {
          id: 'admin-user-1',
          email: 'admin@test.com',
          password: '$2b$10$somehashedpassword',
          name: 'Admin',
          last_name: 'User',
          username: 'adminuser',
          role: 'ADMIN',
          created_at: new Date(),
          is_active: true
        },
      }),
      prisma.users.create({
        data: {
          id: 'regular-user-1',
          email: 'user@test.com',
          password: '$2b$10$somehashedpassword',
          name: 'Regular',
          last_name: 'User',
          username: 'regularuser',
          role: 'USER',
          created_at: new Date(),
          is_active: true
        },
      }),
    ]);

    // Assign roles to users
    await prisma.user_roles.createMany({
      data: [
        { 
          id: 'ur-admin-1',
          user_id: adminUser.id, 
          role_id: adminRole?.id || '',
          created_at: new Date(),
          is_active: true
        },
        { 
          id: 'ur-user-1',
          user_id: regularUser.id, 
          role_id: userRole?.id || '',
          created_at: new Date(),
          is_active: true
        },
      ],
    });

    // In a real test, you would get actual JWT tokens after login
    // For this example, we'll use mock tokens
    adminToken = 'mock-admin-token';
    userToken = 'mock-user-token';
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  describe('GET /products', () => {
    it('should return 200 for admin', async () => {
      return request(app.getHttpServer())
        .get('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });

    it('should return 200 for regular user with read permission', async () => {
      return request(app.getHttpServer())
        .get('/api/products')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);
    });
  });

  describe('POST /products', () => {
    it('should allow admin to create product', async () => {
      return request(app.getHttpServer())
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Test Product', price: 9.99 })
        .expect(201);
    });

    it('should deny regular user from creating product', async () => {
      return request(app.getHttpServer())
        .post('/api/products')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ name: 'Test Product', price: 9.99 })
        .expect(403);
    });
  });

  describe('DELETE /products/:id', () => {
    let productId: string;

    beforeEach(async () => {
      // Create a product to delete
      const store = await prisma.stores.create({
        data: {
          id: 'store-1',
          name: 'Test Store',
          description: 'Test Store Description',
          is_active: true,
          created_at: new Date(),
          owner: 'admin-user-1'
        }
      });

      const category = await prisma.categories.create({
        data: {
          id: 'category-1',
          name: 'Test Category',
          created_at: new Date(),
          updated_at: new Date(),
          store_id: store.id
        }
      });

      const provider = await prisma.providers.create({
        data: {
          id: 'provider-1',
          name: 'Test Provider',
          store_id: store.id,
          created_at: new Date(),
          is_active: true
        }
      });

      const product = await prisma.products.create({
        data: {
          id: 'product-1',
          barcode: '1234567890',
          name: 'Product to delete',
          store_id: store.id,
          provider_id: provider.id,
          category_id: category.id,
          created_at: new Date(),
          is_active: true,
          w_ficha: {
            create: {
              id: 'ficha-1',
              cost: new Prisma.Decimal(19.99),
              benchmark: new Prisma.Decimal(19.99),
              tax: true,
              condition: 'UND',
            },
          },
        },
      });
      productId = product.id;
    });

    it('should soft delete product (admin only)', async () => {
      // Delete the product
      await request(app.getHttpServer())
        .delete(`/api/products/${productId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      // Verify product is soft-deleted
      const deletedProduct = await prisma.products.findUnique({
        where: { id: productId },
      });
      
      expect(deletedProduct).toBeDefined();
      expect(deletedProduct?.deleted_at).not.toBeNull();
      expect(deletedProduct?.is_active).toBe(false);
    });

    it('should not show soft-deleted products in list', async () => {
      // Create and delete a product
      const product = await prisma.products.create({
        data: {
          id: 'product-2',
          barcode: '0987654321',
          name: 'Deleted Product',
          store_id: 'store-1',
          provider_id: 'provider-1',
          category_id: 'category-1',
          created_at: new Date(),
          is_active: true,
          w_ficha: {
            create: {
              id: 'ficha-2',
              cost: new Prisma.Decimal(29.99),
              benchmark: new Prisma.Decimal(29.99),
              tax: true,
              condition: 'UND',
            },
          },
        },
      });

      await prisma.products.update({
        where: { id: product.id },
        data: { is_active: false, deleted_at: new Date() },
      });

      // Get all products
      const response = await request(app.getHttpServer())
        .get('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      // Verify the deleted product is not in the response
      const productNames = response.body.map(p => p.name);
      expect(productNames).not.toContain('Deleted Product');
    });
  });
});
