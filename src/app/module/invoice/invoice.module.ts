import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { InvoiceController } from './invoice.controller';
import { InvoiceService }    from './invoice.service';
import { Invoice, InvoiceSchema } from './entities/invoice.entity';

// We also need Quote so the service can do `createFromQuote` lookups
import { Quote, QuoteSchema } from '../quote/entities/quote.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Invoice.name, schema: InvoiceSchema },
      { name: Quote.name,   schema: QuoteSchema   },
    ]),
  ],
  controllers: [InvoiceController],
  providers:   [InvoiceService],
  exports:     [InvoiceService],   // export so other modules (e.g. Quote) can call emailInvoice
})
export class InvoiceModule {}
