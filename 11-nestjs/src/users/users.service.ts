import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';

const publicFields = { id: true, email: true, name: true, role: true, createdAt: true, updatedAt: true } as const;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateUserDto) {
    await this.ensureEmailFree(dto.email);
    const password = await bcrypt.hash(dto.password, 10);
    return this.prisma.user.create({ data: { ...dto, password }, select: publicFields });
  }

  findAll() {
    return this.prisma.user.findMany({ select: publicFields, orderBy: { id: 'asc' } });
  }

  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({ where: { id }, select: publicFields });
    if (!user) throw new NotFoundException(`User ${id} not found`);
    return user;
  }

  async update(id: number, dto: UpdateUserDto) {
    await this.findOne(id);
    if (dto.email) await this.ensureEmailFree(dto.email, id);
    const data = { ...dto, ...(dto.password && { password: await bcrypt.hash(dto.password, 10) }) };
    return this.prisma.user.update({ where: { id }, data, select: publicFields });
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.user.delete({ where: { id } });
  }

  private async ensureEmailFree(email: string, exceptId?: number) {
    const existing = await this.prisma.user.findUnique({ where: { email }, select: { id: true } });
    if (existing && existing.id !== exceptId) throw new ConflictException(`Email ${email} is already taken`);
  }
}
