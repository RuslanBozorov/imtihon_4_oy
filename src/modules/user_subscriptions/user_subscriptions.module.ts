import { Module } from '@nestjs/common';
import { UserSubscriptionsController } from './user_subscriptions.controller';
import { UserSubscriptionsService } from './user_subscriptions.service';
import { PrismaService } from 'src/core/database/prisma.service';

@Module({
  controllers: [UserSubscriptionsController],
  providers: [UserSubscriptionsService, PrismaService],
})
export class UserSubscriptionsModule {}
