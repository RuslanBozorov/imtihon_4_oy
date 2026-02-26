import { paymentStatus, paymentsStatus } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsObject } from 'class-validator';

export class CreatePaymentDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  user_subscripion_id: number;

  @ApiProperty({ example: 100_000 })
  @IsNumber()
  amount: number;

  @ApiProperty({ enum: paymentStatus, example: paymentStatus.CARD })
  @IsEnum(paymentStatus)
  payment_method: paymentStatus;

  @ApiPropertyOptional({
    example: {  "card_number": "4242XXXXXXXX4242",
         "expiry": "04/26",
         "card_holder": "ALIJON VALIYEV" },
  })        
  @IsObject()
  @IsOptional()
  payment_details?: object;
}

export class UpdatePaymentDto {
  @ApiPropertyOptional({
    enum: paymentsStatus,
    example: paymentsStatus.COMPLETED,
  })
  @IsEnum(paymentsStatus)
  @IsOptional()
  status?: paymentsStatus;
}
