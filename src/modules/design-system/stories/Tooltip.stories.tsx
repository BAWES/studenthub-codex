import type { Meta, StoryObj } from "@storybook/nextjs";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { InfoIcon } from "lucide-react";

const meta: Meta<typeof Tooltip> = {
  title: "Primitives/Tooltip",
  component: Tooltip,
};

export default meta;
type Story = StoryObj<typeof Tooltip>;

export const Default: Story = {
  render: () => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">Hover me</Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>This is a tooltip with helpful information.</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ),
};

export const IconTrigger: Story = {
  render: () => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span style={{ cursor: "pointer", display: "inline-flex" }}>
            <InfoIcon className="size-4 text-muted-foreground" />
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <p>Additional context about this field.</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ),
};

export const ShortText: Story = {
  render: () => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="sm">
            Save
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Ctrl+S</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <TooltipProvider>
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline">Hover</Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Tooltip on hover</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="secondary">Keyboard</Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Tooltip for keyboard shortcut</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <span style={{ display: "inline-flex", cursor: "help" }}>
              <InfoIcon className="size-4 text-muted-foreground" />
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p>Icon-only trigger</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  ),
};
