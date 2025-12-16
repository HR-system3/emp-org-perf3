//./src/seeds/seed.ts

import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import { seedOrganizationStructure } from '../organization-structure/seed';
import { seedTimeManagement } from '../time-management/seed';

dotenv.config();

async function seed() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI environment variable is not set');
    }

    // Remove quotes if present in .env file
    const cleanUri = mongoUri.replace(/^"|"$/g, '');

    console.log('Connecting to MongoDB...');
    await mongoose.connect(cleanUri);
    const connection = mongoose.connection;

    console.log('Connected to MongoDB. Starting seed process...\n');

    // Seed Organization Structure
    const orgData = await seedOrganizationStructure(connection);
    console.log('\n✅ Organization Structure seeded successfully\n');

    // Seed Time Management (if needed)
    // const timeData = await seedTimeManagement(connection, employees, orgData.departments, orgData.positions);
    // console.log('\n✅ Time Management seeded successfully\n');

    console.log('Seed process completed successfully!');
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }
}

seed();

