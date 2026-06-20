import type { Meta, StoryObj } from "@storybook/nextjs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

const meta: Meta<typeof Label> = {
  title: "Primitives/Label",
  component: Label,
  argTypes: {
    children: { control: "text" },
  },
  args: { children: "Email address" },
};

export default meta;
type Story = StoryObj<typeof Label>;

export const Default: Story = {
  render: (args) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <Label htmlFor="email" {...args} />
      <Input id="email" placeholder="you@example.com" />
    </div>
  ),
};

export const WithCheckbox: Story = {
  render: () => (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <Checkbox id="terms" />
      <Label htmlFor="terms">Accept terms and conditions</Label>
    </div>
  ),
};

export const DisabledPeer: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <Label htmlFor="active">Active input</Label>
        <Input id="active" placeholder="I am enabled" />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <Label htmlFor="disabled">Disabled input</Label>
        <Input id="disabled" disabled placeholder="I am disabled" />
      </div>
    </div>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <Label htmlFor="v1">Default label</Label>
        <Input id="v1" placeholder="Input with label" />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Checkbox id="v2" />
        <Label htmlFor="v2">Checkbox label</Label>
      </div>
    </div>
  ),
};
