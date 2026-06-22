import type { Meta, StoryObj } from "@storybook/nextjs";
import { Progress } from "@/components/ui/progress";

const meta: Meta<typeof Progress> = {
  title: "Primitives/Progress",
  component: Progress,
  argTypes: {
    value: { control: { type: "range", min: 0, max: 100 } },
  },
  args: { value: 40 },
};

export default meta;
type Story = StoryObj<typeof Progress>;

export const Default: Story = {};

export const Empty: Story = { args: { value: 0 } };

export const Half: Story = { args: { value: 50 } };

export const Complete: Story = { args: { value: 100 } };

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 400 }}>
      <div>
        <p style={{ fontSize: "var(--text-sm)", margin: "0 0 6px" }}>
          0% — Not started
        </p>
        <Progress value={0} />
      </div>
      <div>
        <p style={{ fontSize: "var(--text-sm)", margin: "0 0 6px" }}>
          25% — Quarter
        </p>
        <Progress value={25} />
      </div>
      <div>
        <p style={{ fontSize: "var(--text-sm)", margin: "0 0 6px" }}>
          50% — Halfway
        </p>
        <Progress value={50} />
      </div>
      <div>
        <p style={{ fontSize: "var(--text-sm)", margin: "0 0 6px" }}>
          75% — Almost there
        </p>
        <Progress value={75} />
      </div>
      <div>
        <p style={{ fontSize: "var(--text-sm)", margin: "0 0 6px" }}>
          100% — Complete
        </p>
        <Progress value={100} />
      </div>
    </div>
  ),
};
