import { Connection } from 'mongoose';
import * as bcrypt from 'bcrypt';

export async function seedUsers(connection: Connection) {
  const usersCollection = connection.collection('users');

  const existing = await usersCollection.findOne({ email: 'hr@system.com' });
  if (existing) {
    console.log('⚠️ Users already seeded');
    return;
  }

  const password = await bcrypt.hash('123456', 10);

  await usersCollection.insertMany([
    {
      name: 'HR Admin',
      email: 'hr@system.com',
      password,
      role: 'HR',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: 'Manager Demo',
      email: 'manager@system.com',
      password,
      role: 'MANAGER',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: 'Employee Demo',
      email: 'employee@system.com',
      password,
      role: 'EMPLOYEE',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);

  console.log('✅ Demo users seeded');
}