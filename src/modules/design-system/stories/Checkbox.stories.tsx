import type { Meta, StoryObj } from "@storybook/nextjs";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

const meta: Meta<typeof Checkbox> = {
  title: "Primitives/Checkbox",
  component: Checkbox,
};

export default meta;
type Story = StoryObj<typeof Checkbox>;

export const Default: Story = {
  render: () => (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <Checkbox id="terms" />
      <Label htmlFor="terms">Accept terms and conditions</Label>
    </div>
  ),
};

export const Checked: Story = {
  render: () => (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <Checkbox id="checked" defaultChecked />
      <Label htmlFor="checked">Subscribed to newsletter</Label>
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Checkbox id="dis1" disabled />
        <Label htmlFor="dis1">Disabled unchecked</Label>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Checkbox id="dis2" disabled defaultChecked />
        <Label htmlFor="dis2">Disabled checked</Label>
      </div>
    </div>
  ),
};
