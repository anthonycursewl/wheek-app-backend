import { Controller, Post, Body,  Req } from '@nestjs/common';
import { CreateOrderDto } from '@orders/infraestructure/dtos/create-order.dto';
import { OrderProcessorService } from '@orders/infraestructure/services/order-processor.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('orders')
@Controller('orders')
export class CreateOrderController {
  constructor(private readonly orderProcessorService: OrderProcessorService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new order' })
  @ApiResponse({ status: 201, description: 'Order created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async execute(@Body() command: CreateOrderDto, @Req() req: any): Promise<string> {
    const userId = '1';
    const result = await this.orderProcessorService.processOrder(command, userId);
    if (!result.isSuccess) {
      throw new Error(result.error.message);
    }
    return result.value;
  }
}
