import { Module } from '@nestjs/common';
import { ItemsModule } from '@items/items.module';
import { OrdersModule } from '@orders/orders.module';
import { ShippingsModule } from '@shippings/shippings.module';  
@Module({
  imports: [ItemsModule, OrdersModule, ShippingsModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
