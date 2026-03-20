import { join } from 'path';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    const dbUrl =
      process.env.DATABASE_URL ||
      `file:${join(process.cwd(), 'prisma', 'dev.db')}`;

    const adapter = new PrismaBetterSqlite3({ url: dbUrl });

    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }
}
