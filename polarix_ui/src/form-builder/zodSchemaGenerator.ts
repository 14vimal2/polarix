import { z } from "zod";
import { type TFormField } from "./type";

const generateShape = (fields: TFormField[]): { [key: string]: z.ZodTypeAny } => {
  const shape: { [key: string]: z.ZodTypeAny } = {};

  fields.forEach((field) => {
    if (field.type === 'group' && field.fields) {
      shape[field.name] = z.object(generateShape(field.fields));
    } else if (field.type === 'array' && field.fields) {
      shape[field.name] = z.array(z.object(generateShape(field.fields)));
    }
    else if ('validation' in field && field.validation) {
      shape[field.name] = field.validation;
    }
  });

  return shape;
};

/**
 * Generates a Zod schema from an array of form field configurations.
 * This function recursively builds a schema that can be used for form validation.
 * For fields with conditional logic, it uses `z.any()` and expects validation
 * to be handled by `superRefine` in the main form component.
 *
 * @param {TFormField[]} fields - An array of form field configurations.
 * @returns {z.ZodObject<any>} A Zod schema object.
 */
export const generateZodSchema = (fields: TFormField[]): z.ZodObject<any> => {
  const shape: Record<string, z.ZodTypeAny> = {};

  fields.forEach((field) => {
    if (field.type === "group" && "fields" in field) {
      const groupSchema = generateZodSchema(field.fields);
      shape[field.name] = field.condition ? z.any() : groupSchema;
    } else if (field.type === "array" && "fields" in field) {
      const arrayItemSchema = generateZodSchema(field.fields);
      const arraySchema = z.array(arrayItemSchema);
      shape[field.name] = field.condition ? z.any() : arraySchema;
    } else if ("validation" in field && field.validation) {
      // For any conditional field, use a permissive `z.any()` in the base
      // schema. The actual validation will be handled in `superRefine`.
      if (field.condition) {
        shape[field.name] = z.any();
      } else {
        shape[field.name] = field.validation;
      }
    }
  });

  return z.object(shape);
};

/**
 * Generates default values for a form based on an array of field configurations.
 * This is useful for initializing a form with `react-hook-form`.
 * It recursively processes group and array fields to build a nested default value structure.
 *
 * @param {TFormField[]} fields - An array of form field configurations.
 * @returns {Record<string, unknown>} An object containing the default values for the form.
 */
export const generateDefaultFormValues = (fields: TFormField[]): Record<string, unknown> => {
  return fields.reduce((acc, field) => {
    if (field.hidden) {
      return acc;
    }

    if (field.type === "group" && field.fields) {
      acc[field.name] = generateDefaultFormValues(field.fields);
    } else if (field.type === "array") {
      acc[field.name] = [generateDefaultFormValues(field.fields)];
    } else if ("value" in field) {
      acc[field.name] = field.value ?? "";
    } else {
      acc[field.name] = "";
    }

    return acc;
  }, {} as Record<string, unknown>);
};