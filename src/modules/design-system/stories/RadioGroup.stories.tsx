import type { Meta, StoryObj } from "@storybook/nextjs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

const meta: Meta<typeof RadioGroup> = {
  title: "Primitives/RadioGroup",
  component: RadioGroup,
  argTypes: {
    disabled: { control: "boolean" },
  },
  args: { defaultValue: "option-1" },
};

export default meta;
type Story = StoryObj<typeof RadioGroup>;

export const Default: Story = {
  render: (args) => (
    <RadioGroup {...args}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <RadioGroupItem value="option-1" id="r1" />
        <Label htmlFor="r1">Option one</Label>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <RadioGroupItem value="option-2" id="r2" />
        <Label htmlFor="r2">Option two</Label>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <RadioGroupItem value="option-3" id="r3" />
        <Label htmlFor="r3">Option three</Label>
      </div>
    </RadioGroup>
  ),
};

export const Horizontal: Story = {
  render: (args) => (
    <RadioGroup
      {...args}
      defaultValue="horizontal-1"
      style={{ display: "flex", gap: 16 }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <RadioGroupItem value="horizontal-1" id="h1" />
        <Label htmlFor="h1">Left</Label>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <RadioGroupItem value="horizontal-2" id="h2" />
        <Label htmlFor="h2">Center</Label>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <RadioGroupItem value="horizontal-3" id="h3" />
        <Label htmlFor="h3">Right</Label>
      </div>
    </RadioGroup>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div>
        <p style={{ fontSize: "var(--text-sm)", fontWeight: 600, margin: "0 0 8px" }}>
          Disabled group
        </p>
        <RadioGroup defaultValue="d1" disabled>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <RadioGroupItem value="d1" id="d1" />
            <Label htmlFor="d1">Cannot change</Label>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <RadioGroupItem value="d2" id="d2" />
            <Label htmlFor="d2">Also disabled</Label>
          </div>
        </RadioGroup>
      </div>
    </div>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 400 }}>
      <div>
        <p style={{ fontSize: "var(--text-sm)", fontWeight: 600, margin: "0 0 8px" }}>
          Plan selection
        </p>
        <RadioGroup defaultValue="free">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 0",
            }}
          >
            <RadioGroupItem value="free" id="free" />
            <Label htmlFor="free">Free — Basic features</Label>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 0",
            }}
          >
            <RadioGroupItem value="pro" id="pro" />
            <Label htmlFor="pro">Pro — Advanced features</Label>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 0",
            }}
          >
            <RadioGroupItem value="enterprise" id="enterprise" />
            <Label htmlFor="enterprise">Enterprise — Everything included</Label>
          </div>
        </RadioGroup>
      </div>
      <div>
        <p style={{ fontSize: "var(--text-sm)", fontWeight: 600, margin: "0 0 8px" }}>
          Horizontal layout
        </p>
        <RadioGroup defaultValue="yes" style={{ display: "flex", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <RadioGroupItem value="yes" id="yes" />
            <Label htmlFor="yes">Yes</Label>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <RadioGroupItem value="no" id="no" />
            <Label htmlFor="no">No</Label>
          </div>
        </RadioGroup>
      </div>
    </div>
  ),
};
