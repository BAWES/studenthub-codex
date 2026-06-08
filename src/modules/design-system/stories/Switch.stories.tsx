import type { Meta, StoryObj } from "@storybook/nextjs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const meta: Meta<typeof Switch> = {
  title: "Primitives/Switch",
  component: Switch,
};

export default meta;
type Story = StoryObj<typeof Switch>;

export const Default: Story = {
  render: () => (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <Switch id="airplane" />
      <Label htmlFor="airplane">Airplane mode</Label>
    </div>
  ),
};

export const Checked: Story = {
  render: () => (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <Switch id="notif" defaultChecked />
      <Label htmlFor="notif">Push notifications</Label>
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Switch id="dis1" disabled />
        <Label htmlFor="dis1">Disabled off</Label>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Switch id="dis2" disabled defaultChecked />
        <Label htmlFor="dis2">Disabled on</Label>
      </div>
    </div>
  ),
};
