import type { Meta, StoryObj } from "@storybook/nextjs";
import { Separator } from "@/components/ui/separator";

const meta: Meta<typeof Separator> = {
  title: "Primitives/Separator",
  component: Separator,
  argTypes: {
    orientation: { control: "radio", options: ["horizontal", "vertical"] },
    decorative: { control: "boolean" },
  },
  args: { orientation: "horizontal", decorative: true },
};

export default meta;
type Story = StoryObj<typeof Separator>;

export const Horizontal: Story = {
  render: () => (
    <div style={{ maxWidth: 400 }}>
      <p style={{ fontSize: "var(--text-sm)", margin: "0 0 8px" }}>
        Content above
      </p>
      <Separator />
      <p style={{ fontSize: "var(--text-sm)", margin: "8px 0 0" }}>
        Content below
      </p>
    </div>
  ),
};

export const Vertical: Story = {
  render: () => (
    <div style={{ display: "flex", alignItems: "center", gap: 12, height: 40 }}>
      <span style={{ fontSize: "var(--text-sm)" }}>Left</span>
      <Separator orientation="vertical" />
      <span style={{ fontSize: "var(--text-sm)" }}>Right</span>
    </div>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 400 }}>
      <div>
        <p style={{ fontSize: "var(--text-sm)", margin: "0 0 8px", fontWeight: 600 }}>
          Horizontal
        </p>
        <Separator />
      </div>
      <div>
        <p style={{ fontSize: "var(--text-sm)", margin: "0 0 8px", fontWeight: 600 }}>
          Vertical (inline)
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 8, height: 24 }}>
          <span style={{ fontSize: "var(--text-sm)" }}>A</span>
          <Separator orientation="vertical" />
          <span style={{ fontSize: "var(--text-sm)" }}>B</span>
          <Separator orientation="vertical" />
          <span style={{ fontSize: "var(--text-sm)" }}>C</span>
        </div>
      </div>
    </div>
  ),
};
