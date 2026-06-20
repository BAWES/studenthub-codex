import type { Meta, StoryObj } from "@storybook/nextjs";
import { Skeleton } from "@/components/ui/skeleton";

const meta: Meta<typeof Skeleton> = {
  title: "Primitives/Skeleton",
  component: Skeleton,
};

export default meta;
type Story = StoryObj<typeof Skeleton>;

export const Default: Story = {
  render: () => <Skeleton style={{ width: 200, height: 20 }} />,
};

export const Circle: Story = {
  render: () => (
    <Skeleton style={{ width: 48, height: 48, borderRadius: "50%" }} />
  ),
};

export const Text: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: 300 }}>
      <Skeleton style={{ width: "60%", height: 16 }} />
      <Skeleton style={{ width: "100%", height: 16 }} />
      <Skeleton style={{ width: "80%", height: 16 }} />
      <Skeleton style={{ width: "40%", height: 16 }} />
    </div>
  ),
};

export const Card_: Story = {
  render: () => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 12,
        maxWidth: 320,
        padding: 16,
        border: "1px solid var(--border)",
        borderRadius: "var(--radius)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <Skeleton style={{ width: 40, height: 40, borderRadius: "50%" }} />
        <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
          <Skeleton style={{ width: "50%", height: 14 }} />
          <Skeleton style={{ width: "30%", height: 12 }} />
        </div>
      </div>
      <Skeleton style={{ width: "100%", height: 12 }} />
      <Skeleton style={{ width: "100%", height: 12 }} />
      <Skeleton style={{ width: "70%", height: 12 }} />
    </div>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div>
        <p style={{ fontSize: "var(--text-sm)", fontWeight: 600, margin: "0 0 8px" }}>
          Text block
        </p>
        <Skeleton style={{ width: 200, height: 16 }} />
      </div>
      <div>
        <p style={{ fontSize: "var(--text-sm)", fontWeight: 600, margin: "0 0 8px" }}>
          Circle
        </p>
        <Skeleton style={{ width: 48, height: 48, borderRadius: "50%" }} />
      </div>
      <div>
        <p style={{ fontSize: "var(--text-sm)", fontWeight: 600, margin: "0 0 8px" }}>
          Rectangle
        </p>
        <Skeleton style={{ width: 160, height: 100 }} />
      </div>
    </div>
  ),
};
