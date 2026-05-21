"use client";

import { Ban, CheckCircle, Clock, Lock, Unlock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toggleCandidatePaidAction, toggleTransferStatusAction, markPaymentReceivedAction, deleteTransferAction } from "@/modules/finance/actions";

type TransferDetail = {
  transfer: {
    transfer_id: number;
    total: any;
    company_total: any;
    transfer_cost: any;
    transfer_status: number;
    start_date: Date | null;
    end_date: Date | null;
    payment_received_on: Date | null;
    transfer_created_at: Date;
    transfer_updated_at: Date;
    currency_code: string | null;
    company: { company_name: string | null; company_email: string | null } | null;
  } | null;
  candidates: { id: number; title: string; subtitle: string; meta: string }[];
  invoices: { id: number; title: string; subtitle: string; meta: string }[];
};

export function TransferActionBar({ data }: { data: TransferDetail }) {
  if (!data.transfer) return null;

  const isLocked = data.transfer.transfer_status !== 10;

  return (
    <section className="flex flex-col gap-4 mb-6">
      <div className="flex flex-wrap gap-2 items-center">
        <form action={toggleTransferStatusAction}>
          <input name="transfer_id" type="hidden" value={data.transfer.transfer_id} />
          <Button type="submit" variant={isLocked ? "secondary" : "outline"}>
            {isLocked ? <Unlock aria-hidden="true" /> : <Lock aria-hidden="true" />}
            {isLocked ? "Unlock transfer" : "Lock transfer"}
          </Button>
        </form>

        <PaymentReceivedForm transferId={data.transfer.transfer_id} currentDate={data.transfer.payment_received_on} />

        <form action={deleteTransferAction}>
          <input name="transfer_id" type="hidden" value={data.transfer.transfer_id} />
          <Button type="submit" variant="destructive">
            <Ban aria-hidden="true" />
            Delete
          </Button>
        </form>
      </div>

      {data.candidates.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Candidate Payouts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              {data.candidates.map((candidate) => (
                <CandidatePayoutRow key={candidate.id} candidate={candidate} transferId={data.transfer!.transfer_id} />
              ))}
            </div>
          </CardContent>
        </Card>
      ) : null}
    </section>
  );
}

function CandidatePayoutRow({ candidate, transferId }: { candidate: TransferDetail["candidates"][number]; transferId: number }) {
  const isPaid = candidate.meta?.includes("Paid");

  return (
    <div className="flex items-center justify-between p-2.5 px-3.5 border border-[var(--line)] rounded-lg bg-[var(--surface)]">
      <div className="flex flex-col gap-0.5 min-w-0">
        <strong className="text-sm font-semibold text-[var(--ink)]">{candidate.title}</strong>
        <span className="text-[13px] text-[var(--muted)]">{candidate.subtitle}</span>
        <small className="text-[13px] text-[var(--muted)]">{candidate.meta}</small>
      </div>
      <form action={toggleCandidatePaidAction}>
        <input name="transfer_id" type="hidden" value={transferId} />
        <input name="tc_id" type="hidden" value={candidate.id} />
        <Button type="submit" variant={isPaid ? "secondary" : "outline"} size="sm">
          {isPaid ? <CheckCircle aria-hidden="true" /> : <Clock aria-hidden="true" />}
          {isPaid ? "Mark unpaid" : "Mark paid"}
        </Button>
      </form>
    </div>
  );
}

function PaymentReceivedForm({ transferId, currentDate }: { transferId: number; currentDate: Date | null }) {
  return (
    <form action={markPaymentReceivedAction} className="flex gap-2 items-center">
      <input name="transfer_id" type="hidden" value={transferId} />
      <Input
        name="received_on"
        type="date"
        defaultValue={currentDate ? new Date(currentDate).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10)}
      />
      <Button type="submit" variant="secondary">
        <CheckCircle aria-hidden="true" />
        Payment received
      </Button>
    </form>
  );
}
