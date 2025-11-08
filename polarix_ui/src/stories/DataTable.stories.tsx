import type { Meta, StoryObj } from "@storybook/react";
import { type ColumnDef } from "@tanstack/react-table";
import { z } from "zod";
import { MoreHorizontal } from "lucide-react";

import { Button } from "../components/ui/button";
import { Checkbox } from "../components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import {
  DataTable,
  DataTableColumnHeader,
  type DataTableProps,
} from "../table-builder";
import { type TFormDetail } from "../form-builder/type";

// Sample Data and Types
type Payment = {
  id: string;
  amount: number;
  status: "pending" | "processing" | "success" | "failed";
  email: string;
};

const data: Payment[] = [
  {
    id: "m5gr84i9",
    amount: 316,
    status: "success",
    email: "ken99@example.com",
  },
  {
    id: "3u1reuv4",
    amount: 242,
    status: "success",
    email: "Abe45@example.com",
  },
  {
    id: "derv1ws0",
    amount: 837,
    status: "processing",
    email: "Monserrat44@example.com",
  },
  {
    id: "5kma53ae",
    amount: 874,
    status: "success",
    email: "Silas22@example.com",
  },
  {
    id: "bhqecj4p",
    amount: 721,
    status: "failed",
    email: "carmella@example.com",
  },
];

const columns: ColumnDef<Payment>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("status")}</div>
    ),
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => <div className="lowercase">{row.getValue("email")}</div>,
  },
  {
    accessorKey: "amount",
    header: () => <div className="text-right">Amount</div>,
    cell: ({ row }) => {
      const amount = row.original.amount;

      // Format the amount as a dollar amount
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount);

      return <div className="text-right font-medium">{formatted}</div>;
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const payment = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(payment.id)}
            >
              Copy payment ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View customer</DropdownMenuItem>
            <DropdownMenuItem>View payment details</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

const filterFormDetail: TFormDetail = {
  title: "Filter Payments",
  description: "Adjust the filters for the payment data.",
  fields: [
    {
      name: "email",
      label: "Email",
      type: "text",
      placeholder: "user@example.com",
      validation: z.string().email().optional().or(z.literal("")),
    },
    {
      name: "status",
      label: "Status",
      type: "select",
      options: [
        { value: "all", label: "All Statuses" },
        { value: "pending", label: "Pending" },
        { value: "processing", label: "Processing" },
        { value: "success", label: "Success" },
        { value: "failed", label: "Failed" },
      ],
      validation: z.string().optional().or(z.literal("")),
    },
  ],
};

const meta: Meta<DataTableProps<Payment, unknown>> = {
  title: "Components/DataTable",
  component: DataTable,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    columns,
    data,
    showGlobalSearch: true,
  },
  render: (args) => (
    <div className="container mx-auto py-10" style={{ minWidth: 800 }}>
      <DataTable
        columns={args.columns}
        data={args.data}
        showGlobalSearch={Boolean(args.showGlobalSearch)}
      />
    </div>
  ),
};

export const WithFiltering: Story = {
  args: {
    ...Default.args,
    filterFormDetail,
    onFilterChange: (filters) => {
      // In a real app, you'd probably use this to refetch data
      // eslint-disable-next-line no-alert
      alert(`Filters changed: ${JSON.stringify(filters, null, 2)}`);
    },
  },
  render: (args) => (
    <div className="container mx-auto py-10" style={{ minWidth: 800 }}>
      <DataTable {...args} />
    </div>
  ),
};
