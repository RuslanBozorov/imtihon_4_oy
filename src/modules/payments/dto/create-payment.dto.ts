import { paymentStatus, paymentsStatus } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsObject } from 'class-validator';

const toOptionalTrimmedString = ({ value }: { value: unknown }) => {
  if (typeof value !== 'string') {
    return value;
  }

  const trimmed = value.trim();
  return trimmed === '' ? undefined : trimmed;
};

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
  @Transform(toOptionalTrimmedString)
  @IsEnum(paymentsStatus)
  @IsOptional()
  status?: paymentsStatus;
}
