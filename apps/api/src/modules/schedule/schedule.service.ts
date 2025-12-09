import { CreateScheduleDto, UnassignEmployeeDto } from '@/common/dtos';
import { DayScheduleDto, WeekScheduleDto } from '@/common/utils';
import { Employee, SchedulerEntry, Shift } from '@/database/tenant/entities';
import { TenantService } from '@/tenants/tenant.service';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { endOfWeek, format, getDay, parseISO, startOfWeek } from 'date-fns';
import { Between, EntityManager, In } from 'typeorm';
import { DataSource } from 'typeorm/browser';

@Injectable()
export class ScheduleService {
  constructor(private readonly tenantService: TenantService) {}

  async getWeekSchedule(
    bookStoreId: string,
    weekDate: string,
    manager?: EntityManager,
  ): Promise<WeekScheduleDto> {
    const dataSource = await this.tenantService.getTenantConnection({
      bookStoreId,
    });

    const scheduleEntryRepo = manager
      ? manager.getRepository(SchedulerEntry)
      : dataSource.getRepository(SchedulerEntry);

    const parsedDate = parseISO(weekDate);
    const weekStart = startOfWeek(parsedDate, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(parsedDate, { weekStartsOn: 1 });

    const entries = await scheduleEntryRepo.find({
      where: { workDate: Between(weekStart, weekEnd) },
      relations: { employee: true, shift: true },
      order: { workDate: 'ASC' },
    });

    const scheduleMap: Record<string, DayScheduleDto> = {};

    entries.forEach((entry) => {
      const dateStr = format(entry.workDate, 'yyyy-MM-dd');

      if (!scheduleMap[dateStr]) {
        scheduleMap[dateStr] = {
          date: dateStr,
          dayOfWeek: this.dayOfWeekVN(entry.workDate),
          shifts: [],
        };
      }

      const day = scheduleMap[dateStr];

      let shift = day.shifts.find((s) => s.id === entry.shift.id);
      if (!shift) {
        shift = {
          id: entry.shift.id,
          key: entry.id,
          name: entry.shift.name,
          startTime: entry.shift.startTime,
          endTime: entry.shift.endTime,
          employees: [],
        };
        day.shifts.push(shift);
      }

      shift.employees.push({
        id: entry.employee.id,
        fullName: entry.employee.fullName,
      });
    });

    Object.values(scheduleMap).forEach((day) => {
      day.shifts.sort((a, b) => a.startTime.localeCompare(b.startTime));
    });

    return {
      weekStart: format(weekStart, 'yyyy-MM-dd'),
      weekEnd: format(weekEnd, 'yyyy-MM-dd'),
      schedule: Object.values(scheduleMap),
    };
  }

  async createSchedule(dto: CreateScheduleDto, bookStoreId: string) {
    const dataSource = await this.tenantService.getTenantConnection({
      bookStoreId,
    });

    return dataSource.transaction(async (manager) => {
      const scheduleEntryRepo = manager.getRepository(SchedulerEntry);
      const shiftRepo = manager.getRepository(Shift);
      const employeeRepo = manager.getRepository(Employee);
      const { shiftId, workDate, employeeIds, note } = dto;

      const shift = await shiftRepo.findOne({
        where: {
          id: shiftId,
        },
      });

      if (!shift)
        throw new NotFoundException('Không tìm thấy thông tin ca làm việc.');

      const employees = await employeeRepo.find({
        where: { id: In(employeeIds) },
      });

      if (!employees.length)
        throw new NotFoundException('Không tìm thấy nhân viên.');

      const existing = await scheduleEntryRepo.find({
        where: {
          workDate,
          shift: { id: shiftId },
          employee: In(employeeIds),
        },
        relations: {
          employee: true,
          shift: true,
        },
      });

      if (existing.length > 0) {
        const conflictEmployees = existing
          .map((e) => e.employee.fullName)
          .join(', ');

        throw new BadRequestException(
          `Nhân viên trùng ca: ${conflictEmployees}.`,
        );
      }

      const entries = employees.map((emp) =>
        scheduleEntryRepo.create({
          shift,
          employee: emp,
          workDate,
          note: note?.trim() ? note : undefined,
        }),
      );

      return scheduleEntryRepo.save(entries);
    });
  }

  async createScheduleFromCsv(rows: any[], bookStoreId: string) {
    for (const row of rows) {
      const dto: CreateScheduleDto = {
        workDate: row.workDate,
        shiftId: row.shiftId,
        employeeIds: row.employeeIds,
        note: row.note,
      };
      await this.createSchedule(dto, bookStoreId);
    }
    return this.getWeekSchedule(bookStoreId, new Date().toISOString());
  }

  async assignEmployee(
    assignEmployeeDto: CreateScheduleDto,
    bookStoreId: string,
  ) {
    const dataSource = await this.tenantService.getTenantConnection({
      bookStoreId,
    });

    return dataSource.transaction(async (manager) => {
      const shiftRepo = manager.getRepository(Shift);
      const employeeRepo = manager.getRepository(Employee);
      const schedulerEntryRepo = manager.getRepository(SchedulerEntry);

      const { shiftId, employeeIds, workDate, note } = assignEmployeeDto;

      const shift = await shiftRepo.findOne({ where: { id: shiftId } });
      if (!shift) throw new NotFoundException('Không tìm thấy ca làm việc.');

      const employees = await employeeRepo.find({
        where: { id: In(employeeIds) },
      });

      if (!employees.length)
        throw new NotFoundException('Không tìm thấy nhân viên nào hợp lệ.');

      const existingEntries = await schedulerEntryRepo.find({
        where: {
          workDate,
          shift: { id: shiftId },
          employee: { id: In(employeeIds) },
        },
        relations: {
          employee: true,
        },
      });

      const existingEmployeeIds = new Set(
        existingEntries.map((e) => e.employee.id),
      );

      const newEntries = employees
        .filter((e) => !existingEmployeeIds.has(e.id))
        .map((e) =>
          schedulerEntryRepo.create({
            workDate,
            shift,
            employee: e,
            note: note?.trim() || undefined,
          }),
        );

      if (newEntries.length > 0) {
        await schedulerEntryRepo.save(newEntries);
      }

      return this.getWeekSchedule(bookStoreId, workDate.toISOString(), manager);
    });
  }

  async unassignEmployee(
    bookStoreId: string,
    unassignEmployeeDto: UnassignEmployeeDto,
  ) {
    const dataSource = await this.tenantService.getTenantConnection({
      bookStoreId,
    });

    return dataSource.transaction(async (manager) => {
      const shiftRepo = manager.getRepository(Shift);
      const employeeRepo = manager.getRepository(Employee);
      const schedulerEntryRepo = manager.getRepository(SchedulerEntry);
      const { shiftId, employeeIds, workDate } = unassignEmployeeDto;

      const shift = await shiftRepo.findOne({
        where: {
          id: shiftId,
        },
      });

      if (!shift) {
        throw new NotFoundException('Không tìm thấy thông tin ca làm.');
      }

      const employees = await employeeRepo.find({
        where: { id: In(employeeIds) },
      });

      if (!employees.length)
        throw new NotFoundException('Không tìm thấy nhân viên nào hợp lệ.');

      const workDateStart = new Date(workDate);
      workDateStart.setHours(0, 0, 0, 0);

      const existingEntries = await schedulerEntryRepo.find({
        where: {
          workDate: workDateStart,
          shift: { id: shiftId },
          employee: { id: In(employeeIds) },
        },
        relations: { employee: true },
      });

      const missingEmployees = employeeIds.filter(
        (id) => !existingEntries.find((e) => e.employee.id === id),
      );

      if (missingEmployees.length) {
        throw new ForbiddenException(
          `Nhân viên không thuộc ca: ${missingEmployees.join(', ')}`,
        );
      }

      await schedulerEntryRepo.delete({
        id: In(existingEntries.map((ee) => ee.id)),
      });

      return this.getWeekSchedule(bookStoreId, workDate.toISOString(), manager);
    });
  }

  private dayOfWeekVN(date: Date): string {
    const days = [
      'Chủ nhật',
      'Thứ 2',
      'Thứ 3',
      'Thứ 4',
      'Thứ 5',
      'Thứ 6',
      'Thứ 7',
    ];
    return days[getDay(date)];
  }
}
