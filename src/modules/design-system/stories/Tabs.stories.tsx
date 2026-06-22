import type { Meta, StoryObj } from "@storybook/nextjs";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const meta: Meta<typeof Tabs> = {
  title: "Primitives/Tabs",
  component: Tabs,
  argTypes: {
    orientation: {
      control: "radio",
      options: ["horizontal", "vertical"],
    },
  },
  args: { defaultValue: "tab-1", orientation: "horizontal" },
};

export default meta;
type Story = StoryObj<typeof Tabs>;

export const Default: Story = {
  render: (args: any) => (
    <Tabs {...args} style={{ maxWidth: 400 }}>
      <TabsList>
        <TabsTrigger value="tab-1">Account</TabsTrigger>
        <TabsTrigger value="tab-2">Password</TabsTrigger>
        <TabsTrigger value="tab-3">Notifications</TabsTrigger>
      </TabsList>
      <TabsContent value="tab-1">
        <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: "16px 0" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <Label htmlFor="name">Name</Label>
            <Input id="name" defaultValue="John Doe" />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <Label htmlFor="email">Email</Label>
            <Input id="email" defaultValue="john@example.com" />
          </div>
          <Button style={{ alignSelf: "flex-start" }}>Save changes</Button>
        </div>
      </TabsContent>
      <TabsContent value="tab-2">
        <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: "16px 0" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <Label htmlFor="current">Current password</Label>
            <Input id="current" type="password" />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <Label htmlFor="new">New password</Label>
            <Input id="new" type="password" />
          </div>
          <Button style={{ alignSelf: "flex-start" }}>Update password</Button>
        </div>
      </TabsContent>
      <TabsContent value="tab-3">
        <p style={{ fontSize: "var(--text-sm)", color: "var(--muted-foreground)", padding: "16px 0" }}>
          Manage your email, push, and in-app notification preferences here.
        </p>
      </TabsContent>
    </Tabs>
  ),
};

export const Vertical: Story = {
  render: () => (
    <Tabs defaultValue="v1" orientation="vertical" style={{ display: "flex", gap: 16 }}>
      <TabsList variant="default" style={{ width: 140 }}>
        <TabsTrigger value="v1">General</TabsTrigger>
        <TabsTrigger value="v2">Security</TabsTrigger>
        <TabsTrigger value="v3">Billing</TabsTrigger>
      </TabsList>
      <div style={{ flex: 1 }}>
        <TabsContent value="v1">
          <p style={{ fontSize: "var(--text-sm)" }}>General settings panel.</p>
        </TabsContent>
        <TabsContent value="v2">
          <p style={{ fontSize: "var(--text-sm)" }}>Security settings panel.</p>
        </TabsContent>
        <TabsContent value="v3">
          <p style={{ fontSize: "var(--text-sm)" }}>Billing settings panel.</p>
        </TabsContent>
      </div>
    </Tabs>
  ),
};

export const LineVariant: Story = {
  render: () => (
    <Tabs defaultValue="line-1" style={{ maxWidth: 400 }}>
      <TabsList variant="line">
        <TabsTrigger value="line-1">Overview</TabsTrigger>
        <TabsTrigger value="line-2">Analytics</TabsTrigger>
        <TabsTrigger value="line-3">Reports</TabsTrigger>
      </TabsList>
      <TabsContent value="line-1">
        <p style={{ fontSize: "var(--text-sm)", paddingTop: 12 }}>
          Overview content with the line variant tab style.
        </p>
      </TabsContent>
      <TabsContent value="line-2">
        <p style={{ fontSize: "var(--text-sm)", paddingTop: 12 }}>
          Analytics content.
        </p>
      </TabsContent>
      <TabsContent value="line-3">
        <p style={{ fontSize: "var(--text-sm)", paddingTop: 12 }}>
          Reports content.
        </p>
      </TabsContent>
    </Tabs>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      <div>
        <p style={{ fontSize: "var(--text-sm)", fontWeight: 600, margin: "0 0 8px" }}>
          Default variant (horizontal)
        </p>
        <Tabs defaultValue="a1" style={{ maxWidth: 360 }}>
          <TabsList>
            <TabsTrigger value="a1">Tab A</TabsTrigger>
            <TabsTrigger value="a2">Tab B</TabsTrigger>
          </TabsList>
          <TabsContent value="a1">
            <p style={{ fontSize: "var(--text-sm)", paddingTop: 12 }}>Content A</p>
          </TabsContent>
          <TabsContent value="a2">
            <p style={{ fontSize: "var(--text-sm)", paddingTop: 12 }}>Content B</p>
          </TabsContent>
        </Tabs>
      </div>
      <div>
        <p style={{ fontSize: "var(--text-sm)", fontWeight: 600, margin: "0 0 8px" }}>
          Line variant
        </p>
        <Tabs defaultValue="b1" style={{ maxWidth: 360 }}>
          <TabsList variant="line">
            <TabsTrigger value="b1">Profile</TabsTrigger>
            <TabsTrigger value="b2">Activity</TabsTrigger>
          </TabsList>
          <TabsContent value="b1">
            <p style={{ fontSize: "var(--text-sm)", paddingTop: 12 }}>Profile content</p>
          </TabsContent>
          <TabsContent value="b2">
            <p style={{ fontSize: "var(--text-sm)", paddingTop: 12 }}>Activity content</p>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  ),
};
