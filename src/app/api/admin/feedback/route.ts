import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Feedback from '@/models/Feedback';

export async function GET() {
  try {
    await connectToDatabase();
    // Sort by createdAt descending
    const feedbacks = await Feedback.find({}).sort({ createdAt: -1 });
    return NextResponse.json(feedbacks, { status: 200 });
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

    const newFeedback = await Feedback.create({
      name: feedbackData.name,
      email: feedbackData.email,
      message: feedbackData.message,
      status: feedbackData.status || 'approved',
    });

    return NextResponse.json(newFeedback, { status: 201 });
  } catch (error: any) {
    console.error("MongoDB Feedback Error:", error);
    return NextResponse.json(
      { error: "Failed to save feedback", details: error.message || "Unknown error" },
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
