/**
 * StudentHub Design System — Barrel exports
 *
 * Usage:
 *   import { Button, Card, fontSize, space } from "@/modules/design-system";
 *
 * Tokens CSS: already imported by `src/app/styles.css` via
 *   @import "../../modules/design-system/tokens.css";
 */

// ── Design tokens (TypeScript) ──────────────────────────────────────────────────

export { fontSize, fontWeight, lineHeight, space, shadow, radius, duration, ink, accent } from "./tokens";

// ── shadcn/ui primitives ────────────────────────────────────────────────────────

export { Badge, badgeVariants } from "@/components/ui/badge";
export type { BadgeProps } from "@/components/ui/badge";
export { Button, buttonVariants, type ButtonProps } from "@/components/ui/button";
export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
} from "@/components/ui/command";
export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
} from "@/components/ui/dropdown-menu";
export { Input, type InputProps } from "@/components/ui/input";
export { Label } from "@/components/ui/label";
export {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectGroup,
  SelectLabel,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
} from "@/components/ui/select";
export { Separator } from "@/components/ui/separator";
export {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetBody,
} from "@/components/ui/sheet";
export { Skeleton } from "@/components/ui/skeleton";
export { Toaster } from "@/components/ui/sonner";
export {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
export {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";

// ── New components (STU-616 §4.4 additions) ──────────────────────────────────────

export { Checkbox } from "@/components/ui/checkbox";
export { Textarea } from "@/components/ui/textarea";
export { Switch } from "@/components/ui/switch";
export {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
export { Alert, AlertTitle, AlertDescription, alertVariants } from "@/components/ui/alert";
export { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
export {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverAnchor,
} from "@/components/ui/popover";
export { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
export {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
export { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
export { Progress } from "@/components/ui/progress";
export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from "@/components/ui/table";
export {
  useFormField,
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
} from "@/components/ui/form";
