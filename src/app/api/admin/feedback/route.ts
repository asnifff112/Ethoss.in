import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Feedback from '@/models/Feedback';

export async function GET() {
  try {
    await connectToDatabase();
    // Sort by createdAt descending
    const feedbacks = await Feedback.find({}).sort({ createdAt: -1 }).lean();
    
    // Map Mongoose schema (name, email, message) to frontend expectations (userName, userEmail, comment)
    const formattedFeedbacks = feedbacks.map((f: any) => ({
      id: f._id.toString(),
      userName: f.name,
      userEmail: f.email,
      comment: f.message,
      rating: f.rating,
      status: f.status,
      createdAt: f.createdAt,
    }));

    return NextResponse.json(formattedFeedbacks, { status: 200 });
  } catch (error) {
    console.error('[Feedback GET] Error:', error);
    return NextResponse.json({ message: 'Error loading feedback data' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const feedbackData = await request.json();
    console.log("Incoming feedback payload:", feedbackData);

    await connectToDatabase();

    // Map the incoming payload to the strict Mongoose schema
    const newFeedback = await Feedback.create({
      name: feedbackData.userName || feedbackData.name || feedbackData.Name || "Anonymous",
      email: feedbackData.userEmail || feedbackData.email || feedbackData.Email || "no-email@provided.com",
      message: feedbackData.comment || feedbackData.message || feedbackData.Message || "",
      rating: feedbackData.rating || 5,
      status: feedbackData.status || 'approved',
    });

    return NextResponse.json(newFeedback, { status: 201 });
  } catch (error: any) {
    console.error("MongoDB Feedback Error:", error);
    return NextResponse.json(
      { message: error.message || "Unknown Server Error", error: error.toString() },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    await connectToDatabase();
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ message: 'Feedback ID is required' }, { status: 400 });
    }

    const deletedFeedback = await Feedback.findByIdAndDelete(id);

    if (!deletedFeedback) {
      return NextResponse.json({ message: 'Feedback not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Feedback deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('[Feedback DELETE] Error:', error);
    return NextResponse.json({ message: 'Error deleting feedback' }, { status: 500 });
  }
}
