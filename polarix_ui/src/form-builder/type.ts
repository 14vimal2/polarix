import { z } from "zod";

export type TFieldType =
  | "text"
  | "email"
  | "password"
  | "number"
  | "textarea"
  | "select"
  | "checkbox"
  | "radio"
  | "date"
  | "datetime-local"
  | "time"
  | "file"
  | "multiselect"
  | "range"
  | "color"
  | "url"
  | "tel"
  | "search" 
  | "combobox";

export type TFieldBase = {
  name: string;
  label: string;
  description?: string;
  required?: boolean;
  placeholder?: string;
  layout?: { colSpan: number };
  hidden?: boolean;
  condition?: (formValues: Record<string, any>) => boolean;
  onChange?: (value: unknown, prevValue: unknown, prevFormDetail: TFormDetail) => TFormDetail;
};

export type TOptions = {
  label: string;
  value: string;
}

export type TFieldLeaf = TFieldBase & {
  type:
    | "text"
    | "email"
    | "password"
    | "number"
    | "textarea"
    | "select"
    | "checkbox"
    | "radio"
    | "date"
    | "datetime-local"
    | "time"
    | "file"
    | "multiselect"
    | "range"
    | "color"
    | "url"
    | "tel"
    | "search" 
    | "combobox";
  validation: z.ZodTypeAny;
  value?: string | number | boolean | Date | File[] | string[] | null;
  options?: TOptions[];
  asyncValidation?: () => Promise<string | boolean>;
  // File upload specific props
  accept?: string;
  multiple?: boolean;
  maxSize?: number;
  // Range specific props
  min?: number;
  max?: number;
  step?: number;
  // Date specific props
  showTime?: boolean; // if true, also capture time
  output?: "date" | "string" | "iso"; // date: Date object, string: yyyy-MM-dd, iso: ISO 8601
};

type TFieldGroup = TFieldBase & {
  type: "group";
  fields: TFormField[];
  isArray?: boolean;
  validation?: never; // group itself not validated, only children
  value?: never;
  layouts?: {
    cols: number;
  };
};

export type TFieldArray = TFieldBase & {
  type: "array";
  fields: TFormField[];
  validation?: never; // group itself not validated, only children
  value?: never;
  layouts?: {
    cols: number;
  };
};

export type TFormField = TFieldLeaf | TFieldGroup | TFieldArray;

export type TFormDetail = {
  title: string;
  description?: string;
  fields: TFormField[];
  layouts?: {
    cols: number;
  };
}

export type TFormBuilderProps = {
  formDetail: TFormDetail;
  onSubmit: (data: unknown) => void;
  setDynamicFormDetail:  React.Dispatch<React.SetStateAction<TFormDetail | null>>
}