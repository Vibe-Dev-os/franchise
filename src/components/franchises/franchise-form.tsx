"use client";

import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { franchiseSchema, type FranchiseInput } from "@/lib/validations/franchise";
import { createFranchise, updateFranchise } from "@/lib/actions/franchises";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
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

export type FranchiseFormOperator = { _id: string; fullName: string };
export type FranchiseFormDriver = { _id: string; fullName: string; operatorId?: string | null };
export type FranchiseFormVehicle = {
  _id: string;
  plateOrBodyNumber: string;
  vehicleType: string;
  operatorId?: string | null;
};

export function FranchiseForm({
  franchiseId,
  defaultValues,
  operators,
  drivers,
  vehicles,
  zones,
  onSuccess,
}: {
  franchiseId?: string;
  defaultValues?: Partial<FranchiseInput>;
  operators: FranchiseFormOperator[];
  drivers: FranchiseFormDriver[];
  vehicles: FranchiseFormVehicle[];
  zones: string[];
  onSuccess: () => void;
}) {
  const form = useForm({
    resolver: zodResolver(franchiseSchema),
    defaultValues: {
      operatorId: defaultValues?.operatorId ?? "",
      driverId: defaultValues?.driverId ?? "",
      vehicleId: defaultValues?.vehicleId ?? "",
      routeOrZone: defaultValues?.routeOrZone ?? "",
      dateIssued: defaultValues?.dateIssued ?? new Date(),
      expiryDate: defaultValues?.expiryDate ?? new Date(),
      feeAmount: defaultValues?.feeAmount ?? 0,
      feePaid: defaultValues?.feePaid ?? false,
    },
  });

  const selectedOperatorId = form.watch("operatorId");

  const operatorOptions: ComboboxOption[] = operators.map((o) => ({
    value: o._id,
    label: o.fullName,
  }));

  const driverOptions: ComboboxOption[] = useMemo(
    () =>
      drivers
        .filter((d) => !selectedOperatorId || d.operatorId === selectedOperatorId)
        .map((d) => ({ value: d._id, label: d.fullName })),
    [drivers, selectedOperatorId]
  );

  const vehicleOptions: ComboboxOption[] = useMemo(
    () =>
      vehicles
        .filter((v) => !selectedOperatorId || v.operatorId === selectedOperatorId)
        .map((v) => ({
          value: v._id,
          label: v.plateOrBodyNumber,
          description: v.vehicleType,
        })),
    [vehicles, selectedOperatorId]
  );

  const zoneOptions: ComboboxOption[] = zones.map((z) => ({ value: z, label: z }));

  async function onSubmit(values: FranchiseInput) {
    const result = franchiseId
      ? await updateFranchise(franchiseId, values)
      : await createFranchise(values);

    if (result.success) {
      toast.success(franchiseId ? "Franchise updated." : "Franchise created.");
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
          name="operatorId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Operator</FormLabel>
              <FormControl>
                <Combobox
                  options={operatorOptions}
                  value={field.value}
                  onChange={(value) => {
                    field.onChange(value);
                    form.setValue("driverId", "");
                    form.setValue("vehicleId", "");
                  }}
                  placeholder="Select an operator..."
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="driverId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Driver</FormLabel>
                <FormControl>
                  <Combobox
                    options={driverOptions}
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Select a driver..."
                    emptyText="No drivers for this operator."
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="vehicleId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Vehicle</FormLabel>
                <FormControl>
                  <Combobox
                    options={vehicleOptions}
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Select a vehicle..."
                    emptyText="No vehicles for this operator."
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="routeOrZone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Route / zone</FormLabel>
              <FormControl>
                <Combobox
                  options={zoneOptions}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Select a route/zone..."
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="dateIssued"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date issued</FormLabel>
                <FormControl>
                  <DatePicker value={field.value as Date} onChange={field.onChange} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="expiryDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Expiry date</FormLabel>
                <FormControl>
                  <DatePicker value={field.value as Date} onChange={field.onChange} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-2 gap-4 items-end">
          <FormField
            control={form.control}
            name="feeAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fee amount (₱)</FormLabel>
                <FormControl>
                  <Input type="number" min={0} step="0.01" {...field} value={field.value as number} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="feePaid"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center gap-2 pb-2">
                <FormControl>
                  <Checkbox checked={field.value as boolean} onCheckedChange={field.onChange} />
                </FormControl>
                <FormLabel className="!mt-0">Fee paid</FormLabel>
              </FormItem>
            )}
          />
        </div>
        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting
            ? "Saving..."
            : franchiseId
              ? "Save changes"
              : "Create franchise"}
        </Button>
      </form>
    </Form>
  );
}
