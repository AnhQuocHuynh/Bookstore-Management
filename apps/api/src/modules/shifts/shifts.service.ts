import { CreateShiftDto, UpdateShiftDto } from '@/common/dtos';
import { Shift } from '@/database/tenant/entities';
import { TenantService } from '@/tenants/tenant.service';
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { FindOptionsRelations, Repository } from 'typeorm';

@Injectable()
export class ShiftService {
  constructor(private readonly tenantService: TenantService) {}

  async findShiftByField(
    repo: Repository<Shift>,
    field: keyof Shift,
    value: any,
    relations?: FindOptionsRelations<Shift> | undefined,
  ) {
    return (
      repo.findOne({
        where: {
          [field]: value,
        },
        ...(relations && { relations }),
      }) ?? null
    );
  }

  async createShift(createShiftDto: CreateShiftDto, bookStoreId: string) {
    const dataSource = await this.tenantService.getTenantConnection({
      bookStoreId,
    });

    const shiftRepo = dataSource.getRepository(Shift);
    const newShift = shiftRepo.create(createShiftDto);

    return {
      message: 'Đã tạo mới ca làm thành công.',
      data: await shiftRepo.save(newShift),
    };
  }

  async getShifts(bookStoreId: string) {
    const dataSource = await this.tenantService.getTenantConnection({
      bookStoreId,
    });

    const shiftRepo = dataSource.getRepository(Shift);

    return shiftRepo.find();
  }

  async updateShift(
    bookStoreId: string,
    updateShiftDto: UpdateShiftDto,
    id: string,
  ) {
    const dataSource = await this.tenantService.getTenantConnection({
      bookStoreId,
    });

    const shiftRepo = dataSource.getRepository(Shift);

    const shift = await shiftRepo.findOne({
      where: {
        id,
      },
    });

    if (!shift) {
      throw new NotFoundException('Không tìm thấy thông tin ca làm.');
    }

    const { name, description } = updateShiftDto;
    shift.name = name || shift.name;
    shift.description = description || shift.description;

    await shiftRepo.save(shift);

    return shift;
  }

  async deleteShift(id: string, bookStoreId: string) {
    const dataSource = await this.tenantService.getTenantConnection({
      bookStoreId,
    });

    const shiftRepo = dataSource.getRepository(Shift);

    const shift = await shiftRepo.findOne({
      where: {
        id,
      },
      relations: {
        entries: true,
      },
    });

    if (!shift) {
      throw new NotFoundException('Không tìm thấy thông tin ca làm.');
    }

    if (shift.entries.length !== 0) {
      throw new ForbiddenException('Không thể xoá ca làm này.');
    }

    await shiftRepo.delete({
      id,
    });

    return {
      message: 'Ca làm đã được xoá thành công.',
    };
  }
}
