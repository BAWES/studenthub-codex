import type { Meta, StoryObj } from "@storybook/nextjs";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import {
  CalculatorIcon,
  CalendarIcon,
  SettingsIcon,
  UserIcon,
} from "lucide-react";

const meta: Meta<typeof Command> = {
  title: "Primitives/Command",
  component: Command,
};

export default meta;
type Story = StoryObj<typeof Command>;

export const Default: Story = {
  render: () => (
    <Command
      style={{ maxWidth: 400, border: "1px solid var(--border)", borderRadius: "var(--radius)" }}
    >
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Suggestions">
          <CommandItem>
            <CalendarIcon className="size-4" />
            Calendar
          </CommandItem>
          <CommandItem>
            <CalculatorIcon className="size-4" />
            Calculator
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Settings">
          <CommandItem>
            <UserIcon className="size-4" />
            Profile
            <CommandShortcut>Ctrl+P</CommandShortcut>
          </CommandItem>
          <CommandItem>
            <SettingsIcon className="size-4" />
            Settings
            <CommandShortcut>Ctrl+,</CommandShortcut>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  ),
};

export const WithItems: Story = {
  render: () => (
    <Command
      style={{ maxWidth: 400, border: "1px solid var(--border)", borderRadius: "var(--radius)" }}
    >
      <CommandInput placeholder="Search actions..." />
      <CommandList>
        <CommandEmpty>No matching actions.</CommandEmpty>
        <CommandGroup heading="Actions">
          {["Copy", "Cut", "Paste", "Select all", "Undo", "Redo"].map(
            (action) => (
              <CommandItem key={action} value={action}>
                {action}
              </CommandItem>
            )
          )}
        </CommandGroup>
      </CommandList>
    </Command>
  ),
};

export const EmptyState: Story = {
  render: () => (
    <Command
      style={{ maxWidth: 400, border: "1px solid var(--border)", borderRadius: "var(--radius)" }}
    >
      <CommandInput placeholder="Search for something..." />
      <CommandList>
        <CommandEmpty>
          <p style={{ margin: 0 }}>No results found for your search.</p>
          <p style={{ fontSize: "var(--text-xs)", color: "var(--muted-foreground)", margin: "4px 0 0" }}>
            Try a different keyword.
          </p>
        </CommandEmpty>
      </CommandList>
    </Command>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <Command
      style={{ maxWidth: 400, border: "1px solid var(--border)", borderRadius: "var(--radius)" }}
    >
      <CommandInput placeholder="Search..." />
      <CommandList>
        <CommandEmpty>No results.</CommandEmpty>
        <CommandGroup heading="Quick actions">
          <CommandItem>
            <CalendarIcon className="size-4" />
            Today
            <CommandShortcut>Ctrl+T</CommandShortcut>
          </CommandItem>
          <CommandItem>
            <CalculatorIcon className="size-4" />
            Calculate
            <CommandShortcut>Ctrl+Shift+C</CommandShortcut>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Navigation">
          <CommandItem>
            <UserIcon className="size-4" />
            Dashboard
          </CommandItem>
          <CommandItem>
            <SettingsIcon className="size-4" />
            Settings
            <CommandShortcut>Ctrl+,</CommandShortcut>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  ),
};
