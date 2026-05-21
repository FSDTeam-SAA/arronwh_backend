import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';

export type InvoiceDocument = HydratedDocument<Invoice>;

// ─── Sub-schemas ──────────────────────────────────────────────────────────────

class InvoiceBoilerItem {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, default: 1 })
  numberOfBoiler: number;

  @Prop({ required: true, default: 0 })
  price: number;
}

class InvoiceControllerItem {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, default: 1 })
  numberOfControllers: number;

  @Prop({ required: true, default: 0 })
  price: number;
}

class InvoiceExtraItem {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, default: 1 })
  numberOfExtra: number;

  @Prop({ required: true, default: 0 })
  price: number;
}

class InvoiceCustomerInfo {
  @Prop({ default: '' })
  name: string;

  @Prop({ default: '' })
  email: string;

  @Prop({ default: '' })
  phone: string;

  @Prop({ default: '' })
  address: string;

  @Prop({ default: '' })
  postcode: string;
}

// ─── Main Schema ──────────────────────────────────────────────────────────────

@Schema({ timestamps: true })
export class Invoice {
  /** Human-readable invoice number, e.g. INV-00042 */
  @Prop({ unique: true })
  invoiceNumber: string;

  @Prop({ type: InvoiceCustomerInfo, required: true })
  customerInfo: InvoiceCustomerInfo;

  /** Boiler / product line items */
  @Prop({ type: [InvoiceBoilerItem], _id: false, default: [] })
  boilers: InvoiceBoilerItem[];

  /** Controller line items */
  @Prop({ type: [InvoiceControllerItem], _id: false, default: [] })
  controllers: InvoiceControllerItem[];

  /** Extra line items */
  @Prop({ type: [InvoiceExtraItem], _id: false, default: [] })
  extras: InvoiceExtraItem[];

  /** Pre-computed totals stored for quick retrieval */
  @Prop({ default: 0 })
  subtotal: number;

  @Prop({ default: 0 })
  vatAmount: number;

  @Prop({ default: 20 })
  vatRate: number;

  @Prop({ default: 0 })
  totalDiscount: number;

  @Prop({ default: 0 })
  total: number;

  @Prop({ default: 'pending', enum: ['pending', 'paid', 'cancelled', 'refunded'] })
  status: string;

  @Prop({ required: false })
  dueDate?: Date;

  @Prop({ required: false })
  deliveryDate?: Date;

  @Prop({ required: false })
  notes?: string;

  /** Timestamp when the PDF was last emailed to the customer */
  @Prop({ required: false })
  emailedAt?: Date;
}

export const InvoiceSchema = SchemaFactory.createForClass(Invoice);

// Auto-generate invoice number before saving.
// Count-based numbering can reuse a deleted invoice's number, so derive the
// next value from the highest existing invoice number instead.
InvoiceSchema.pre('save', async function () {
  if (!this.invoiceNumber) {
    const latestInvoice = await (this.constructor as any)
      .findOne({ invoiceNumber: /^INV-\d+$/ })
      .sort({ invoiceNumber: -1 })
      .select('invoiceNumber')
      .lean();

    const latestNumber = latestInvoice?.invoiceNumber?.match(/^INV-(\d+)$/)?.[1];
    const nextNumber = latestNumber ? Number(latestNumber) + 1 : 1;

    this.invoiceNumber = `INV-${String(nextNumber).padStart(5, '0')}`;
  }
});
