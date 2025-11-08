import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../components/ui/form";
import { Input } from "../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Checkbox } from "../components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import { DatePicker } from "../components/ui/date-picker";
import { FileUpload } from "../components/ui/file-upload";
import { MultiSelect } from "../components/ui/multi-select";
import { Textarea } from "../components/ui/textarea";
import { Combobox } from "../components/ui/combobox";
import { useEffect, useMemo, useRef } from "react";
import { useFieldArray, type UseFormReturn } from "react-hook-form";
import type { TFieldArray, TFormDetail, TFormField } from "./type";
import { Button } from "../components/ui/button";
import { cn, getColsClass } from "../lib/utils";
import { generateDefaultFormValues } from "./zodSchemaGenerator";
import { PlusCircleIcon, XIcon } from "lucide-react";

type TFormInputProps = {
  /** The configuration object for the form field. */
  field: TFormField;
  /** The form instance from `react-hook-form`. */
  form: UseFormReturn<any>;
  /** A state setter function to update the form detail for dynamic forms. */
  setDynamicFormDetail: React.Dispatch<
    React.SetStateAction<TFormDetail | null>
  >;
  /** The full form detail object. */
  formDetail: TFormDetail;
  /** The name of the parent field, if this input is nested. */
  parentName?: string;
};

/**
 * A component that recursively renders form inputs based on the field configuration.
 * It handles various input types, conditional visibility, and dynamic form updates.
 *
 * @param {TFormInputProps} props - The props for the `FormInput` component.
 * @returns {JSX.Element | null} A rendered form input, or `null` if the field is hidden or not visible.
 */
const FormInput = ({
  field,
  form,
  setDynamicFormDetail,
  formDetail,
  parentName,
}: TFormInputProps) => {
  const { watch } = form;

  const allFormValues = watch();

  const fieldName = parentName ? `${parentName}.${field.name}` : field.name;

  const isVisible = useMemo(
    () => (field.condition ? field.condition(allFormValues) : true),
    [allFormValues, field.condition]
  );

  useEffect(() => {
    if (!isVisible) {
      form.unregister(fieldName);
    }
  }, [isVisible, fieldName, form]);

  const value = watch(fieldName);
  const prevValueRef = useRef(value);

  useEffect(() => {
    if (field.onChange) {
      const newFormDetail = field.onChange(
        value,
        prevValueRef.current,
        formDetail
      );
      setDynamicFormDetail(newFormDetail);
    }
    prevValueRef.current = value;
  }, [value, field.onChange, formDetail, setDynamicFormDetail]);

  if (!isVisible || field.hidden) {
    return null;
  }

  if (field.type === "array" && "fields" in field) {
    return (
      <FormArray
        field={field}
        form={form}
        setDynamicFormDetail={setDynamicFormDetail}
        formDetail={formDetail}
        parentName={parentName || ""}
      />
    );
  }

  if (field.type === "group" && "fields" in field) {
    return (
      <div
        className="border p-4 rounded-md"
        style={{ gridColumn: `span ${field.layout?.colSpan ?? 1}` }}
      >
        <h3 className="text-lg font-medium">{field.label}</h3>
        {field.description && (
          <p className="text-sm text-muted-foreground">{field.description}</p>
        )}
        <div
          className={cn(
            "grid grid-cols-1 gap-4 mt-4",
            getColsClass(field.layouts?.cols ?? 1)
          )}
        >
          {field.fields.map((subField, idx) => (
            <FormInput
              key={`${fieldName}-${subField.name}-${idx}`}
              field={subField}
              form={form}
              setDynamicFormDetail={setDynamicFormDetail}
              formDetail={formDetail}
              parentName={fieldName}
            />
          ))}
        </div>
      </div>
    );
  }

  const renderInput = (formField: any) => {
    if ("type" in field) {
      switch (field.type) {
        case "text":
        case "email":
        case "password":
        case "number":
        case "url":
        case "tel":
        case "search":
          return (
            <Input
              type={field.type}
              placeholder={field.placeholder}
              {...formField}
              value={formField.value ?? ""}
              onChange={(e) => {
                if (field.type === "number") {
                  formField.onChange(e.target.valueAsNumber);
                } else {
                  formField.onChange(e.target.value);
                }
              }}
            />
          );

        case "textarea":
          return (
            <Textarea
              placeholder={field.placeholder}
              {...formField}
              value={formField.value ?? ""}
            />
          );

        case "select":
          return (
            <Select onValueChange={formField.onChange} value={formField.value}>
              <SelectTrigger>
                <SelectValue placeholder={field.placeholder} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          );

        case "checkbox":
          return (
            <Checkbox
              id={field.name}
              checked={formField.value}
              onCheckedChange={formField.onChange}
            />
          );

        case "radio":
          return (
            <RadioGroup
              onValueChange={formField.onChange}
              value={formField.value}
              className="flex items-center space-x-2"
            >
              {field.options?.map((option) => (
                <FormItem
                  className="flex items-center space-x-2 space-y-0"
                  key={option.value}
                >
                  <FormControl>
                    <RadioGroupItem value={option.value} />
                  </FormControl>
                  <FormLabel className="font-normal">{option.label}</FormLabel>
                </FormItem>
              ))}
            </RadioGroup>
          );
        case "date":
          return (
            <DatePicker value={formField.value} onChange={formField.onChange} />
          );
        case "file":
          return (
            <FileUpload
              value={formField.value}
              onChange={formField.onChange}
              {...field}
            />
          );
        case "multiselect":
          return (
            <MultiSelect
              options={field.options ?? []}
              value={formField.value}
              onChange={formField.onChange}
              placeholder={field.placeholder || ""}
            />
          );
        case "combobox":
          return (
            <Combobox
              options={field.options ?? []}
              value={formField.value}
              onChange={formField.onChange}
              placeholder={field.placeholder || ""}
            />
          );
        default:
          return null;
      }
    }
  };

  return (
    <div style={{ gridColumn: `span ${field.layout?.colSpan ?? 1}` }}>
      <FormField
        control={form.control}
        name={fieldName}
        defaultValue={field.value}
        render={({ field: formField }) => {
          if (field.type === "checkbox") {
            return (
              <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>{renderInput(formField)}</FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>{field.label}</FormLabel>
                  {field.description && (
                    <FormDescription>{field.description}</FormDescription>
                  )}
                </div>
              </FormItem>
            );
          }
          return (
            <FormItem>
              <FormLabel>
                {field.label}
                {field.required && <span className="text-red-500">*</span>}
              </FormLabel>
              <FormControl>{renderInput(formField)}</FormControl>
              {field.description && (
                <FormDescription>{field.description}</FormDescription>
              )}
              <FormMessage />
            </FormItem>
          );
        }}
      />
    </div>
  );
};

