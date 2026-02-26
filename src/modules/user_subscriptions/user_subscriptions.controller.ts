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
import { UserSubscriptionsService } from './user_subscriptions.service';
import { CreateUserSubscriptionDto } from './dto/create.dto';
import {
  UpdateMyUserSubscriptionDto,
  UpdateUserSubscriptionDto,
} from './dto/update.dto';
import { AuthGuard } from 'src/common/guards/jwt.auth.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import { Roles } from 'src/common/decorators/role.dto';
import type { Request } from 'express';

@ApiBearerAuth()
@Controller('usersubscriptions')
@UseGuards(AuthGuard, RoleGuard)
export class UserSubscriptionsController {
  constructor(private readonly service: UserSubscriptionsService) {}

  @ApiOperation({ summary: `${Role.SUPERADMIN} ${Role.ADMIN}` })
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @Get()
  findAll() {
    return this.service.findAll();
  }

  @ApiOperation({ summary: `${Role.SUPERADMIN} ${Role.ADMIN}` })
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @Get('active')
  findAllActive() {
    return this.service.findAllActive();
  }

  @ApiOperation({ summary: `${Role.SUPERADMIN} ${Role.ADMIN}` })
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @Get('inactive')
  findAllInactive() {
    return this.service.findAllInactive();
  }

  @ApiOperation({ summary: `${Role.USER}` })
  @Roles(Role.USER)
  @Get('my/active')
  findMyActive(@Req() req: Request) {
    return this.service.findMyActive(req['user']);
  }

  @ApiOperation({ summary: `${Role.USER}` })
  @Roles(Role.USER)
  @Get('my/history')
  findMyHistory(@Req() req: Request) {
    return this.service.findMyHistory(req['user']);
  }


  @ApiOperation({ summary: `${Role.SUPERADMIN} ${Role.ADMIN}` })
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @ApiOperation({ summary: `${Role.SUPERADMIN} ${Role.ADMIN} ${Role.USER}` })
  @Roles(Role.SUPERADMIN, Role.ADMIN, Role.USER)
  @Post()
  create(@Req() req: Request, @Body() payload: CreateUserSubscriptionDto) {
    return this.service.create(req['user'], payload);
  }

  @ApiOperation({ summary: `O'zining obunasini yangilay oladi faqat doimiylikni` })
  @Roles(Role.USER)
  @Put('my/update')
  myUpdate(
    @Req() req: Request,
    @Body() payload: UpdateMyUserSubscriptionDto,
  ) {
    return this.service.myUpdate(req['user'], payload);
  }

  @ApiOperation({ summary: `${Role.SUPERADMIN} ${Role.ADMIN}` })
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() payload: UpdateUserSubscriptionDto,
  ) {
    return this.service.update(id, payload);
  }

  @ApiOperation({ summary: `${Role.USER}` })
  @Roles(Role.USER)
  @Delete('my/delete')
  myDelete(@Req() req: Request) {
    return this.service.myDelete(req['user']);
  }

  @ApiOperation({ summary: `${Role.SUPERADMIN} ${Role.ADMIN}` })
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.service.delete(id);
  }
}
