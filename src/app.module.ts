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
import { YoloheatModule } from './app/module/yoloheat/yoloheat.module';
import { CustomersayModule } from './app/module/customersay/customersay.module';
import { BoxtModule } from './app/module/boxt/boxt.module';
import { PolicyModule } from './app/module/policy/policy.module';
import { TermsconditionsModule } from './app/module/termsconditions/termsconditions.module';
import { SubscriberModule } from './app/module/subscriber/subscriber.module';
import { AboutusModule } from './app/module/aboutus/aboutus.module';
import { InvoiceModule } from './app/module/invoice/invoice.module';
import { ValuesModule } from './app/module/values/values.module';
import { LogoModule } from './app/module/logo/logo.module';
import { IssueModule } from './app/module/issue/issue.module';
import { NewslatterModule } from './app/module/newslatter/newslatter.module';
import { SalesModule } from './app/module/sales/sales.module';
import { AftercareModule } from './app/module/aftercare/aftercare.module';

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
    YoloheatModule,
    CustomersayModule,
    BoxtModule,
    PolicyModule,
    TermsconditionsModule,
    SubscriberModule,
    AboutusModule,
    InvoiceModule,
    ValuesModule,
    LogoModule,
    IssueModule,
    NewslatterModule,
    SalesModule,
    AftercareModule,
  ],

  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
