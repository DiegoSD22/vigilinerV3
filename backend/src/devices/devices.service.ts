import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';

@Injectable()
export class DevicesService {
  constructor(private prisma: PrismaService) {}

  create(data: CreateDeviceDto, userId: string) {
    return this.prisma.device.create({
      data: {
        imei: data.imei,
        model: data.model,
        brand: data.brand,
        status: data.status,
        user: {
          connect: { id: userId },
        },
      },
    });
  }

  findAllByUser(userId: string) {
    return this.prisma.device.findMany({
      where: { userId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    const device = await this.prisma.device.findFirst({
      where: {
        id,
        userId,
        deletedAt: null,
      },
    });

    if (!device) {
      throw new NotFoundException('Device not found');
    }

    return device;
  }
  
  async update(
    id: string,
    userId: string,
    data: UpdateDeviceDto,
  ) {
    const device = await this.prisma.device.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!device) {
      throw new NotFoundException('Device not found');
    }

    return this.prisma.device.update({
      where: { id },
      data,
    });
  }

  async remove(id: string, userId: string) {
    const device = await this.prisma.device.findFirst({
      where: {
        id,
        userId,
        deletedAt: null,
      },
    });

    if (!device) {
      throw new NotFoundException('Device not found');
    }

    return this.prisma.device.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  async restore(id: string, userId: string) {
    const device = await this.prisma.device.findFirst({
      where: {
        id,
        userId,
        deletedAt: { not: null },
      },
    });

    if (!device) {
      throw new NotFoundException('Device not found or not deleted');
    }

    return this.prisma.device.update({
      where: { id },
      data: {
        deletedAt: null,
      },
    });
  }

  async getLocations(
    deviceId: string,
    start: string,
    end: string,
    userId: string,
  ) {
    return this.prisma.deviceLocation.findMany({
      where: {
        deviceId,
        device: {
          userId,
        },
        createdAt: {
          gte: new Date(start),
          lte: new Date(end),
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

}