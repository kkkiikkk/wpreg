import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User, CreateUserDto, UpdateUserDto } from './user.types';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async findByAddress(address: string): Promise<User | null> {
    if (!address) return null;
    return this.prisma.user.findUnique({
      where: { address },
    });
  }

  async findByUsername(username?: string): Promise<User | null> {
    if (!username) return null;
    return this.prisma.user.findUnique({
      where: { username },
    });
  }

  async createUser(data: CreateUserDto): Promise<User> {
    let username = data.username;

    if (username) {
      const existing = await this.prisma.user.findFirst({
        where: { username },
      });
      if (existing) {
        throw new Error('Username already taken');
      }
    } else {
      username = await this.generateUniqueUsername('user');
    }

    return this.prisma.user.create({
      data: {
        ...data,
        username,
      },
    });
  }

  async updateUser(id: string, data: UpdateUserDto): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async findById(id: string): Promise<User | null> {
    if (!id) {
      return null;
    }
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async generateUniqueUsername(base: string): Promise<string> {
    const sanitized = base.toLowerCase().replace(/[^a-z0-9_]/g, '') || 'user';
    let candidate: string;
    let exists: User | null;
    do {
      const suffix = Math.floor(1000 + Math.random() * 9000).toString();
      candidate = `${sanitized}_${suffix}`;
      exists = await this.prisma.user.findFirst({
        where: { username: candidate },
      });
    } while (exists);
    return candidate;
  }
}
