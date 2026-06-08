import type { Meta, StoryObj } from "@storybook/nextjs";
import { Badge } from "@/components/ui/badge";

const meta: Meta<typeof Badge> = {
  title: "Primitives/Badge",
  component: Badge,
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "secondary", "success", "warning", "outline"],
    },
  },
  args: { children: "Badge", variant: "default" },
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const Default: Story = {};

export const Secondary: Story = { args: { variant: "secondary" } };

export const Success: Story = { args: { variant: "success", children: "Approved" } };

export const Warning: Story = { args: { variant: "warning", children: "Pending" } };

export const Outline: Story = { args: { variant: "outline" } };

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      <Badge variant="default">Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="success">Success</Badge>
      <Badge variant="warning">Warning</Badge>
      <Badge variant="outline">Outline</Badge>
    </div>
  ),
};
