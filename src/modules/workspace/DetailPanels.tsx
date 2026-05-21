import type { Route } from "next";
import Link from "next/link";

type Fact = {
  label: string;
  value: string | number | null | undefined;
};

type Row = {
  id: string | number;
  title: string;
  subtitle: string;
  meta?: string;
  href?: string;
};

export function FactPanel({ title, facts }: { title: string; facts: Fact[] }) {
  return (
    <section className="mt-5 border border-[var(--line)] bg-[var(--surface)]">
      <h2 className="m-0 p-[18px] border-b border-[var(--line)]">{title}</h2>
      <div className="grid grid-cols-4">
        {facts.map((fact) => (
          <div
            className="min-h-[88px] px-[18px] py-4 border-r border-b border-[var(--line)] [&:nth-child(4n)]:border-r-0"
            key={fact.label}
          >
            <span className="block mb-2 text-[var(--muted)] text-xs font-extrabold uppercase">{fact.label}</span>
            <strong className="block break-words text-[15px]">{fact.value ?? "Not set"}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}

export function CompactList({ title, rows }: { title: string; rows: Row[] }) {
  return (
    <section className="mt-5 border border-[var(--line)] bg-[var(--surface)]">
      <div className="min-h-14 flex items-center justify-between gap-4 px-[18px] py-[18px] pb-3.5 border-b border-[var(--line)]">
        <h2 className="mb-0">{title}</h2>
        <span className="min-w-[30px] min-h-[30px] inline-flex items-center justify-center text-[var(--blue)] border border-[#b7cff0] bg-[#eef5ff] font-bold">
          {rows.length}
        </span>
      </div>
      <div className="grid">
        {rows.length ? (
          rows.map((row) => (
            <article
              className={`min-h-[72px] grid ${row.meta ? "grid-cols-[minmax(0,1fr)_minmax(126px,auto)]" : "grid-cols-[minmax(0,1fr)]"} gap-4 px-[18px] py-3.5 border-b border-[var(--line)] last:border-b-0`}
              key={row.id}
            >
              <div className="min-w-0 grid content-center gap-1.5">
                {row.href ? (
                  <Link
                    className="text-inherit no-underline hover:text-[var(--blue)] hover:underline hover:underline-offset-[3px]"
                    href={row.href as Route}
                  >
                    <strong className="block overflow-hidden text-ellipsis whitespace-nowrap">{row.title}</strong>
                  </Link>
                ) : (
                  <strong className="block overflow-hidden text-ellipsis whitespace-nowrap">{row.title}</strong>
                )}
                <span className="overflow-hidden text-ellipsis whitespace-nowrap text-[var(--muted)]">{row.subtitle}</span>
              </div>
              {row.meta ? (
                <div className="min-w-0 grid content-center justify-items-end text-right gap-1.5">
                  <span className="overflow-hidden text-ellipsis whitespace-nowrap text-[var(--muted)]">{row.meta}</span>
                </div>
              ) : null}
            </article>
          ))
        ) : (
          <p className="grid gap-1.5 p-[18px] text-[var(--muted)]">
            <strong className="text-[var(--ink)] text-[15px]">No records found</strong>
            No imported records found here yet.
          </p>
        )}
      </div>
    </section>
  );
}
