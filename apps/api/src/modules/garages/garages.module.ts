import { Module } from '@nestjs/common';
import { GaragesController } from './garages.controller';
import { GaragesService } from './garages.service';

@Module({
  controllers: [GaragesController],
  providers: [GaragesService]
})
export class GaragesModule {}
