import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import * as dotenv from 'dotenv';

dotenv.config();

const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
  throw new Error('MONGODB_URI environment variable is not set');
}

@Global()
@Module({
  imports: [
    MongooseModule.forRoot(mongoUri.replace(/^"|"$/g, ''), {
      dbName: 'hr-system',   // ⬅️ REQUIRED FOR ATLAS
    }),
  ],
  exports: [MongooseModule],
})
export class DatabaseModule {}
