import type { Meta, StoryObj } from "@storybook/nextjs";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { InfoIcon, TriangleAlertIcon, CircleCheckIcon, OctagonXIcon } from "lucide-react";

const meta: Meta<typeof Alert> = {
  title: "Primitives/Alert",
  component: Alert,
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "destructive"],
    },
  },
  args: { variant: "default" },
};

export default meta;
type Story = StoryObj<typeof Alert>;

export const Default: Story = {
  render: (args: any) => (
    <Alert {...args}>
      <InfoIcon className="size-4" />
      <AlertTitle>Information</AlertTitle>
      <AlertDescription>
        Your changes have been saved successfully.
      </AlertDescription>
    </Alert>
  ),
};

export const Destructive: Story = {
  args: { variant: "destructive" },
  render: (args: any) => (
    <Alert {...args}>
      <TriangleAlertIcon className="size-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>
        Your session has expired. Please log in again to continue.
      </AlertDescription>
    </Alert>
  ),
};

export const WithoutTitle: Story = {
  render: (args: any) => (
    <Alert {...args}>
      <CircleCheckIcon className="size-4" />
      <AlertDescription>
        Task completed — 142 records processed.
      </AlertDescription>
    </Alert>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 480 }}>
      <Alert variant="default">
        <InfoIcon className="size-4" />
        <AlertTitle>Info</AlertTitle>
        <AlertDescription>
          A new version of the application is available.
        </AlertDescription>
      </Alert>
      <Alert variant="destructive">
        <OctagonXIcon className="size-4" />
        <AlertTitle>Destructive</AlertTitle>
        <AlertDescription>
          This action cannot be undone. Proceed with caution.
        </AlertDescription>
      </Alert>
      <Alert variant="default">
        <TriangleAlertIcon className="size-4" />
        <AlertTitle>Warning</AlertTitle>
        <AlertDescription>
          Your storage is almost full. Consider upgrading your plan.
        </AlertDescription>
      </Alert>
    </div>
  ),
};
