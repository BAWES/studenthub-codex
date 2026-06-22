import { NextRequest, NextResponse } from "next/server";
import { listJobs, createJob } from "@/modules/employer/jobs/actions";
import {
  listJobsSchema,
  createJobSchema,
} from "@/modules/employer/jobs/schemas";

export const dynamic = "force-dynamic";

/**
 * GET /api/employer/jobs
 *
 * List job listings with pagination and optional filters.
 * Query params: page, limit, status, q
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const rawParams = Object.fromEntries(searchParams.entries());

    const parsed = listJobsSchema.safeParse(rawParams);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: parsed.error.issues },
        { status: 400 },
      );
    }

    const result = await listJobs(parsed.data);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * POST /api/employer/jobs
 *
 * Create a new job listing.
 * Body: { employerId?, title, description, requirements?, location?, employmentType?, salaryRange?, status? }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const parsed = createJobSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: parsed.error.issues },
        { status: 400 },
      );
    }

    const result = await createJob(parsed.data);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 },
      );
    }
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
