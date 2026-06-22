import { prisma } from "@/lib/prisma";
import type { BankAdvicePdfData } from "./pdf-helpers";

/**
 * Fetch bank advice data for PDF generation.
 * Returns null if not found.
 */
export async function getBankAdvicePdfData(params: {
  uuid: string;
}): Promise<BankAdvicePdfData | null> {
  const { uuid } = params;

  const advice = await prisma.transfer_bank_advice.findUnique({
    where: { tba_uuid: uuid },
    include: {
      admin: {
        select: {
          admin_name: true,
        },
      },
    },
  });

  if (!advice) return null;

  return {
    serialNo: advice.serial_no,
    filePath: advice.file_path,
    createdByName: advice.admin?.admin_name ?? null,
    createdAt: advice.created_at?.toISOString() ?? null,
    adviceUuid: advice.tba_uuid,
  };
}
