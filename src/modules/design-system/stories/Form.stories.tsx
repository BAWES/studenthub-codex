import React from "react";
import type { Meta, StoryObj } from "@storybook/nextjs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const meta: Meta<typeof Form> = {
  title: "Primitives/Form",
  component: Form,
};

export default meta;
type Story = StoryObj<typeof Form>;

const basicSchema = z.object({
  username: z.string().min(2, "Username must be at least 2 characters."),
  email: z.string().email("Please enter a valid email address."),
});

const DemoForm = () => {
  const form = useForm<z.infer<typeof basicSchema>>({
    resolver: zodResolver(basicSchema),
    defaultValues: { username: "", email: "" },
  });

  return (
    <Form {...(form as any)}>
      <form
        onSubmit={form.handleSubmit((data: any) => alert(JSON.stringify(data, null, 2)))}
        style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 400 }}
      >
        <FormField
          control={form.control}
          name="username"
          render={({ field }: { field: any }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="Enter your username" {...field} />
              </FormControl>
              <FormDescription>
                This is your public display name.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }: { field: any }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="you@example.com" {...field} />
              </FormControl>
              <FormDescription>
                We will never share your email.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div style={{ display: "flex", gap: 8 }}>
          <Button type="submit">Submit</Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => form.trigger()}
          >
            Validate
          </Button>
        </div>
      </form>
    </Form>
  );
};

export const Default: Story = {
  render: () => <DemoForm />,
};

export const WithErrors: Story = {
  render: () => {
    const schema = z.object({
      username: z.string().min(3, "Must be at least 3 characters."),
    });

    const ErrorForm = () => {
      const form = useForm<z.infer<typeof schema>>({
        resolver: zodResolver(schema),
        defaultValues: { username: "ab" },
      });

      React.useEffect(() => {
        form.trigger();
        // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: trigger validation only on mount
      }, []);

      return (
        <Form {...(form as any)}>
          <form style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 400 }}>
            <FormField
              control={form.control}
              name="username"
              render={({ field }: { field: any }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter username" {...field} />
                  </FormControl>
                  <FormDescription>
                    Choose a unique username.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="button" variant="outline" onClick={() => form.trigger()}>
              Show errors
            </Button>
          </form>
        </Form>
      );
    };

    return <ErrorForm />;
  },
};
export const AllVariants: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <p style={{ fontSize: "var(--text-sm)", fontWeight: 600, margin: "0 0 12px" }}>
          Form with description and validation
        </p>
        <DemoForm />
      </div>
    </div>
  ),
};