export default FormInput;

type TFormArrayProps = {
  /** The configuration for the array field. */
  field: TFieldArray;
  /** The form instance from `react-hook-form`. */
  form: UseFormReturn<any>;
  /** State setter to update the form detail for dynamic forms. */
  setDynamicFormDetail: React.Dispatch<
    React.SetStateAction<TFormDetail | null>
  >;
  /** The full form detail object. */
  formDetail: TFormDetail;
  /** The name of the parent field, if nested. */
  parentName?: string;
};

/**
 * Renders a form array, allowing users to dynamically add or remove sets of fields.
 *
 * @param {TFormArrayProps} props - The props for the `FormArray` component.
 * @returns {JSX.Element} A rendered form array component.
 */
const FormArray = ({
  field,
  form,
  setDynamicFormDetail,
  formDetail,
  parentName,
}: TFormArrayProps) => {
  const fieldName = parentName ? `${parentName}.${field.name}` : field.name;
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: fieldName,
  });

  const defaultArrayItemValues = useMemo(
    () => generateDefaultFormValues(field.fields),
    [field.fields]
  );

  return (
    <div
      className="border p-4 rounded-md"
      style={{ gridColumn: `span ${field.layout?.colSpan ?? 1}` }}
    >
      <h3 className="text-lg font-medium">{field.label}</h3>
      {field.description && (
        <p className="text-sm text-muted-foreground">{field.description}</p>
      )}
      <div className="grid grid-cols-1 gap-4 mt-4">
        {fields.map((item, index) => (
          <div
            key={item.id}
            className={cn(
              "border p-4 rounded-md relative grid gap-4",
              getColsClass(field.layouts?.cols ?? 1)
            )}
          >
            {field.fields.map((subField, idx) => (
              <FormInput
                key={`${item.id}-${subField.name}-${idx}`}
                field={subField}
                form={form}
                setDynamicFormDetail={setDynamicFormDetail}
                formDetail={formDetail}
                parentName={`${fieldName}.${index}`}
              />
            ))}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => remove(index)}
              className="absolute top-2 right-2 rounded-full h-8 w-8"
            >
              <XIcon className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
      <Button
        type="button"
        size="sm"
        onClick={() => append(defaultArrayItemValues)}
        className="mt-4"
      >
        <PlusCircleIcon /> {field.label}
      </Button>
    </div>
  );
};
