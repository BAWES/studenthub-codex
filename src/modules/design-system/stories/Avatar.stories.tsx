import type { Meta, StoryObj } from "@storybook/nextjs";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const meta: Meta<typeof Avatar> = {
  title: "Primitives/Avatar",
  component: Avatar,
};

export default meta;
type Story = StoryObj<typeof Avatar>;

export const WithImage: Story = {
  render: () => (
    <Avatar>
      <AvatarImage src="https://i.pravatar.cc/80?img=12" alt="User" />
      <AvatarFallback>JD</AvatarFallback>
    </Avatar>
  ),
};

export const Fallback: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 8 }}>
      <Avatar>
        <AvatarFallback>KA</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback>MS</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback>ZR</AvatarFallback>
      </Avatar>
    </div>
  ),
};
