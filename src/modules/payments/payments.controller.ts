import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto, UpdatePaymentDto } from './dto/create-payment.dto';
import { AuthGuard } from 'src/common/guards/jwt.auth.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import { Roles } from 'src/common/decorators/role.dto';
import type { Request } from 'express';

@ApiBearerAuth()
@Controller('payments')
export class PaymentsController {
  constructor(private readonly service: PaymentsService) {}

  @ApiOperation({
    summary: `${Role.SUPERADMIN} ${Role.ADMIN} ${Role.USER}`,
  })
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(Role.SUPERADMIN, Role.ADMIN, Role.USER)
  @Post()
  create(@Req() req: Request, @Body() payload: CreatePaymentDto) {
    return this.service.create(req['user'], payload);
  }

  @ApiOperation({
    summary: `${Role.SUPERADMIN} ${Role.ADMIN}`,
  })
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @Get()
  findAll() {
    return this.service.findAll();
  }

  @ApiOperation({
    summary: `${Role.USER}`,
  })
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(Role.USER)
  @Get('my')
  findMyPayments(@Req() req: Request) {
    return this.service.findMyPayments(req['user']);
  }

  @ApiOperation({
    summary: `${Role.SUPERADMIN} ${Role.ADMIN}`,
  })
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @ApiOperation({
    summary: `${Role.SUPERADMIN} ${Role.ADMIN}`,
  })
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() payload: UpdatePaymentDto,
  ) {
    return this.service.update(id, payload);
  }

  // @ApiOperation({
  //   summary: `${Role.SUPERADMIN} ${Role.ADMIN}`,
  // })
  // @UseGuards(AuthGuard, RoleGuard)
  // @Roles(Role.SUPERADMIN, Role.ADMIN)
  // @Delete(':id')
  // delete(@Param('id', ParseIntPipe) id: number) {
  //   return this.service.delete(id);
  // }
}
