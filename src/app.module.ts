import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import config from './app/config';
import { ContactModule } from './app/module/contact/contact.module';
import { AuthModule } from './app/module/auth/auth.module';
import { UserModule } from './app/module/user/user.module';
import { SubscribeModule } from './app/module/subscribe/subscribe.module';
import { PaymentModule } from './app/module/payment/payment.module';
import { WebhookModule } from './app/module/webhook/webhook.module';

import { ControllerModule } from './app/module/controller/controller.module';
import { ExtraModule } from './app/module/extra/extra.module';
import { FaqModule } from './app/module/faq/faq.module';

import { ServiceModule } from './app/module/service/service.module';
import { QuizeModule } from './app/module/quize/quize.module';
import { BookingModule } from './app/module/booking/booking.module';
import { DashboardModule } from './app/module/dashboard/dashboard.module';


const databaseImports = config.isMongoEnabled
  ? [
      MongooseModule.forRoot(config.mongoUri as string, {
        lazyConnection: true,
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 5000,
      }),
      UserModule,
      AuthModule,
      ContactModule,
    ]
  : [];

@Module({

  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ...databaseImports,
    SubscribeModule,
    PaymentModule,
    WebhookModule,
    ControllerModule,
    ExtraModule,
    FaqModule,
  ],

  imports: [ConfigModule.forRoot({ isGlobal: true }), ...databaseImports, SubscribeModule, PaymentModule, WebhookModule, ServiceModule, QuizeModule, BookingModule, DashboardModule],

  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
