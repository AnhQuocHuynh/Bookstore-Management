import { Module } from '@nestjs/common';
import { CartController } from './cart.controller';
import { CartsService } from './cart.service';

@Module({
  controllers: [CartController],
  providers: [CartsService],
  exports: [CartsService],
})
export class CartModule {}
