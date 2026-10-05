import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import prismaClient from '@prisma/client';

@Injectable()
export class PrismaService extends prismaClient.PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
