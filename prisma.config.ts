import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
    schema: 'prisma/schema.prisma',

    // Migrations configuration
    migrations: {
        path: 'prisma/migrations',
    },

    // Database connection configuration for Prisma CLI (migrations, etc.)
    datasource: {
        url: process.env.DATABASE_URL!,
    },
});
