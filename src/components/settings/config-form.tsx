"use client";

import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { configSchema } from "@/lib/validations/settings";
import { updateConfig } from "@/lib/actions/settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

type ConfigValues = {
  feeSchedule: { tricycle: number; "habal-habal/motorcycle": number; other: number };
  zones: { value: string }[];
};

export function ConfigForm({
  config,
}: {
  config: { feeSchedule: ConfigValues["feeSchedule"]; zones: string[] };
}) {
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<ConfigValues>({
    defaultValues: {
      feeSchedule: config.feeSchedule,
      zones: config.zones.map((z) => ({ value: z })),
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "zones",
  });

  async function onSubmit(values: ConfigValues) {
    setSubmitting(true);
    const parsed = configSchema.safeParse({
      feeSchedule: values.feeSchedule,
      zones: values.zones.map((z) => z.value).filter(Boolean),
    });

    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid values.");
      setSubmitting(false);
      return;
    }

    const result = await updateConfig(parsed.data);
    setSubmitting(false);

    if (result.success) {
      toast.success("Configuration updated.");
    } else {
      toast.error(result.error);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Fee schedule</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <FormField
              control={form.control}
              name="feeSchedule.tricycle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tricycle (₱)</FormLabel>
                  <FormControl>
                    <Input type="number" min={0} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="feeSchedule.habal-habal/motorcycle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Habal-habal / Motorcycle (₱)</FormLabel>
                  <FormControl>
                    <Input type="number" min={0} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="feeSchedule.other"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Other (₱)</FormLabel>
                  <FormControl>
                    <Input type="number" min={0} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-sm">Zones</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={() => append({ value: "" })}>
              <Plus className="size-4" />
              Add zone
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {fields.map((field, index) => (
              <div key={field.id} className="flex items-center gap-2">
                <Input {...form.register(`zones.${index}.value` as const)} placeholder="Zone name" />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => remove(index)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving..." : "Save configuration"}
        </Button>
      </form>
    </Form>
  );
}
