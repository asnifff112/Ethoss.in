import { NextResponse } from 'next/server';
import path from 'path';

// ─── Environment detection ────────────────────────────────────────────────────
// On Vercel (and any production deployment), the filesystem is read-only except
// for /tmp. We therefore skip db.json writes in production and log submissions
// to Vercel Function Logs instead (visible in the Vercel dashboard).
const IS_PRODUCTION = !!process.env.VERCEL || process.env.NODE_ENV === 'production';
const DB_PATH = path.join(process.cwd(), 'src', 'data', 'db.json');

// Lazily import fs only in local dev to avoid bundling issues
async function getFs() {
  const fs = await import('fs/promises');
  return fs;
}

// ─── GET — Read all feedbacks ─────────────────────────────────────────────────
export async function GET() {
  try {
    if (IS_PRODUCTION) {
      // In production, db.json is a read-only snapshot bundled at build time.
      // Import it statically so Next.js includes it in the bundle.
      const db = await import('@/data/db.json');
      // @ts-ignore
      return NextResponse.json(db.default?.feedbacks ?? db.feedbacks ?? [], { status: 200 });
    }

    // Local dev: read the live file (so newly submitted feedback appears)
    const fs = await getFs();
    const fileContent = await fs.readFile(DB_PATH, 'utf8');
    const db = JSON.parse(fileContent);
    return NextResponse.json(db.feedbacks || [], { status: 200 });
  } catch (error) {
    console.error('[Feedback GET] Error:', error);
    return NextResponse.json({ message: 'Error loading feedback data' }, { status: 500 });
  }
}

// ─── POST — Submit new feedback ───────────────────────────────────────────────
export async function POST(request: Request) {
  try {
    const feedback = await request.json();

    const newFeedback = {
      ...feedback,
      id: `f-${Date.now()}`,
      status: feedback.status || 'approved',
    };

    if (IS_PRODUCTION) {
      // ── Vercel / Production ──────────────────────────────────────────────────
      // Filesystem is read-only. Log the submission to Vercel Function Logs
      // (visible in your Vercel dashboard under the function's logs tab).
      // Replace this with a real DB (Supabase, PlanetScale, MongoDB Atlas, etc.)
      // when you're ready to persist data in production.
      console.log('[Feedback Submission - Production]', JSON.stringify(newFeedback, null, 2));
      return NextResponse.json(newFeedback, { status: 201 });
    }

    // ── Local Development ──────────────────────────────────────────────────────
    // Persist to db.json for local testing
    try {
      const fs = await getFs();
      const fileContent = await fs.readFile(DB_PATH, 'utf8');
      const db = JSON.parse(fileContent);
      if (!db.feedbacks) db.feedbacks = [];
      db.feedbacks.unshift(newFeedback);
      await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2));
      console.log('[Feedback Submission - Local] Saved to db.json:', newFeedback.id);
    } catch (writeError) {
      // Log write failure but don't block the user — still return 201
      console.error('[Feedback Submission - Local] Could not write to db.json:', writeError);
    }

    return NextResponse.json(newFeedback, { status: 201 });
  } catch (error) {
    console.error('[Feedback POST] Unexpected error:', error);
    return NextResponse.json({ message: 'Error adding feedback' }, { status: 500 });
  }
}

// ─── DELETE — Remove a feedback entry ────────────────────────────────────────
export async function DELETE(request: Request) {
  if (IS_PRODUCTION) {
    // Deletion requires a writable DB in production
    console.warn('[Feedback DELETE] Not supported in production without a persistent database.');
    return NextResponse.json(
      { message: 'Deletion is not supported without a persistent database in this environment.' },
      { status: 501 }
    );
  }

  try {
    const { id } = await request.json();
    const fs = await getFs();
    const fileContent = await fs.readFile(DB_PATH, 'utf8');
    const db = JSON.parse(fileContent);
    db.feedbacks = (db.feedbacks || []).filter((f: { id: string }) => f.id !== id);
    await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2));
    return NextResponse.json({ message: 'Feedback deleted' }, { status: 200 });
  } catch (error) {
    console.error('[Feedback DELETE] Error:', error);
    return NextResponse.json({ message: 'Error deleting feedback' }, { status: 500 });
  }
}
