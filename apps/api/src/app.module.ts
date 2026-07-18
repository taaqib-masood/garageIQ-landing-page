import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { VehiclesModule } from './modules/vehicles/vehicles.module';
import { SearchModule } from './modules/search/search.module';
import { GaragesModule } from './modules/garages/garages.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { LeadsModule } from './modules/leads/leads.module';
import { FavoritesModule } from './modules/favorites/favorites.module';
import { AdminModule } from './modules/admin/admin.module';

@Module({
  imports: [PrismaModule, AuthModule, UsersModule, VehiclesModule, SearchModule, GaragesModule, ReviewsModule, LeadsModule, FavoritesModule, AdminModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
