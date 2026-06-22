import type { Meta, StoryObj } from "@storybook/nextjs";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetBody,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const meta: Meta<typeof Sheet> = {
  title: "Primitives/Sheet",
  component: Sheet,
};

export default meta;
type Story = StoryObj<typeof Sheet>;

export const Default: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Open sheet</Button>
      </SheetTrigger>
      <SheetContent side="right" style={{ minWidth: 360 }}>
        <SheetHeader>
          <SheetTitle>Edit profile</SheetTitle>
          <SheetDescription>
            Make changes to your profile here. Click save when done.
          </SheetDescription>
        </SheetHeader>
        <SheetBody>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <Label htmlFor="s-name">Name</Label>
              <Input id="s-name" defaultValue="John Doe" />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <Label htmlFor="s-email">Email</Label>
              <Input id="s-email" defaultValue="john@example.com" />
            </div>
          </div>
        </SheetBody>
        <SheetFooter>
          <SheetClose asChild>
            <Button variant="outline">Cancel</Button>
          </SheetClose>
          <Button>Save changes</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  ),
};

export const LeftSide: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Left sheet</Button>
      </SheetTrigger>
      <SheetContent side="left" style={{ minWidth: 280 }}>
        <SheetHeader>
          <SheetTitle>Navigation</SheetTitle>
          <SheetDescription>
            Browse sections of the application.
          </SheetDescription>
        </SheetHeader>
        <SheetBody>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {["Dashboard", "Projects", "Team", "Settings"].map((item) => (
              <Button
                key={item}
                variant="ghost"
                style={{ justifyContent: "flex-start" }}
              >
                {item}
              </Button>
            ))}
          </div>
        </SheetBody>
      </SheetContent>
    </Sheet>
  ),
};

export const TopBottom: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 12 }}>
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline">Top</Button>
        </SheetTrigger>
        <SheetContent side="top" style={{ minWidth: "100%" }}>
          <SheetHeader>
            <SheetTitle>Top sheet</SheetTitle>
            <SheetDescription>
              A sheet that slides in from the top.
            </SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline">Bottom</Button>
        </SheetTrigger>
        <SheetContent side="bottom" style={{ minWidth: "100%" }}>
          <SheetHeader>
            <SheetTitle>Bottom sheet</SheetTitle>
            <SheetDescription>
              A sheet that slides in from the bottom.
            </SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    </div>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline">Right (default)</Button>
        </SheetTrigger>
        <SheetContent side="right" style={{ minWidth: 300 }}>
          <SheetHeader>
            <SheetTitle>Right panel</SheetTitle>
            <SheetDescription>
              Slides in from the right side.
            </SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline">Left</Button>
        </SheetTrigger>
        <SheetContent side="left" style={{ minWidth: 300 }}>
          <SheetHeader>
            <SheetTitle>Left panel</SheetTitle>
            <SheetDescription>
              Slides in from the left side.
            </SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline">Top</Button>
        </SheetTrigger>
        <SheetContent side="top">
          <SheetHeader>
            <SheetTitle>Top panel</SheetTitle>
            <SheetDescription>
              Slides in from the top.
            </SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline">Bottom</Button>
        </SheetTrigger>
        <SheetContent side="bottom">
          <SheetHeader>
            <SheetTitle>Bottom panel</SheetTitle>
            <SheetDescription>
              Slides in from the bottom.
            </SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    </div>
  ),
};
