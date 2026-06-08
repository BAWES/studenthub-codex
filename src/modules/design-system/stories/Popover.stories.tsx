import type { Meta, StoryObj } from "@storybook/nextjs";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const meta: Meta<typeof Popover> = {
  title: "Primitives/Popover",
  component: Popover,
};

export default meta;
type Story = StoryObj<typeof Popover>;

export const Default: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Open popover</Button>
      </PopoverTrigger>
      <PopoverContent style={{ width: 280 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <p style={{ fontSize: "var(--text-sm)", fontWeight: 600, margin: "0 0 4px" }}>
              About this field
            </p>
            <p style={{ fontSize: "var(--text-sm)", color: "var(--muted-foreground)", margin: 0 }}>
              This information is shared with your institution and helps us verify your identity.
            </p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  ),
};

export const WithForm: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Edit dimensions</Button>
      </PopoverTrigger>
      <PopoverContent style={{ width: 240 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <p style={{ fontSize: "var(--text-sm)", fontWeight: 600, margin: 0 }}>
            Dimensions
          </p>
          <div style={{ display: "flex", gap: 8 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
              <Label htmlFor="width">Width</Label>
              <Input id="width" defaultValue="100%" />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
              <Label htmlFor="maxWidth">Max</Label>
              <Input id="maxWidth" defaultValue="300px" />
            </div>
          </div>
          <Button size="sm" style={{ alignSelf: "flex-end" }}>
            Apply
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">Info</Button>
        </PopoverTrigger>
        <PopoverContent style={{ width: 240 }}>
          <p style={{ fontSize: "var(--text-sm)", margin: 0 }}>
            A popover can display any content — text, forms, or lists.
          </p>
        </PopoverContent>
      </Popover>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="secondary">Settings</Button>
        </PopoverTrigger>
        <PopoverContent style={{ width: 200 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <p style={{ fontSize: "var(--text-sm)", fontWeight: 600, margin: 0 }}>
              Quick actions
            </p>
            <Button variant="ghost" size="sm" style={{ justifyContent: "flex-start" }}>
              Export data
            </Button>
            <Button variant="ghost" size="sm" style={{ justifyContent: "flex-start" }}>
              Clear cache
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  ),
};
