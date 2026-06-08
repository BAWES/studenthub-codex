import type { Meta, StoryObj } from "@storybook/nextjs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const meta: Meta<typeof Input> = {
  title: "Primitives/Input",
  component: Input,
  argTypes: {
    disabled: { control: "boolean" },
    placeholder: { control: "text" },
  },
  args: { placeholder: "Enter value..." },
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {};

export const Disabled: Story = { args: { disabled: true, value: "Disabled value" } };

export const WithLabel: Story = {
  render: (args) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <Label htmlFor="demo">Email</Label>
      <Input id="demo" {...args} />
    </div>
  ),
};

export const TextareaStory: Story = {
  render: () => (
    <Textarea placeholder="Write your message..." rows={4} />
  ),
  name: "Textarea",
};

export const TextareaWithLabel: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <Label htmlFor="bio">Bio</Label>
      <Textarea id="bio" placeholder="Tell us about yourself..." rows={4} />
    </div>
  ),
};
