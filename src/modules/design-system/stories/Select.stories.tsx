import type { Meta, StoryObj } from "@storybook/nextjs";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const meta: Meta<typeof Select> = {
  title: "Primitives/Select",
  component: Select,
};

export default meta;
type Story = StoryObj<typeof Select>;

export const Default: Story = {
  render: () => (
    <Select>
      <SelectTrigger style={{ width: 200 }}>
        <SelectValue placeholder="Select a fruit" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Fruits</SelectLabel>
          <SelectItem value="apple">Apple</SelectItem>
          <SelectItem value="banana">Banana</SelectItem>
          <SelectItem value="orange">Orange</SelectItem>
          <SelectItem value="grape">Grape</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  ),
};

export const WithGroups: Story = {
  render: () => (
    <Select>
      <SelectTrigger style={{ width: 240 }}>
        <SelectValue placeholder="Select food" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Fruits</SelectLabel>
          <SelectItem value="apple">Apple</SelectItem>
          <SelectItem value="banana">Banana</SelectItem>
        </SelectGroup>
        <SelectSeparator />
        <SelectGroup>
          <SelectLabel>Vegetables</SelectLabel>
          <SelectItem value="carrot">Carrot</SelectItem>
          <SelectItem value="broccoli">Broccoli</SelectItem>
        </SelectGroup>
        <SelectSeparator />
        <SelectGroup>
          <SelectLabel>Grains</SelectLabel>
          <SelectItem value="rice">Rice</SelectItem>
          <SelectItem value="quinoa">Quinoa</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  ),
};

export const Small: Story = {
  render: () => (
    <Select>
      <SelectTrigger size="sm" style={{ width: 180 }}>
        <SelectValue placeholder="Small select" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="option-1">Option 1</SelectItem>
        <SelectItem value="option-2">Option 2</SelectItem>
        <SelectItem value="option-3">Option 3</SelectItem>
      </SelectContent>
    </Select>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <Select>
        <SelectTrigger style={{ width: 200 }}>
          <SelectValue placeholder="Enabled" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="a">Option A</SelectItem>
          <SelectItem value="b">Option B</SelectItem>
        </SelectContent>
      </Select>
      <Select disabled>
        <SelectTrigger style={{ width: 200 }}>
          <SelectValue placeholder="Disabled" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="a">Option A</SelectItem>
          <SelectItem value="b">Option B</SelectItem>
        </SelectContent>
      </Select>
    </div>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 300 }}>
      <div>
        <p style={{ fontSize: "var(--text-sm)", fontWeight: 600, margin: "0 0 8px" }}>
          Default size
        </p>
        <Select>
          <SelectTrigger style={{ width: 200 }}>
            <SelectValue placeholder="Select..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">Item 1</SelectItem>
            <SelectItem value="2">Item 2</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <p style={{ fontSize: "var(--text-sm)", fontWeight: 600, margin: "0 0 8px" }}>
          Small size
        </p>
        <Select>
          <SelectTrigger size="sm" style={{ width: 200 }}>
            <SelectValue placeholder="Small..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="a">Option A</SelectItem>
            <SelectItem value="b">Option B</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <p style={{ fontSize: "var(--text-sm)", fontWeight: 600, margin: "0 0 8px" }}>
          With groups
        </p>
        <Select>
          <SelectTrigger style={{ width: 240 }}>
            <SelectValue placeholder="Grouped select" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Group A</SelectLabel>
              <SelectItem value="a1">Alpha</SelectItem>
              <SelectItem value="a2">Beta</SelectItem>
            </SelectGroup>
            <SelectSeparator />
            <SelectGroup>
              <SelectLabel>Group B</SelectLabel>
              <SelectItem value="b1">Gamma</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </div>
  ),
};
