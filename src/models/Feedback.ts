import mongoose, { Schema, Document } from "mongoose";

export interface IFeedback extends Document {
  name: string;
  email: string;
  message: string;
  rating: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

const FeedbackSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    message: { type: String, required: true },
    rating: { type: Number, required: true },
    status: { type: String, default: "approved" },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Feedback ||
  mongoose.model<IFeedback>("Feedback", FeedbackSchema);
