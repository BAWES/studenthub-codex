import type { Meta, StoryObj } from "@storybook/nextjs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const meta: Meta<typeof Textarea> = {
  title: "Primitives/Textarea",
  component: Textarea,
  argTypes: {
    disabled: { control: "boolean" },
    placeholder: { control: "text" },
    rows: { control: "number" },
  },
  args: { placeholder: "Write your message...", rows: 4 },
};

export default meta;
type Story = StoryObj<typeof Textarea>;

export const Default: Story = {};

export const Disabled: Story = {
  args: { disabled: true, value: "This textarea is disabled." },
};

export const WithLabel: Story = {
  render: (args) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <Label htmlFor="bio">Bio</Label>
      <Textarea id="bio" {...args} />
    </div>
  ),
};

export const WithValue: Story = {
  args: {
    value:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    rows: 5,
  },
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 400 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <Label htmlFor="t1">Default</Label>
        <Textarea id="t1" placeholder="Default textarea..." rows={3} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <Label htmlFor="t2">Disabled</Label>
        <Textarea id="t2" disabled value="Disabled textarea" rows={3} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <Label htmlFor="t3">With content</Label>
        <Textarea
          id="t3"
          value="Prefilled content that spans multiple lines of text."
          rows={3}
          onChange={() => {}}
        />
      </div>
    </div>
  ),
};
