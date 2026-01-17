"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApi } from "@/lib/providers/api-provider";
import { ResourceRepresentation } from "@/lib/api-client";
import { z } from "zod";
import { useState } from "react";

import {
  FormBuilder,
  TFormDetail,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@polarix/ui";

// --- Local, dependency-free Card components for now ---
const Card = ({ children }: { children: React.ReactNode }) => <div className="border rounded-lg shadow-sm bg-card text-card-foreground">{children}</div>;
const CardHeader = ({ children }: { children: React.ReactNode }) => <div className="p-6 flex flex-col space-y-1.5">{children}</div>;
const CardTitle = ({ children }: { children: React.ReactNode }) => <h3 className="text-2xl font-semibold leading-none tracking-tight">{children}</h3>;
const CardContent = ({ children }: { children: React.ReactNode }) => <div className="p-6 pt-0">{children}</div>;
// --- End of local components ---

const baseModuleFormDetail: TFormDetail = {
  title: "Create New Module",
  fields: [
    {
      name: "name",
      label: "Name (unique key)",
      type: "text",
      required: true,
      placeholder: "e.g., user-management",
      description: "A unique, machine-readable identifier.",
      validation: z.string().min(1, "Name is required"),
    },
    {
      name: "displayName",
      label: "Display Name",
      type: "text",
      required: true,
      placeholder: "e.g., User Management",
      description: "A human-friendly name for the module.",
      validation: z.string().min(1, "Display Name is required"),
    },
  ],
};

export function ModuleTab() {
  const { permissionsModules } = useApi();
  const queryClient = useQueryClient();
  const [formDetail, setFormDetail] = useState<TFormDetail>(baseModuleFormDetail);

  const { data: modules, isLoading } = useQuery({
    queryKey: ["modules"],
    queryFn: () => permissionsModules.getAllModules(),
  });

  const mutation = useMutation({
    mutationFn: (newModule: { name: string; displayName: string }) => {
      return permissionsModules.createModule({
        moduleRequest: {
          name: newModule.name,
          displayName: newModule.displayName,
          actions: [],
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["modules"] });
    },
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
      <div className="md:col-span-1">
        <Card>
          {/* FIX: CardHeader is no longer empty. The title is now descriptive of the card's purpose. */}
          <CardHeader>
             <CardTitle>Create a Module</CardTitle>
          </CardHeader>
          <CardContent>
            {/* FIX: FormBuilder does not take children. The submit button is handled internally by the component. */}
            <FormBuilder
              formDetail={formDetail}
              onSubmit={(data) => mutation.mutate(data)}
              setDynamicFormDetail={setFormDetail}
            />
          </CardContent>
        </Card>
      </div>
      <div className="md:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Existing Modules</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Display Name</TableHead>
                  <TableHead>Actions (Scopes)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={3}>Loading...</TableCell></TableRow>
                ) : (
                  modules?.map((module: ResourceRepresentation) => (
                    <TableRow key={module.id}>
                      <TableCell>{module.name}</TableCell>
                      <TableCell>{module.displayName}</TableCell>
                      <TableCell>
                        {/* FIX: Convert Set to Array before mapping */}
                        {Array.from(module.scopes || []).map(s => s.displayName).join(", ") || "None"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}