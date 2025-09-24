import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/shared/persistance';
import { Prisma } from '@prisma/client';

describe('Inventory Adjustment (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let adminToken: string;
  let userToken: string;
  let testStore: any;
  let testProduct: any;
  let testInventory: any;

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
            name: 'create_inventory_adjustments',
            resource: 'inventory', 
            action: 'create', 
            description: 'Create inventory adjustments' 
          },
          { 
            name: 'read_inventory',
            resource: 'inventory', 
            action: 'read', 
            description: 'Read inventory' 
          },
        ],
        skipDuplicates: true,
      }),
      // Create role permissions
      prisma.role_permissions.createMany({
        data: [
          { role_id: 1, permission_id: 1 }, // ADMIN can create adjustments
          { role_id: 1, permission_id: 2 }, // ADMIN can read inventory
          { role_id: 2, permission_id: 2 }, // USER can read inventory
        ],
        skipDuplicates: true,
      }),
    ]);

    // Create test user with admin role
    const adminUser = await prisma.users.create({
      data: {
        email: 'admin@test.com',
        password: '$2b$10$test', // This would be hashed in real app
        name: 'Admin User',
        role_id: 1,
      },
    });

    // Create test user with user role
    const regularUser = await prisma.users.create({
      data: {
        email: 'user@test.com',
        password: '$2b$10$test', // This would be hashed in real app
        name: 'Regular User',
        role_id: 2,
      },
    });

    // Create test store
    testStore = await prisma.stores.create({
      data: {
        name: 'Test Store',
        address: '123 Test St',
        phone: '123-456-7890',
      },
    });

    // Create test product
    testProduct = await prisma.products.create({
      data: {
        name: 'Test Product',
        description: 'Test product description',
        sku: 'TEST-001',
        price: 10.99,
        cost: 5.99,
      },
    });

    // Create test inventory
    testInventory = await prisma.inventory.create({
      data: {
        product_id: testProduct.id,
        store_id: testStore.id,
        quantity: 100,
      },
    });

    // Get tokens (in a real app, you'd authenticate properly)
    adminToken = 'admin-token';
    userToken = 'user-token';
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.$transaction([
      prisma.inventory.deleteMany(),
      prisma.products.deleteMany(),
      prisma.stores.deleteMany(),
      prisma.users.deleteMany(),
      prisma.role_permissions.deleteMany(),
      prisma.permissions.deleteMany(),
      prisma.roles.deleteMany(),
    ]);
    
    await app.close();
  });

  describe('POST /adjustments/create', () => {
    it('should create adjustment and deduct stock', async () => {
      const adjustmentDto = {
        store_id: testStore.id,
        user_id: '1', // admin user id
        reason: 'DAMAGED',
        notes: 'Test adjustment',
        items: [
          {
            product_id: testProduct.id,
            quantity: 10,
          },
        ],
      };

      const response = await request(app.getHttpServer())
        .post('/api/adjustments/create')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(adjustmentDto)
        .expect(201);

      // Verify adjustment was created
      expect(response.body).toHaveProperty('id');
      expect(response.body.store_id).toBe(testStore.id);
      expect(response.body.reason).toBe('DAMAGED');
      expect(response.body.items).toHaveLength(1);
      expect(response.body.items[0].product_id).toBe(testProduct.id);
      expect(response.body.items[0].quantity).toBe(10);

      // Verify inventory was updated
      const updatedInventory = await prisma.inventory.findUnique({
        where: {
          product_store_inventory_unique: {
            product_id: testProduct.id,
            store_id: testStore.id,
          },
        },
      });

      expect(updatedInventory.quantity).toBe(90); // 100 - 10

      // Verify inventory updates are included in response
      expect(response.body).toHaveProperty('inventory_updates');
      expect(response.body.inventory_updates).toHaveLength(1);
      expect(response.body.inventory_updates[0].quantity).toBe(90);
    });

    it('should return 400 for invalid DTO', async () => {
      const invalidDto = {
        store_id: 'invalid-uuid',
        user_id: '1',
        reason: 'INVALID_REASON',
        items: [],
      };

      await request(app.getHttpServer())
        .post('/api/adjustments/create')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidDto)
        .expect(400);
    });

    it('should return 401 for unauthorized request', async () => {
      const adjustmentDto = {
        store_id: testStore.id,
        user_id: '1',
        reason: 'DAMAGED',
        items: [
          {
            product_id: testProduct.id,
            quantity: 5,
          },
        ],
      };

      await request(app.getHttpServer())
        .post('/api/adjustments/create')
        .send(adjustmentDto)
        .expect(401);
    });

    it('should return error for insufficient stock', async () => {
      // Try to deduct more than available
      const adjustmentDto = {
        store_id: testStore.id,
        user_id: '1',
        reason: 'DAMAGED',
        items: [
          {
            product_id: testProduct.id,
            quantity: 200, // More than available (90)
          },
        ],
      };

      await request(app.getHttpServer())
        .post('/api/adjustments/create')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(adjustmentDto)
        .expect(500);
    });
  });

  describe('Multiple items adjustment', () => {
    it('should handle multiple items in single adjustment', async () => {
      // Create another product and inventory
      const secondProduct = await prisma.products.create({
        data: {
          name: 'Second Test Product',
          description: 'Second test product',
          sku: 'TEST-002',
          price: 15.99,
          cost: 8.99,
        },
      });

      const secondInventory = await prisma.inventory.create({
        data: {
          product_id: secondProduct.id,
          store_id: testStore.id,
          quantity: 50,
        },
      });

      const adjustmentDto = {
        store_id: testStore.id,
        user_id: '1',
        reason: 'EXPIRED',
        notes: 'Multiple items adjustment',
        items: [
          {
            product_id: testProduct.id,
            quantity: 5,
          },
          {
            product_id: secondProduct.id,
            quantity: 10,
          },
        ],
      };

      const response = await request(app.getHttpServer())
        .post('/api/adjustments/create')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(adjustmentDto)
        .expect(201);

      // Verify adjustment was created with 2 items
      expect(response.body.items).toHaveLength(2);

      // Verify both inventories were updated
      const firstUpdated = await prisma.inventory.findUnique({
        where: {
          product_store_inventory_unique: {
            product_id: testProduct.id,
            store_id: testStore.id,
          },
        },
      });

      const secondUpdated = await prisma.inventory.findUnique({
        where: {
          product_store_inventory_unique: {
            product_id: secondProduct.id,
            store_id: testStore.id,
          },
        },
      });

      expect(firstUpdated.quantity).toBe(85); // 90 - 5
      expect(secondUpdated.quantity).toBe(40); // 50 - 10

      // Verify inventory updates are included for both items
      expect(response.body.inventory_updates).toHaveLength(2);
    });
  });
});
