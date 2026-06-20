import { NextRequest, NextResponse } from "next/server";
import { updateJob, deleteJob } from "@/modules/employer/jobs/actions";

export const dynamic = "force-dynamic";

/**
 * PUT /api/employer/jobs/[id]
 *
 * Update an existing job listing (partial update).
 * Body: { title?, description?, requirements?, location?, employmentType?, salaryRange?, status? }
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const jobId = Number(id);
    if (!Number.isInteger(jobId) || jobId < 1) {
      return NextResponse.json(
        { error: "Invalid job ID; must be a positive integer" },
        { status: 400 },
      );
    }

    const body = await request.json();
    const result = await updateJob({ jobId, ...body });
    return NextResponse.json(result, { status: 200 });
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

/**
 * DELETE /api/employer/jobs/[id]
 *
 * Delete a job listing.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const jobId = Number(id);
    if (!Number.isInteger(jobId) || jobId < 1) {
      return NextResponse.json(
        { error: "Invalid job ID; must be a positive integer" },
        { status: 400 },
      );
    }

    const result = await deleteJob({ jobId });
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
