import type { Meta, StoryObj } from "@storybook/nextjs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const meta: Meta<typeof Card> = {
  title: "Primitives/Card",
  component: Card,
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
  render: () => (
    <Card style={{ maxWidth: 400 }}>
      <CardHeader>
        <CardTitle>Account settings</CardTitle>
        <CardDescription>Manage your email and notification preferences.</CardDescription>
      </CardHeader>
      <CardContent>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <Label htmlFor="name">Display name</Label>
            <Input id="name" placeholder="Your name" />
          </div>
          <Button>Save changes</Button>
        </div>
      </CardContent>
    </Card>
  ),
};

export const Simple: Story = {
  render: () => (
    <Card style={{ maxWidth: 300, padding: 20 }}>
      <h3 style={{ margin: 0, fontSize: "var(--text-lg)", fontWeight: 600 }}>
        Quick stat
      </h3>
      <p style={{ margin: "8px 0 0", color: "var(--muted)", fontSize: "var(--text-base)" }}>
        142 active candidates this month.
      </p>
    </Card>
  ),
};
