import { useForm } from "react-hook-form";
import type { TFieldLeaf, TFormBuilderProps, TFormField } from "./type";
import {
  generateDefaultFormValues,
  generateZodSchema,
} from "./zodSchemaGenerator";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import FormInput from "./FormInput";
import { Button } from "../components/ui/button";
import { Form } from "../components/ui/form";
import { useCallback, useEffect, useMemo } from "react";
import { cn } from "../lib/utils";
import { get, isEqual } from "lodash";

/**
 * The main component for building dynamic forms.
 * It takes a configuration object (`formDetail`) and renders a form with validation,
 * conditional fields, and dynamic updates.
 *
 * @param {TFormBuilderProps} props - The props for the `FormBuilder` component.
 * @returns {JSX.Element} A fully functional form component.
 */
function FormBuilder({
  formDetail,
  onSubmit,
  setDynamicFormDetail,
}: TFormBuilderProps) {
  const formLayout = formDetail.layouts || { cols: 2 };

  const formSchema = useMemo(() => {
    const baseSchema = generateZodSchema(formDetail.fields);

    const conditionalFields: (TFieldLeaf & { path: string[] })[] = [];
    const findConditionalFields = (
      fields: TFormField[],
      parentPath: string[] = []
    ) => {
      fields.forEach((field) => {
        const newPath = [...parentPath, field.name];
        if (field.type === "group" && "fields" in field) {
          findConditionalFields(field.fields, newPath);
        } else if (
          field.type !== "array" &&
          field.condition &&
          "validation" in field
        ) {
          conditionalFields.push({
            ...field,
            path: newPath,
          } as TFieldLeaf & { path: string[] });
        }
      });
    };

    findConditionalFields(formDetail.fields);

    if (conditionalFields.length === 0) {
      return baseSchema;
    }

    return baseSchema.superRefine((data, ctx) => {
      conditionalFields.forEach((field) => {
        if (field.condition && field.condition(data)) {
          const fieldValue = get(data, field.path);
          const result = field.validation.safeParse(fieldValue);
          if (!result.success) {
            result.error.issues.forEach((issue) => {
              ctx.addIssue({
                ...issue,
                path: [...field.path, ...issue.path],
              });
            });
          }
        }
      });
    });
  }, [formDetail.fields]);

  const defaultValues = useMemo(
    () => generateDefaultFormValues(formDetail.fields),
    [formDetail.fields]
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  useEffect(() => {
    if (!isEqual(form.getValues(), defaultValues)) {
      form.reset(defaultValues);
    }
  }, [defaultValues, form]);

  const colsClass = useCallback((cols: number) => {
    const n = Math.max(1, Math.min(12, cols || 1));
    switch (n) {
      case 1:
        return "md:grid-cols-1";
      case 2:
        return "md:grid-cols-2";
      case 3:
        return "md:grid-cols-3";
      case 4:
        return "md:grid-cols-4";
      case 5:
        return "md:grid-cols-5";
      case 6:
        return "md:grid-cols-6";
      case 7:
        return "md:grid-cols-7";
      case 8:
        return "md:grid-cols-8";
      case 9:
        return "md:grid-cols-9";
      case 10:
        return "md:grid-cols-10";
      case 11:
        return "md:grid-cols-11";
      case 12:
        return "md:grid-cols-12";
      default:
        return "md:grid-cols-1";
    }
  }, []);

  return (
    <div className="m-2 border rounded-lg shadow-sm p-4">
      <Form {...form}>
        {formDetail.title && (
          <p className="text-lg font-semibold mb-2">{formDetail.title}</p>
        )}
        {formDetail.description && (
          <p className="text-sm text-gray-500 mb-4">{formDetail.description}</p>
        )}
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className={cn("grid grid-cols-1 gap-4", colsClass(formLayout.cols))}
        >
          {formDetail.fields.map((field: TFormField) => (
            <FormInput
              key={field.name}
              field={field}
              form={form}
              setDynamicFormDetail={setDynamicFormDetail}
              formDetail={formDetail}
            />
          ))}
          <div className="col-span-full flex justify-end mt-4">
            <Button size="sm">Submit</Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

export { FormBuilder };
