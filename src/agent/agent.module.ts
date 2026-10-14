import { Module } from '@nestjs/common';
import { AgentService } from './agent.service';
import { AgentController } from './agent.controller';
import { CatalogModule } from '../catalog/catalog.module';
import { BookingModule } from '../booking/booking.module';

@Module({
  imports: [CatalogModule, BookingModule],
  controllers: [AgentController],
  providers: [AgentService],
})
export class AgentModule {}
