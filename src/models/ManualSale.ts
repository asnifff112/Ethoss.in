import mongoose, { Schema, Document } from "mongoose";

export interface IManualSale extends Document {
  productName: string;
  price: number;
  customerName: string;
  quantity: number;
  saleDate: Date;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

const ManualSaleSchema: Schema = new Schema(
  {
    productName: { type: String, required: true },
    price: { type: Number, required: true },
    customerName: { type: String, required: true },
    quantity: { type: Number, required: true, default: 1 },
    saleDate: { type: Date, required: true, default: Date.now },
    status: { type: String, default: "Completed" },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.ManualSale || mongoose.model<IManualSale>("ManualSale", ManualSaleSchema);
