import { Module } from '@nestjs/common';
import { WatchHistroyController } from './watch_histroy.controller';
import { WatchHistoryService } from './watch_histroy.service';

@Module({
  controllers: [WatchHistroyController],
  providers: [WatchHistoryService],
})
export class WatchHistroyModule {}
