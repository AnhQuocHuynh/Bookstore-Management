import { Module } from '@nestjs/common';
import { ReturnOrdersController } from './return-orders.controller';
import { ReturnOrdersService } from './return-orders.service';

@Module({
  controllers: [ReturnOrdersController],
  providers: [ReturnOrdersService],
})
export class ReturnOrdersModule {}

