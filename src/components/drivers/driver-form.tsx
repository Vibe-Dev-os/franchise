"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { driverSchema, type DriverInput } from "@/lib/validations/driver";
import { createDriver, updateDriver } from "@/lib/actions/drivers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/date-picker";
import { Combobox, type ComboboxOption } from "@/components/combobox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

export function DriverForm({
  driverId,
  defaultValues,
  operatorOptions,
  onSuccess,
}: {
  driverId?: string;
  defaultValues?: Partial<DriverInput>;
  operatorOptions: ComboboxOption[];
  onSuccess: () => void;
}) {
  const form = useForm({
    resolver: zodResolver(driverSchema),
    defaultValues: {
      fullName: defaultValues?.fullName ?? "",
      address: defaultValues?.address ?? "",
      contactNumber: defaultValues?.contactNumber ?? "",
      driversLicenseNumber: defaultValues?.driversLicenseNumber ?? "",
      licenseExpiry: defaultValues?.licenseExpiry ?? new Date(),
      photoUrl: defaultValues?.photoUrl ?? "",
      operatorId: defaultValues?.operatorId ?? "",
    },
  });

  async function onSubmit(values: DriverInput) {
    const result = driverId ? await updateDriver(driverId, values) : await createDriver(values);

    if (result.success) {
      toast.success(driverId ? "Driver updated." : "Driver created.");
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
            name="driversLicenseNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>License number</FormLabel>
                <FormControl>
                  <Input placeholder="N01-23-456789" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="licenseExpiry"
          render={({ field }) => (
            <FormItem>
              <FormLabel>License expiry</FormLabel>
              <FormControl>
                <DatePicker value={field.value as Date} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="operatorId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Operator (optional)</FormLabel>
              <FormControl>
                <Combobox
                  options={operatorOptions}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Select an operator..."
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Saving..." : driverId ? "Save changes" : "Create driver"}
        </Button>
      </form>
    </Form>
  );
}
