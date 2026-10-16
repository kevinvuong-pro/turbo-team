'use client';

import { z } from 'zod';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  Form,
  FormItem,
  FormField,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getDailyRevenue, upsertDailyRevenue } from '@/services/daily-revenue';

const requiredAmount = z
  .union([z.string(), z.number()])
  .refine((value) => value !== '' && value !== null && value !== undefined, {
    message: 'This field is required',
  })
  .transform((value) => Number(value))
  .refine((value) => !Number.isNaN(value), {
    message: 'Must be a valid number',
  })
  .refine((value) => value >= 0, {
    message: 'Must be greater than or equal to 0',
  });

const requiredCovers = z
  .union([z.string(), z.number()])
  .refine((value) => value !== '' && value !== null && value !== undefined, {
    message: 'This field is required',
  })
  .transform((value) => Number(value))
  .refine((value) => Number.isInteger(value), {
    message: 'Covers must be a whole number',
  })
  .refine((value) => value >= 0, {
    message: 'Must be greater than or equal to 0',
  });

const formSchema = z.object({
  posRevenue: requiredAmount,
  eatclubRevenue: requiredAmount,
  labourCosts: requiredAmount,
  covers: requiredCovers,
});

type FormInput = z.input<typeof formSchema>;
type FormOutput = z.output<typeof formSchema>;

const emptyValues: FormInput = {
  posRevenue: '',
  eatclubRevenue: '',
  labourCosts: '',
  covers: '',
};

export function DailyRevenueForm() {
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const dateKey = format(selectedDate, 'yyyy-MM-dd');

  const form = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(formSchema),
    defaultValues: emptyValues,
  });

  const { data, isFetching } = useQuery({
    queryKey: ['daily-revenue', dateKey],
    queryFn: () => getDailyRevenue(dateKey),
  });

  const { mutate, isPending } = useMutation({
    mutationFn: upsertDailyRevenue,
    onSuccess: async () => {
      toast.success(data?.exists ? 'Daily revenue updated' : 'Daily revenue created');
      await queryClient.invalidateQueries({
        queryKey: ['daily-revenue', dateKey],
      });
    },
    onError: (error) => toast.error(error.message),
  });

  useEffect(() => {
    if (!data) return;

    if (data.exists && data.data) {
      form.reset({
        posRevenue: String(data.data.posRevenue),
        eatclubRevenue: String(data.data.eatclubRevenue),
        labourCosts: String(data.data.labourCosts),
        covers: String(data.data.covers ?? ''),
      });
      return;
    }

    form.reset(emptyValues);
  }, [data, form]);

  const onSubmit = (values: FormOutput) => {
    mutate({
      date: dateKey,
      posRevenue: values.posRevenue,
      eatclubRevenue: values.eatclubRevenue,
      labourCosts: values.labourCosts,
      covers: values.covers,
    });
  };

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Daily Revenue</CardTitle>
        <CardDescription>
          Select a date to load existing figures or enter new POS, Eatclub, labour and covers
          values.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <Form {...form}>
          <div className="grid grid-cols-1 gap-12 md:grid-cols-[3fr_3fr]">
            {/* Left column: Date */}
            <div className="space-y-2">
              <FormLabel>Date</FormLabel>

              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => {
                  if (!date) return;
                  setSelectedDate(date);
                }}
                weekStartsOn={1}
                className="w-full rounded-md border p-4"
                classNames={{
                  month: 'w-full space-y-4',
                  table: 'w-full border-collapse',
                  weekdays: 'flex w-full',
                  weekday: 'flex-1 text-center font-normal text-muted-foreground',
                  week: 'mt-2 flex w-full',
                  day: 'flex-1 text-center',
                  day_button: 'h-10 w-full p-0 font-normal',
                }}
              />
            </div>

            {/* Right column: Match calendar height */}
            <form
              className="grid h-full grid-rows-[repeat(4,minmax(0,1fr))_auto] gap-3"
              onSubmit={form.handleSubmit(onSubmit)}
            >
              <FormField
                control={form.control}
                name="posRevenue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>POS Revenue</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        step="0.01"
                        placeholder="0.00"
                        disabled={isFetching}
                        {...field}
                        value={field.value ?? ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="eatclubRevenue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Eatclub Revenue</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        step="0.01"
                        placeholder="0.00"
                        disabled={isFetching}
                        {...field}
                        value={field.value ?? ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="labourCosts"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Labour Costs</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        step="0.01"
                        placeholder="0.00"
                        disabled={isFetching}
                        {...field}
                        value={field.value ?? ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="covers"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Covers</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        step={1}
                        placeholder="Number of covers"
                        disabled={isFetching}
                        {...field}
                        value={field.value ?? ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end">
                <Button type="submit" disabled={isPending || isFetching}>
                  {data?.exists ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </div>
        </Form>
      </CardContent>
    </Card>
  );
}
