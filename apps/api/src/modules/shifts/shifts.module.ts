import { Module } from '@nestjs/common';
import { ShiftController } from './shifts.controller';
import { ShiftService } from './shifts.service';

@Module({
  controllers: [ShiftController],
  providers: [ShiftService],
})
export class ShiftModule {}
