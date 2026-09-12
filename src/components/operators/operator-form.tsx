"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { operatorSchema, type OperatorInput } from "@/lib/validations/operator";
import { createOperator, updateOperator } from "@/lib/actions/operators";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/date-picker";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

export function OperatorForm({
  operatorId,
  defaultValues,
  onSuccess,
}: {
  operatorId?: string;
  defaultValues?: Partial<OperatorInput>;
  onSuccess: () => void;
}) {
  const form = useForm({
    resolver: zodResolver(operatorSchema),
    defaultValues: {
      fullName: defaultValues?.fullName ?? "",
      address: defaultValues?.address ?? "",
      contactNumber: defaultValues?.contactNumber ?? "",
      email: defaultValues?.email ?? "",
      dateRegistered: defaultValues?.dateRegistered ?? new Date(),
    },
  });

  async function onSubmit(values: OperatorInput) {
    const result = operatorId
      ? await updateOperator(operatorId, values)
      : await createOperator(values);

    if (result.success) {
      toast.success(operatorId ? "Operator updated." : "Operator created.");
      onSuccess();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full name</FormLabel>
              <FormControl>
                <Input placeholder="Juan Dela Cruz" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Input placeholder="Purok 1, Poblacion, Midsalip" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="contactNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contact number</FormLabel>
                <FormControl>
                  <Input placeholder="09XXXXXXXXX" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email (optional)</FormLabel>
                <FormControl>
                  <Input placeholder="name@email.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="dateRegistered"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date registered</FormLabel>
              <FormControl>
                <DatePicker value={field.value as Date} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Saving..." : operatorId ? "Save changes" : "Create operator"}
        </Button>
      </form>
    </Form>
  );
}
