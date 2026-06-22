import type { Meta, StoryObj } from "@storybook/nextjs";
import { ScrollArea } from "@/components/ui/scroll-area";

const meta: Meta<typeof ScrollArea> = {
  title: "Primitives/ScrollArea",
  component: ScrollArea,
};

export default meta;
type Story = StoryObj<typeof ScrollArea>;

const tags = Array.from({ length: 30 }, (_, i) => `Tag ${i + 1}`);

export const Default: Story = {
  render: () => (
    <ScrollArea style={{ height: 200, width: 240, border: "1px solid var(--border)", borderRadius: "var(--radius)" }}>
      <div style={{ padding: 12 }}>
        <p style={{ fontSize: "var(--text-sm)", fontWeight: 600, margin: "0 0 8px" }}>
          Available Tags
        </p>
        {tags.map((tag) => (
          <div
            key={tag}
            style={{
              padding: "6px 8px",
              fontSize: "var(--text-sm)",
              borderBottom: "1px solid var(--border)",
            }}
          >
            {tag}
          </div>
        ))}
      </div>
    </ScrollArea>
  ),
};

export const Wide: Story = {
  render: () => (
    <ScrollArea style={{ height: 160, width: 400, border: "1px solid var(--border)", borderRadius: "var(--radius)" }}>
      <div style={{ padding: 12 }}>
        <p style={{ fontSize: "var(--text-sm)", fontWeight: 600, margin: "0 0 8px" }}>
          Horizontal overflow
        </p>
        <div style={{ display: "flex", gap: 8, width: 700 }}>
          {Array.from({ length: 12 }, (_, i) => (
            <div
              key={i}
              style={{
                flexShrink: 0,
                width: 100,
                height: 80,
                background: "var(--muted)",
                borderRadius: "var(--radius)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "var(--text-sm)",
              }}
            >
              Item {i + 1}
            </div>
          ))}
        </div>
      </div>
    </ScrollArea>
  ),
};

export const LongText: Story = {
  render: () => (
    <ScrollArea style={{ height: 180, width: 360, border: "1px solid var(--border)", borderRadius: "var(--radius)" }}>
      <div style={{ padding: 12 }}>
        <p style={{ fontSize: "var(--text-sm)", fontWeight: 600, margin: "0 0 8px" }}>
          Terms and Conditions
        </p>
        <p style={{ fontSize: "var(--text-sm)", lineHeight: 1.6, margin: 0 }}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
          minim veniam, quis nostrud exercitation ullamco laboris nisi ut
          aliquip ex ea commodo consequat. Duis aute irure dolor in
          reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
          pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
          culpa qui officia deserunt mollit anim id est laborum. Sed ut
          perspiciatis unde omnis iste natus error sit voluptatem accusantium
          doloremque laudantium, totam rem aperiam.
        </p>
      </div>
    </ScrollArea>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
      <div>
        <p style={{ fontSize: "var(--text-sm)", fontWeight: 600, margin: "0 0 8px" }}>
          Vertical scroll
        </p>
        <ScrollArea style={{ height: 140, width: 200, border: "1px solid var(--border)", borderRadius: "var(--radius)" }}>
          <div style={{ padding: 8 }}>
            {Array.from({ length: 20 }, (_, i) => (
              <div key={i} style={{ padding: "4px 0", fontSize: "var(--text-sm)", borderBottom: "1px solid var(--border)" }}>
                Row {i + 1}
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
      <div>
        <p style={{ fontSize: "var(--text-sm)", fontWeight: 600, margin: "0 0 8px" }}>
          Horizontal scroll
        </p>
        <ScrollArea style={{ height: 100, width: 240, border: "1px solid var(--border)", borderRadius: "var(--radius)" }}>
          <div style={{ display: "flex", gap: 8, padding: 8, width: 500 }}>
            {Array.from({ length: 10 }, (_, i) => (
              <div
                key={i}
                style={{
                  flexShrink: 0,
                  width: 80,
                  height: 60,
                  background: "var(--muted)",
                  borderRadius: "var(--radius)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "var(--text-xs)",
                }}
              >
                Card {i + 1}
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  ),
};
