import mongoose, { Schema, Document } from "mongoose";

export interface IProduct extends Document {
  name: string;
  caption: string;
  original_price: number;
  price: number;
  delivery_charge: number;
  category_id: string;
  images: string[];
  is_sold_out: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    caption: { type: String, required: true },
    original_price: { type: Number, required: true },
    price: { type: Number, required: true },
    delivery_charge: { type: Number, required: true },
    category_id: { type: String, required: true },
    images: { type: [String], default: [] },
    is_sold_out: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

// Prevent mongoose from recompiling the model if it already exists
export default mongoose.models.Product ||
  mongoose.model<IProduct>("Product", ProductSchema);
