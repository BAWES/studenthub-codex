import type { Meta, StoryObj } from "@storybook/nextjs";
import { Button } from "@/components/ui/button";
import { Mail, ArrowRight } from "lucide-react";

const meta: Meta<typeof Button> = {
  title: "Primitives/Button",
  component: Button,
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "secondary", "ghost", "outline", "destructive"],
    },
    size: { control: "select", options: ["default", "sm", "lg", "icon"] },
    disabled: { control: "boolean" },
  },
  args: { children: "Button", variant: "default", size: "default", disabled: false },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Default: Story = {};

export const Secondary: Story = { args: { variant: "secondary" } };

export const Ghost: Story = { args: { variant: "ghost" } };

export const Outline: Story = { args: { variant: "outline" } };

export const Destructive: Story = { args: { variant: "destructive" } };

export const Small: Story = { args: { size: "sm", children: "Small" } };

export const Large: Story = { args: { size: "lg", children: "Large" } };

export const Icon: Story = {
  args: { size: "icon", children: <Mail />, "aria-label": "Mail" },
};

export const WithIcon: Story = {
  args: { children: [<Mail key="icon" />, "Send message"] },
};

export const Loading: Story = {
  args: { children: [<ArrowRight key="icon" />, "Sending..."], disabled: true },
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
      <Button variant="default">Default</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="destructive">Destructive</Button>
    </div>
  ),
};
