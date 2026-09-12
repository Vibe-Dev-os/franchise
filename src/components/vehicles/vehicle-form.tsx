"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { vehicleSchema, type VehicleInput } from "@/lib/validations/vehicle";
import { VEHICLE_TYPES } from "@/lib/constants";
import { createVehicle, updateVehicle } from "@/lib/actions/vehicles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Combobox, type ComboboxOption } from "@/components/combobox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const VEHICLE_TYPE_LABELS: Record<(typeof VEHICLE_TYPES)[number], string> = {
  tricycle: "Tricycle",
  "habal-habal/motorcycle": "Habal-habal / Motorcycle",
  other: "Other",
};

export function VehicleForm({
  vehicleId,
  defaultValues,
  operatorOptions,
  onSuccess,
}: {
  vehicleId?: string;
  defaultValues?: Partial<VehicleInput>;
  operatorOptions: ComboboxOption[];
  onSuccess: () => void;
}) {
  const form = useForm<VehicleInput>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      plateOrBodyNumber: defaultValues?.plateOrBodyNumber ?? "",
      vehicleType: defaultValues?.vehicleType ?? "tricycle",
      engineNumber: defaultValues?.engineNumber ?? "",
      chassisNumber: defaultValues?.chassisNumber ?? "",
      color: defaultValues?.color ?? "",
      model: defaultValues?.model ?? "",
      operatorId: defaultValues?.operatorId ?? "",
    },
  });

  async function onSubmit(values: VehicleInput) {
    const result = vehicleId ? await updateVehicle(vehicleId, values) : await createVehicle(values);

    if (result.success) {
      toast.success(vehicleId ? "Vehicle updated." : "Vehicle created.");
      onSuccess();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="plateOrBodyNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Plate/body number</FormLabel>
                <FormControl>
                  <Input placeholder="ABC-1234" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="vehicleType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Vehicle type</FormLabel>
                <FormControl>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {VEHICLE_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {VEHICLE_TYPE_LABELS[type]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="engineNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Engine number</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="chassisNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Chassis number</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="color"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Color</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="model"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Model</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
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
                  onChange={field.onChange}
                  placeholder="Select an operator..."
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Saving..." : vehicleId ? "Save changes" : "Create vehicle"}
        </Button>
      </form>
    </Form>
  );
}
