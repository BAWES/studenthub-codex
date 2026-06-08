import type { Meta, StoryObj } from "@storybook/nextjs";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

const meta: Meta<typeof Accordion> = {
  title: "Primitives/Accordion",
  component: Accordion,
  argTypes: {
    type: {
      control: "radio",
      options: ["single", "multiple"],
    },
  },
  args: { type: "single", defaultValue: "item-1" },
};

export default meta;
type Story = StoryObj<typeof Accordion>;

export const Default: Story = {
  render: (args) => (
    <Accordion {...args} style={{ maxWidth: 400 }}>
      <AccordionItem value="item-1">
        <AccordionTrigger>What is StudentHub?</AccordionTrigger>
        <AccordionContent>
          StudentHub is a platform for managing student applications, documents,
          and placements.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>How do I apply?</AccordionTrigger>
        <AccordionContent>
          Create an account, upload your documents, and submit your application
          through the dashboard.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>Is it free?</AccordionTrigger>
        <AccordionContent>
          Yes, StudentHub is free for students. Institutions may have separate
          billing plans.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};

export const SingleItem: Story = {
  render: (args) => (
    <Accordion {...args} style={{ maxWidth: 400 }}>
      <AccordionItem value="faq-1">
        <AccordionTrigger>How do I reset my password?</AccordionTrigger>
        <AccordionContent>
          Go to Settings, click on &ldquo;Change Password,&rdquo; and follow the
          instructions sent to your email.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};

export const MultipleOpen: Story = {
  render: () => (
    <Accordion type="multiple" defaultValue={["m-1", "m-2"]} style={{ maxWidth: 400 }}>
      <AccordionItem value="m-1">
        <AccordionTrigger>First item</AccordionTrigger>
        <AccordionContent>
          This is the first item content. Multiple items can be open at once.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="m-2">
        <AccordionTrigger>Second item</AccordionTrigger>
        <AccordionContent>
          This is the second item content. Both items are open.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="m-3">
        <AccordionTrigger>Third item</AccordionTrigger>
        <AccordionContent>
          This is the third item content. You can open it too.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 480 }}>
      <div>
        <p style={{ fontSize: "var(--text-sm)", fontWeight: 600, margin: "0 0 8px" }}>
          Single-select (one open at a time)
        </p>
        <Accordion type="single" defaultValue="s-1">
          <AccordionItem value="s-1">
            <AccordionTrigger>Profile settings</AccordionTrigger>
            <AccordionContent>
              Manage your name, email, and notification preferences.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="s-2">
            <AccordionTrigger>Privacy controls</AccordionTrigger>
            <AccordionContent>
              Control who can see your profile and activity.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
      <div>
        <p style={{ fontSize: "var(--text-sm)", fontWeight: 600, margin: "0 0 8px" }}>
          Multi-select (multiple open at once)
        </p>
        <Accordion type="multiple" defaultValue={["ms-1", "ms-2"]}>
          <AccordionItem value="ms-1">
            <AccordionTrigger>Billing</AccordionTrigger>
            <AccordionContent>
              View invoices and update payment methods.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="ms-2">
            <AccordionTrigger>Team</AccordionTrigger>
            <AccordionContent>
              Invite and manage team members.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  ),
};
