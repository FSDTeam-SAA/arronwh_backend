import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import config from './app/config';
import { PaymentModule } from './app/module/payment/payment.module';
import { WebhookModule } from './app/module/webhook/webhook.module';
import { ControllerModule } from './app/module/controller/controller.module';
import { ExtraModule } from './app/module/extra/extra.module';
import { FaqModule } from './app/module/faq/faq.module';
import { AuthModule } from './app/module/auth/auth.module';
import { QuoteModule } from './app/module/quote/quote.module';
import { BookingModule } from './app/module/booking/booking.module';
import { ProductModule } from './app/module/product/product.module';
import { UserModule } from './app/module/user/user.module';
import { DashboardModule } from './app/module/dashboard/dashboard.module';
import { TwilioModule } from './app/module/twilio/twilio.module';
import { PostcodeModule } from './app/module/postcode/postcode.module';
import { BannerModule } from './app/module/banner/banner.module';
import { PartnersModule } from './app/module/partners/partners.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(config.mongoUri as string),
    PaymentModule,
    WebhookModule,
    AuthModule,
    ControllerModule,
    ExtraModule,
    FaqModule,
    QuoteModule,
    BookingModule,
    ProductModule,
    UserModule,
    DashboardModule,
    TwilioModule,
    PostcodeModule,
    BannerModule,
    PartnersModule,
  ],

  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
