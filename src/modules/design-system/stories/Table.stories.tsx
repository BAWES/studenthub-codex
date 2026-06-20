import type { Meta, StoryObj } from "@storybook/nextjs";
import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const meta: Meta<typeof Table> = {
  title: "Primitives/Table",
  component: Table,
};

export default meta;
type Story = StoryObj<typeof Table>;

const invoices = [
  { id: "INV-001", status: "paid", amount: "$250.00", date: "2026-06-01" },
  { id: "INV-002", status: "pending", amount: "$150.00", date: "2026-06-03" },
  { id: "INV-003", status: "overdue", amount: "$350.00", date: "2026-05-28" },
  { id: "INV-004", status: "paid", amount: "$450.00", date: "2026-05-20" },
  { id: "INV-005", status: "pending", amount: "$550.00", date: "2026-06-07" },
];

const statusVariant: Record<string, "success" | "warning" | "default"> = {
  paid: "success",
  pending: "warning",
  overdue: "default",
};

export const Default: Story = {
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Invoice</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead style={{ textAlign: "right" }}>Date</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.map((inv) => (
          <TableRow key={inv.id}>
            <TableCell style={{ fontWeight: 500 }}>{inv.id}</TableCell>
            <TableCell>
              <Badge variant={statusVariant[inv.status]}>
                {inv.status}
              </Badge>
            </TableCell>
            <TableCell>{inv.amount}</TableCell>
            <TableCell style={{ textAlign: "right" }}>{inv.date}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};

export const WithFooter: Story = {
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Item</TableHead>
          <TableHead style={{ textAlign: "right" }}>Qty</TableHead>
          <TableHead style={{ textAlign: "right" }}>Price</TableHead>
          <TableHead style={{ textAlign: "right" }}>Total</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>Widget A</TableCell>
          <TableCell style={{ textAlign: "right" }}>2</TableCell>
          <TableCell style={{ textAlign: "right" }}>$25.00</TableCell>
          <TableCell style={{ textAlign: "right" }}>$50.00</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Widget B</TableCell>
          <TableCell style={{ textAlign: "right" }}>1</TableCell>
          <TableCell style={{ textAlign: "right" }}>$75.00</TableCell>
          <TableCell style={{ textAlign: "right" }}>$75.00</TableCell>
        </TableRow>
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={3}>Subtotal</TableCell>
          <TableCell style={{ textAlign: "right" }}>$125.00</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  ),
};

export const WithCaption: Story = {
  render: () => (
    <Table>
      <TableCaption>Recent invoice activity for June 2026.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Invoice</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.slice(0, 3).map((inv) => (
          <TableRow key={inv.id}>
            <TableCell>{inv.id}</TableCell>
            <TableCell>
              <Badge variant={statusVariant[inv.status]}>
                {inv.status}
              </Badge>
            </TableCell>
            <TableCell>{inv.amount}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <Table>
      <TableCaption>All invoice statuses across the platform.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Invoice</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead style={{ textAlign: "right" }}>Date</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.map((inv) => (
          <TableRow key={inv.id}>
            <TableCell style={{ fontWeight: 500 }}>{inv.id}</TableCell>
            <TableCell>
              <Badge variant={statusVariant[inv.status]}>
                {inv.status}
              </Badge>
            </TableCell>
            <TableCell>{inv.amount}</TableCell>
            <TableCell style={{ textAlign: "right" }}>{inv.date}</TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={2}>Total</TableCell>
          <TableCell colSpan={2} style={{ textAlign: "right" }}>
            $1,750.00
          </TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  ),
};
