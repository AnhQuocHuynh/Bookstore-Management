import { BookStoreId, Roles } from '@/common/decorators';
import { CreateScheduleDto, UnassignEmployeeDto } from '@/common/dtos';
import { WeekScheduleDto } from '@/common/utils';
import { UserRole } from '@/modules/users/enums';
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpStatus,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { toZonedTime } from 'date-fns-tz';
import * as ExcelJS from 'exceljs';
import { ScheduleService } from './schedule.service';

@Controller('schedule')
@ApiTags('Thời gian làm việc')
@ApiBearerAuth()
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @ApiOperation({
    summary: 'Gán nhân viên vào ca làm việc',
    description: 'Đường dẫn này dùng để gán nhân viên vào ca làm việc.',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    example: {
      weekStart: '2025-12-15',
      weekEnd: '2025-12-21',
      schedule: [
        {
          date: '2025-12-15',
          dayOfWeek: 'Thứ 2',
          shifts: [
            {
              id: 'bbb39e85-f93d-48fd-a33c-0b902161e0d6',
              key: '6955f33c-f848-4593-ab28-c6816b955ab0',
              name: 'Ca sáng',
              startTime: '07:00',
              endTime: '10:00',
              employees: [
                {
                  id: '947f7b62-6a70-4fc7-9fe0-2620d006b4c1',
                  fullName: 'Nguyễn Văn Tú',
                },
                {
                  id: '7a3ef648-3a4d-497d-80c0-68c38a148015',
                  fullName: 'ADC',
                },
              ],
            },
            {
              id: '191905ae-5a8e-4695-a84b-3e021dbb9a15',
              key: '623ce86c-3361-45b0-852d-7a42df8d0ee4',
              name: 'Ca trưa',
              startTime: '10:00',
              endTime: '12:00',
              employees: [
                {
                  id: '7a3ef648-3a4d-497d-80c0-68c38a148015',
                  fullName: 'ADC',
                },
              ],
            },
          ],
        },
        {
          date: '2025-12-16',
          dayOfWeek: 'Thứ 3',
          shifts: [
            {
              id: '191905ae-5a8e-4695-a84b-3e021dbb9a15',
              key: 'f61aebcc-814c-4ad9-9e09-3f2a60634fd6',
              name: 'Ca trưa',
              startTime: '10:00',
              endTime: '12:00',
              employees: [
                {
                  id: '7a3ef648-3a4d-497d-80c0-68c38a148015',
                  fullName: 'ADC',
                },
              ],
            },
          ],
        },
        {
          date: '2025-12-17',
          dayOfWeek: 'Thứ 4',
          shifts: [
            {
              id: '191905ae-5a8e-4695-a84b-3e021dbb9a15',
              key: '66653e96-c444-442d-beea-00b97d50170c',
              name: 'Ca trưa',
              startTime: '10:00',
              endTime: '12:00',
              employees: [
                {
                  id: '7a3ef648-3a4d-497d-80c0-68c38a148015',
                  fullName: 'ADC',
                },
              ],
            },
          ],
        },
        {
          date: '2025-12-18',
          dayOfWeek: 'Thứ 5',
          shifts: [
            {
              id: 'bbb39e85-f93d-48fd-a33c-0b902161e0d6',
              key: '522c7d90-8c63-4161-bcf8-b7a077cc3c79',
              name: 'Ca sáng',
              startTime: '07:00',
              endTime: '10:00',
              employees: [
                {
                  id: '7a3ef648-3a4d-497d-80c0-68c38a148015',
                  fullName: 'ADC',
                },
                {
                  id: '947f7b62-6a70-4fc7-9fe0-2620d006b4c1',
                  fullName: 'Nguyễn Văn Tú',
                },
              ],
            },
          ],
        },
        {
          date: '2025-12-19',
          dayOfWeek: 'Thứ 6',
          shifts: [
            {
              id: '191905ae-5a8e-4695-a84b-3e021dbb9a15',
              key: '38722c3c-3ffb-407f-afa2-7126d7ffd510',
              name: 'Ca trưa',
              startTime: '10:00',
              endTime: '12:00',
              employees: [
                {
                  id: '947f7b62-6a70-4fc7-9fe0-2620d006b4c1',
                  fullName: 'Nguyễn Văn Tú',
                },
                {
                  id: '7a3ef648-3a4d-497d-80c0-68c38a148015',
                  fullName: 'ADC',
                },
              ],
            },
          ],
        },
      ],
    },
  })
  @ApiBody({
    type: CreateScheduleDto,
  })
  @Post('assign')
  @Roles(UserRole.OWNER)
  async assignEmployee(
    @Body() assignEmployeeDto: CreateScheduleDto,
    @BookStoreId() bookStoreId: string,
  ) {
    return this.scheduleService.assignEmployee(assignEmployeeDto, bookStoreId);
  }

  @ApiOperation({
    summary: 'Xoá nhân viên khỏi ca làm việc',
    description: 'Đường dẫn này dùng để xoá nhân viên khỏi ca làm việc.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    example: {
      weekStart: '2025-12-15',
      weekEnd: '2025-12-21',
      schedule: [
        {
          date: '2025-12-15',
          dayOfWeek: 'Thứ 2',
          shifts: [
            {
              id: 'bbb39e85-f93d-48fd-a33c-0b902161e0d6',
              key: '0967c028-1eca-42ad-932c-93893b1ca251',
              name: 'Ca sáng',
              startTime: '07:00',
              endTime: '10:00',
              employees: [
                {
                  id: '7a3ef648-3a4d-497d-80c0-68c38a148015',
                  fullName: 'ADC',
                },
              ],
            },
            {
              id: '191905ae-5a8e-4695-a84b-3e021dbb9a15',
              key: '623ce86c-3361-45b0-852d-7a42df8d0ee4',
              name: 'Ca trưa',
              startTime: '10:00',
              endTime: '12:00',
              employees: [
                {
                  id: '7a3ef648-3a4d-497d-80c0-68c38a148015',
                  fullName: 'ADC',
                },
              ],
            },
          ],
        },
        {
          date: '2025-12-16',
          dayOfWeek: 'Thứ 3',
          shifts: [
            {
              id: '191905ae-5a8e-4695-a84b-3e021dbb9a15',
              key: 'f61aebcc-814c-4ad9-9e09-3f2a60634fd6',
              name: 'Ca trưa',
              startTime: '10:00',
              endTime: '12:00',
              employees: [
                {
                  id: '7a3ef648-3a4d-497d-80c0-68c38a148015',
                  fullName: 'ADC',
                },
              ],
            },
          ],
        },
        {
          date: '2025-12-17',
          dayOfWeek: 'Thứ 4',
          shifts: [
            {
              id: '191905ae-5a8e-4695-a84b-3e021dbb9a15',
              key: '66653e96-c444-442d-beea-00b97d50170c',
              name: 'Ca trưa',
              startTime: '10:00',
              endTime: '12:00',
              employees: [
                {
                  id: '7a3ef648-3a4d-497d-80c0-68c38a148015',
                  fullName: 'ADC',
                },
              ],
            },
          ],
        },
        {
          date: '2025-12-18',
          dayOfWeek: 'Thứ 5',
          shifts: [
            {
              id: 'bbb39e85-f93d-48fd-a33c-0b902161e0d6',
              key: '522c7d90-8c63-4161-bcf8-b7a077cc3c79',
              name: 'Ca sáng',
              startTime: '07:00',
              endTime: '10:00',
              employees: [
                {
                  id: '7a3ef648-3a4d-497d-80c0-68c38a148015',
                  fullName: 'ADC',
                },
                {
                  id: '947f7b62-6a70-4fc7-9fe0-2620d006b4c1',
                  fullName: 'Nguyễn Văn Tú',
                },
              ],
            },
          ],
        },
        {
          date: '2025-12-19',
          dayOfWeek: 'Thứ 6',
          shifts: [
            {
              id: '191905ae-5a8e-4695-a84b-3e021dbb9a15',
              key: '38722c3c-3ffb-407f-afa2-7126d7ffd510',
              name: 'Ca trưa',
              startTime: '10:00',
              endTime: '12:00',
              employees: [
                {
                  id: '947f7b62-6a70-4fc7-9fe0-2620d006b4c1',
                  fullName: 'Nguyễn Văn Tú',
                },
                {
                  id: '7a3ef648-3a4d-497d-80c0-68c38a148015',
                  fullName: 'ADC',
                },
              ],
            },
          ],
        },
      ],
    },
  })
  @ApiBody({
    type: UnassignEmployeeDto,
  })
  @Roles(UserRole.OWNER)
  @Patch('unassign')
  async unassignEmployee(
    @Body() unassignEmployeeDto: UnassignEmployeeDto,
    @BookStoreId() bookStoreId: string,
  ) {
    return this.scheduleService.unassignEmployee(
      bookStoreId,
      unassignEmployeeDto,
    );
  }

  @ApiOperation({
    summary: 'Upload Excel để tạo lịch làm việc',
    description: 'Đường dẫn này dùng để upload lịch làm việc cho nhân viên.',
  })
  @Roles(UserRole.OWNER)
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'File Excel chứa lịch làm việc',
        },
      },
      required: ['file'],
    },
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    example: {
      message: 'Upload Excel thành công, lịch đã được tạo.',
      data: {
        weekStart: '2025-12-08',
        weekEnd: '2025-12-14',
        schedule: [
          {
            date: '2025-12-10',
            dayOfWeek: 'Thứ 4',
            shifts: [
              {
                id: 'bbb39e85-f93d-48fd-a33c-0b902161e0d6',
                key: 'b48c2a99-82c3-4078-9f5c-376a90048d06',
                name: 'Ca sáng',
                startTime: '07:00',
                endTime: '10:00',
                employees: [
                  {
                    id: '7a3ef648-3a4d-497d-80c0-68c38a148015',
                    fullName: 'ADC',
                  },
                  {
                    id: '947f7b62-6a70-4fc7-9fe0-2620d006b4c1',
                    fullName: 'Nguyễn Văn Tú',
                  },
                ],
              },
            ],
          },
        ],
      },
    },
  })
  @Post('upload')
  @Roles(UserRole.OWNER)
  @UseInterceptors(FileInterceptor('file'))
  async uploadCsv(
    @UploadedFile() file: Express.Multer.File,
    @BookStoreId() bookStoreId: string,
  ) {
    if (!file) throw new BadRequestException('File Excel không được để trống.');

    const workbook = new ExcelJS.Workbook();
    const buffer = Buffer.from(file.buffer);
    await workbook.xlsx.load(buffer as any);
    const worksheet = workbook.worksheets[0];

    const rows: any[] = [];

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;
      const workDateCell = row.getCell(1).value;
      const shiftIdCell = row.getCell(2).value;
      const employeeIdsCell = row.getCell(3).value;
      const noteCell = row.getCell(4).value;

      if (workDateCell && shiftIdCell && employeeIdsCell) {
        const timeZone = 'Asia/Ho_Chi_Minh';
        let workDate: Date;

        if (workDateCell instanceof Date) {
          workDate = toZonedTime(workDateCell, timeZone);
        } else if (typeof workDateCell === 'number') {
          const excelEpoch = new Date(1899, 11, 30);
          const utcDate = new Date(
            excelEpoch.getTime() + (workDateCell + 1) * 86400 * 1000,
          );
          workDate = toZonedTime(utcDate, timeZone);
        } else {
          workDate = toZonedTime(new Date(workDateCell.toString()), timeZone);
        }

        workDate.setHours(0, 0, 0, 0);

        rows.push({
          workDate,
          shiftId: shiftIdCell.toString(),
          employeeIds: employeeIdsCell
            .toString()
            .split(';')
            .map((id) => id.trim()),
          note: noteCell?.toString() || '',
        });
      }
    });

    if (!rows.length) {
      throw new BadRequestException('File Excel không có dữ liệu hợp lệ.');
    }

    return {
      message: 'Upload Excel thành công, lịch đã được tạo.',
      data: await this.scheduleService.createScheduleFromCsv(rows, bookStoreId),
    };
  }

  @ApiOperation({
    summary: 'Lấy thời gian làm việc',
    description: 'Đường dẫn này dùng để lấy thời gian làm việc trong tuần.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    example: {
      weekStart: '2025-12-15',
      weekEnd: '2025-12-21',
      schedule: [
        {
          date: '2025-12-15',
          dayOfWeek: 'Thứ 2',
          shifts: [
            {
              id: 'bbb39e85-f93d-48fd-a33c-0b902161e0d6',
              key: '6955f33c-f848-4593-ab28-c6816b955ab0',
              name: 'Ca sáng',
              startTime: '07:00',
              endTime: '10:00',
              employees: [
                {
                  id: '947f7b62-6a70-4fc7-9fe0-2620d006b4c1',
                  fullName: 'Nguyễn Văn Tú',
                },
                {
                  id: '7a3ef648-3a4d-497d-80c0-68c38a148015',
                  fullName: 'ADC',
                },
              ],
            },
            {
              id: '191905ae-5a8e-4695-a84b-3e021dbb9a15',
              key: '623ce86c-3361-45b0-852d-7a42df8d0ee4',
              name: 'Ca trưa',
              startTime: '10:00',
              endTime: '12:00',
              employees: [
                {
                  id: '7a3ef648-3a4d-497d-80c0-68c38a148015',
                  fullName: 'ADC',
                },
              ],
            },
          ],
        },
        {
          date: '2025-12-16',
          dayOfWeek: 'Thứ 3',
          shifts: [
            {
              id: '191905ae-5a8e-4695-a84b-3e021dbb9a15',
              key: 'f61aebcc-814c-4ad9-9e09-3f2a60634fd6',
              name: 'Ca trưa',
              startTime: '10:00',
              endTime: '12:00',
              employees: [
                {
                  id: '7a3ef648-3a4d-497d-80c0-68c38a148015',
                  fullName: 'ADC',
                },
              ],
            },
          ],
        },
        {
          date: '2025-12-17',
          dayOfWeek: 'Thứ 4',
          shifts: [
            {
              id: '191905ae-5a8e-4695-a84b-3e021dbb9a15',
              key: '66653e96-c444-442d-beea-00b97d50170c',
              name: 'Ca trưa',
              startTime: '10:00',
              endTime: '12:00',
              employees: [
                {
                  id: '7a3ef648-3a4d-497d-80c0-68c38a148015',
                  fullName: 'ADC',
                },
              ],
            },
          ],
        },
        {
          date: '2025-12-18',
          dayOfWeek: 'Thứ 5',
          shifts: [
            {
              id: 'bbb39e85-f93d-48fd-a33c-0b902161e0d6',
              key: '522c7d90-8c63-4161-bcf8-b7a077cc3c79',
              name: 'Ca sáng',
              startTime: '07:00',
              endTime: '10:00',
              employees: [
                {
                  id: '7a3ef648-3a4d-497d-80c0-68c38a148015',
                  fullName: 'ADC',
                },
                {
                  id: '947f7b62-6a70-4fc7-9fe0-2620d006b4c1',
                  fullName: 'Nguyễn Văn Tú',
                },
              ],
            },
          ],
        },
        {
          date: '2025-12-19',
          dayOfWeek: 'Thứ 6',
          shifts: [
            {
              id: '191905ae-5a8e-4695-a84b-3e021dbb9a15',
              key: '38722c3c-3ffb-407f-afa2-7126d7ffd510',
              name: 'Ca trưa',
              startTime: '10:00',
              endTime: '12:00',
              employees: [
                {
                  id: '947f7b62-6a70-4fc7-9fe0-2620d006b4c1',
                  fullName: 'Nguyễn Văn Tú',
                },
                {
                  id: '7a3ef648-3a4d-497d-80c0-68c38a148015',
                  fullName: 'ADC',
                },
              ],
            },
          ],
        },
      ],
    },
  })
  @ApiQuery({
    name: 'weekDate',
    description: 'Ngày bất kỳ trong tuần.',
    example: '2025-12-15',
  })
  @Get('week')
  async getWeek(
    @Query('weekDate') weekDate: string,
    @BookStoreId() bookStoreId: string,
  ): Promise<WeekScheduleDto> {
    if (!weekDate?.trim()) {
      throw new BadRequestException(
        'Vui lòng cung cấp thông tin về ngày bấy kỳ trong tuần.',
      );
    }
    return this.scheduleService.getWeekSchedule(bookStoreId, weekDate);
  }
}
