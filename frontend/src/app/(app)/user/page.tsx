"use client";

import { User, UserInput } from "@/lib/api-client";
import { useApi } from "@/lib/providers/api-provider";
import {
  Button,
  ColumnDef,
  DataTable,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  FormBuilder,
  SortingState,
  TFormDetail,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@polarix/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { useEffect, useState } from "react";
import z from "zod";
import {
  parseAsInteger,
  useQueryStates,
  parseAsString,
  parseAsStringEnum,
} from "nuqs";
import { useMemo } from "react";

const columns: ColumnDef<User>[] = [
  {
    header: "First Name",
    accessorKey: "firstName",
    enableSorting: true,
  },
  {
    header: "Last Name",
    accessorKey: "lastName",
  },
  {
    header: "Username/Email",
    accessorKey: "username",
  },
  {
    header: "Date of Birth",
    accessorKey: "dateOfBirth",
    accessorFn: (row) => row.dateOfBirth?.toLocaleDateString() || "-",
  },
];

const userFilterSchema = z.object({
  status: z.string().optional(),
  createdAt: z.string().optional(),
});

type UserFilter = z.infer<typeof userFilterSchema>;

const baseFilterFormDetail: TFormDetail = {
  title: "Filter Users",
  fields: [
    {
      name: "status",
      type: "select",
      label: "Status",
      options: [
        { label: "Active", value: "active" },
        { label: "Inactive", value: "inactive" },
      ],
      validation: z.string().optional(),
    },
    {
      name: "createdAt",
      type: "select",
      label: "Created At",
      options: [
        { label: "Today", value: "today" },
        { label: "Yesterday", value: "yesterday" },
        { label: "Last 7 Days", value: "last7days" },
        { label: "Last 30 Days", value: "last30days" },
      ],
      validation: z.string().optional(),
    },
  ],
};

const UserTableSkeleton = () => {
  const skeletonRowCount = 10;
  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Skeleton className="h-8 w-1/4" />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column, idx) => (
                <TableHead key={typeof column.header === "string" ? column.header : idx}>
                  <Skeleton className="h-5 w-20" />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(skeletonRowCount)].map((_, i) => (
              <TableRow key={i}>
                {columns.map((column, idx) => (
                  <TableCell
                    key={typeof column.header === "string" ? column.header : idx}
                  >
                    <Skeleton className="h-5 w-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-20" />
      </div>
    </div>
  );
};

const baseUserFormDetail: TFormDetail = {
  title: "Create User",
  description: "create user",
  fields: [
    {
      name: "firstName",
      type: "text",
      label: "First Name",
      required: true,
      validation: z
        .string("First Name is required")
        .min(2, "First name should have minimum 2 character")
        .max(50, "First name cannot have more than 50 characters"),
    },
    {
      name: "lastName",
      type: "text",
      label: "Last Name",
      required: true,
      validation: z
        .string("First Name is required")
        .min(2, "First name should have minimum 2 character")
        .max(50, "First name cannot have more than 50 characters"),
    },
    {
      name: "password",
      type: "password",
      label: "Password",
      required: true,
      validation: z
        .string("Password is required")
        .min(6, "Password should have minimum 2 character")
        .max(50, "Password cannot have more than 50 characters"),
    },
    {
      name: "email",
      type: "email",
      label: "Username/Email",
      required: true,
      validation: z.email("Invalid email"),
    },
    {
      name: "dateOfBirth",
      type: "date",
      label: "Date of Birth",
      validation: z.date().optional().nullable(),
    },
  ],
};

export default function UserPage() {
  const { userApi } = useApi();
  const queryClient = useQueryClient();
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userFormDetail, setUserFormDetail] = useState<TFormDetail | null>(
    null
  );

  const [queryState, setQueryState] = useQueryStates({
    pageIndex: parseAsInteger.withDefault(0),
    pageSize: parseAsInteger.withDefault(10),
    search: parseAsString.withDefault(""),
    sortBy: parseAsString.withDefault("firstName"),
    sortDir: parseAsStringEnum<"asc" | "desc">(["asc", "desc"]).withDefault(
      "asc"
    ),
    status: parseAsString.withDefault(""),
    createdAt: parseAsString.withDefault(""),
  });
  const [searchTerm, setSearchTerm] = useState(queryState.search);

  const filterFormDetail = useMemo((): TFormDetail => {
    return {
      ...baseFilterFormDetail,
      fields: baseFilterFormDetail.fields.map((field) => ({
        ...field,
        value: queryState[field.name as keyof typeof queryState] as string,
      })),
    };
  }, [queryState]);

  useEffect(() => {
    setSearchTerm(queryState.search);
  }, [queryState.search]);

  useEffect(() => {
    if (showUserForm) {
      if (editingUser) {
        setUserFormDetail({
          ...baseUserFormDetail,
          title: "Edit User",
          description: "Edit user details",
          fields: baseUserFormDetail.fields.map((field) => ({
            ...field,
            value: (editingUser as any)[field.name],
            validation:
              field.name === "password"
                ? field.validation.optional()
                : field.validation,
          })),
        });
      } else {
        setUserFormDetail(baseUserFormDetail);
      }
    } else {
      setEditingUser(null);
      setUserFormDetail(null);
    }
  }, [showUserForm, editingUser]);

  useEffect(() => {
    if (searchTerm === queryState.search) {
      return;
    }
    const handler = setTimeout(() => {
      setQueryState({ search: searchTerm, pageIndex: 0 });
    }, 500); // 500ms debounce delay

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm, queryState.search, setQueryState]);

  const sorting: SortingState = [
    {
      id: queryState.sortBy,
      desc: queryState.sortDir === "desc",
    },
  ];

  const {
    data: users,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["users", queryState],
    queryFn: () =>
      userApi.searchUsers({
        filters: {
          search: queryState.search,
          status: queryState.status || undefined,
          createdAt: queryState.createdAt || undefined,
        },
        page: queryState.pageIndex,
        size: queryState.pageSize,
        sortBy: queryState.sortBy,
        sortDir: queryState.sortDir,
      }),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false
  });

  const createUserMutation = useMutation({
    mutationFn: (userInput: UserInput) =>
      userApi.createUser({ userInput: userInput }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setShowUserForm(false);
    },
    onError: (error) => {
      console.error("Error creating user:", error);
      // You might want to show an error message to the user
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ id, userInput }: { id: string; userInput: UserInput }) =>
      userApi.updateUser({ id, userInput: userInput }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setShowUserForm(false);
    },
    onError: (error) => {
      console.error("Error updating user:", error);
      // You might want to show an error message to the user
    },
  });

  const dynamicColumns: ColumnDef<User>[] = [
    ...columns,
    {
      id: "actions",
      cell: ({ row }) => {
        const user = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <DotsHorizontalIcon className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => {
                  setEditingUser(user);
                  setShowUserForm(true);
                }}
              >
                Edit
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

  if (isError) return <div>Error fetching users.</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="w-full flex justify-end align-middle">
        <h1 className="text-2xl font-bold mb-4">Users</h1>
        <Button onClick={() => setShowUserForm(true)} className="ml-auto">
          Create
        </Button>
      </div>

      {isLoading ? (
        <UserTableSkeleton />
      ) : (
        <DataTable
          columns={dynamicColumns}
          data={users?.content || []}
          pagination={{
            pageIndex: queryState.pageIndex,
            pageSize: queryState.pageSize,
          }}
          pageCount={users?.totalPages || 0}
          onPaginationChange={(updater) => {
            const oldPagination = {
              pageIndex: queryState.pageIndex,
              pageSize: queryState.pageSize,
            };
            if (typeof updater === "function") {
              const newPagination = updater(oldPagination);
              setQueryState(newPagination);
            } else {
              setQueryState(updater);
            }
          }}
          showGlobalSearch
          globalFilter={searchTerm}
          onGlobalFilterChange={(value) => {
            const newSearch =
              typeof value === "function" ? value(searchTerm) : value;
            setSearchTerm(newSearch);
          }}
          sorting={sorting}
          onSortingChange={(updater) => {
            const newSorting =
              typeof updater === "function" ? updater(sorting) : updater;
            if (newSorting && newSorting[0]) {
              setQueryState({
                sortBy: newSorting[0].id,
                sortDir: newSorting[0].desc ? "desc" : "asc",
              });
            } else {
              setQueryState({
                sortBy: "firstName",
                sortDir: "asc",
              });
            }
          }}
          filterFormDetail={filterFormDetail}
          onFilterChange={(newFilters) => {
            const parsedFilters = userFilterSchema.parse(newFilters);
            setQueryState({
              ...parsedFilters,
              pageIndex: 0,
            });
          }}
        />
      )}
      <Dialog open={showUserForm} onOpenChange={setShowUserForm}>
        <DialogContent className="min-w-4xl">
          <DialogHeader>
            <DialogTitle></DialogTitle>
            <DialogDescription></DialogDescription>
          </DialogHeader>
          {userFormDetail && (
            <FormBuilder
              formDetail={userFormDetail}
              onSubmit={(data) => {
                const { email, ...rest } = data;
                const userInput = {
                  ...rest,
                  username: email,
                  email,
                };

                if (editingUser) {
                  updateUserMutation.mutate({
                    id: editingUser.id!,
                    userInput,
                  });
                } else {
                  createUserMutation.mutate(userInput);
                }
              }}
              setDynamicFormDetail={setUserFormDetail}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
