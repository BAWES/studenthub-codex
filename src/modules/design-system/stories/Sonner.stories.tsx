import type { Meta, StoryObj } from "@storybook/nextjs";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const meta: Meta<typeof Toaster> = {
  title: "Primitives/Sonner",
  component: Toaster,
};

export default meta;
type Story = StoryObj<typeof Toaster>;

export const Default: Story = {
  render: () => (
    <div>
      <Toaster />
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <Button onClick={() => toast("Event has been created")}>
          Default toast
        </Button>
        <Button onClick={() => toast.success("Changes saved successfully")}>
          Success toast
        </Button>
        <Button onClick={() => toast.error("Failed to save changes")}>
          Error toast
        </Button>
        <Button onClick={() => toast.warning("Your session will expire soon")}>
          Warning toast
        </Button>
        <Button onClick={() => toast.info("New update available")}>
          Info toast
        </Button>
        <Button
          onClick={() =>
            toast.loading("Processing your request...", {
              duration: 3000,
            })
          }
        >
          Loading toast
        </Button>
      </div>
    </div>
  ),
};

export const WithDescription: Story = {
  render: () => (
    <div>
      <Toaster />
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <Button
          onClick={() =>
            toast("Account updated", {
              description: "Your profile changes have been applied.",
            })
          }
        >
          With description
        </Button>
        <Button
          onClick={() =>
            toast.success("File uploaded", {
              description: "document.pdf (2.4 MB) has been uploaded.",
            })
          }
        >
          Success with description
        </Button>
        <Button
          onClick={() =>
            toast.error("Upload failed", {
              description: "File exceeds the 10 MB size limit.",
            })
          }
        >
          Error with description
        </Button>
      </div>
    </div>
  ),
};

export const WithAction: Story = {
  render: () => (
    <div>
      <Toaster />
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <Button
          onClick={() =>
            toast("Item deleted", {
              description: "The item has been removed from your list.",
              action: {
                label: "Undo",
                onClick: () => toast("Undo successful"),
              },
            })
          }
        >
          Toast with action
        </Button>
        <Button
          onClick={() =>
            toast.error("Connection lost", {
              description: "Check your internet connection.",
              action: {
                label: "Retry",
                onClick: () => toast.info("Retrying..."),
              },
            })
          }
        >
          Error with action
        </Button>
      </div>
    </div>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div>
      <Toaster />
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <Button variant="default" onClick={() => toast("Default message")}>
          Default
        </Button>
        <Button variant="secondary" onClick={() => toast.success("Success message")}>
          Success
        </Button>
        <Button variant="destructive" onClick={() => toast.error("Error message")}>
          Error
        </Button>
        <Button variant="outline" onClick={() => toast.warning("Warning message")}>
          Warning
        </Button>
        <Button variant="ghost" onClick={() => toast.info("Info message")}>
          Info
        </Button>
        <Button variant="outline" onClick={() => toast.loading("Loading...")}>
          Loading
        </Button>
      </div>
    </div>
  ),
};
