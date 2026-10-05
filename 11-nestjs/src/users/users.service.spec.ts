import { ConflictException, NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service.js';

function fakePrisma() {
  const rows: any[] = [];
  return {
    rows,
    user: {
      findUnique: async ({ where }: any) => rows.find((r) => (where.id ? r.id === where.id : r.email === where.email)) ?? null,
      create: async ({ data }: any) => {
        const row = { id: rows.length + 1, role: 'USER', ...data };
        rows.push(row);
        return row;
      },
    },
  };
}

describe('UsersService', () => {
  it('hashes the password and rejects a duplicate email', async () => {
    const prisma = fakePrisma();
    const service = new UsersService(prisma as any);
    await service.create({ email: 'a@test.dev', name: 'Alice', password: 'Password123' });
    expect(prisma.rows[0].password).toMatch(/^\$2[aby]\$/);
    await expect(service.create({ email: 'a@test.dev', name: 'Again', password: 'Password123' })).rejects.toBeInstanceOf(ConflictException);
  });

  it('throws NotFound for a missing user', async () => {
    const service = new UsersService(fakePrisma() as any);
    await expect(service.findOne(42)).rejects.toBeInstanceOf(NotFoundException);
  });
});
