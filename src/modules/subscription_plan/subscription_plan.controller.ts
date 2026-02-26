import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { SubscriptionPlanService } from './subscription_plan.service';
import { CreatePlanDto } from './dto/subcription.dto';
import { Role } from '@prisma/client';
import { AuthGuard } from 'src/common/guards/jwt.auth.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import { Roles } from 'src/common/decorators/role.dto';
import { UpdateDto } from './dto/update.dto';

@ApiBearerAuth()
@Controller('subscriptionplan')
export class SubscriptionPlanController {
  constructor(private readonly subscriptionService: SubscriptionPlanService) {}

  // Barcha planlar
  @ApiOperation({
    summary: ` ${Role.SUPERADMIN} ${Role.ADMIN}`,
  })
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @Get('all')
  getAllSubscription() {
    return this.subscriptionService.getAllSubscription();
  }
  //=====================================================

  // O'zining planlarini ko'rish
  @ApiOperation({
    summary: `O'zingizni planlaringiz`,
  })
  @UseGuards(AuthGuard)
  @Roles(Role.USER)
  @Get('my/plans')
  getMyPlan(@Req() req:Request) {
    return this.subscriptionService.getMyPlan(req['user']);
  }
  // ====================================================

  // Bitta planni ko'rish
  @ApiOperation({
    summary: ` ${Role.SUPERADMIN} ${Role.ADMIN}`,
  })
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @Get('one/:id')
  getOnePlan(@Param('id', ParseIntPipe) id: number) {
    return this.subscriptionService.getOnePlan(id);
  }
// ============================================================

// Active plans
@ApiOperation({
    summary: ` ${Role.SUPERADMIN} ${Role.ADMIN}`,
  })
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @Get('actives')
  getActivePlan() {
    return this.subscriptionService.getActivePlan();
  }

// ==========================================================

// InActive plans
@ApiOperation({
    summary: ` ${Role.SUPERADMIN} ${Role.ADMIN}`,
  })
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @Get('inactives')
  getInActivePlan() {
    return this.subscriptionService.getInActivePlan();
  }

// ==========================================================


// Create Plans
  @ApiOperation({
    summary: ` ${Role.SUPERADMIN} ${Role.ADMIN} `,
  })
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @Post()
  createSubscription(@Body() payload: CreatePlanDto) {
    return this.subscriptionService.createSubscription(payload);
  }
  // ============================================

  // Update Plans
  @ApiOperation({
    summary: ` ${Role.SUPERADMIN} ${Role.ADMIN} `,
  })
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @Patch('update/:id')
  updatePlan(@Param('id', ParseIntPipe) id: number, @Body() payload: UpdateDto) {
    return this.subscriptionService.updatePlan(id, payload);
  }
  // =========================================================

  // Delete plans
  @ApiOperation({
    summary: ` ${Role.SUPERADMIN} ${Role.ADMIN} `,
  })
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @Delete(':id')
  deletePlan(@Param('id', ParseIntPipe) id: number) {
    return this.subscriptionService.deletePlan(id);
  }
  // ===================================================
}
