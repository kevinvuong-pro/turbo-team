'use client';

import { toast } from 'sonner';
import { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { LogOut, Tablet, Monitor, Smartphone, EllipsisVertical } from 'lucide-react';

import { Session } from '@/types';
import {
  AlertDialog,
  AlertDialogTitle,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogDescription,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { logoutDevice } from '@/services/users';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';

const getDeviceIcon = (deviceType: string) => {
  switch (deviceType.toLowerCase()) {
    case 'mobile':
      return <Smartphone className="size-4" />;
    case 'tablet':
      return <Tablet className="size-4" />;
    default:
      return <Monitor className="size-4" />;
  }
};

function SessionActions({ session }: { session: Session }) {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { mutate, isPending } = useMutation({
    mutationFn: () => logoutDevice(session.id),
    onError: (error: Error) => toast.error(error.message),
    onSuccess: () => {
      toast.success('Device logged out successfully');
      setIsDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
  });

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="text-muted-foreground flex size-8"
            size="icon"
            disabled={session.isCurrent || isPending}
          >
            <EllipsisVertical />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem variant="destructive" onSelect={() => setIsDialogOpen(true)}>
            <LogOut />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Logout from this device?</AlertDialogTitle>
            <AlertDialogDescription>
              This will terminate the session on {session.deviceName}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction disabled={isPending} onClick={() => mutate()}>
              {isPending ? 'Logging out...' : 'Logout'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export const sessionsColumns: ColumnDef<Session>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'deviceName',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Device" />,
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        {getDeviceIcon(row.original.deviceType)}
        <span className="font-medium">{row.original.deviceName}</span>
      </div>
    ),
    enableHiding: false,
  },
  {
    accessorKey: 'deviceType',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Type" />,
    cell: ({ row }) => (
      <Badge variant="secondary" className="capitalize">
        {row.original.deviceType}
      </Badge>
    ),
  },
  {
    accessorKey: 'ipAddress',
    header: ({ column }) => <DataTableColumnHeader column={column} title="IP Address" />,
    cell: ({ row }) => <span className="font-mono text-sm">{row.original.ipAddress}</span>,
  },
  {
    accessorKey: 'location',
    cell: ({ row }) => <span>{row.original.location}</span>,
    header: ({ column }) => <DataTableColumnHeader column={column} title="Location" />,
  },
  {
    accessorKey: 'lastUsedAt',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Last Used" />,
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {new Date(row.original.lastUsedAt).toLocaleString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })}
      </span>
    ),
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Created" />,
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {new Date(row.original.createdAt).toLocaleString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })}
      </span>
    ),
  },
  {
    accessorKey: 'isCurrent',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
    cell: ({ row }) =>
      row.original.isCurrent ? (
        <Badge variant="default">Current Session</Badge>
      ) : (
        <Badge variant="outline">Active</Badge>
      ),
    enableSorting: false,
  },
  {
    id: 'actions',
    enableHiding: false,
    enableSorting: false,
    cell: ({ row }) => <SessionActions session={row.original} />,
  },
];
