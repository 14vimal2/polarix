// src/app/(app)/home/page.tsx
'use client';
import { useAuthStore } from '@/store/auth-store';
import { FormBuilder, TFormDetail } from "@polarix/ui";
import { useState } from "react";
import z from "zod";

const demoFormDetail: TFormDetail = {
  title: "User Information",
  description: "A simple form to collect user data.",
  fields: [
    {
      name: "firstName",
      label: "First Name",
      type: "text",
      required: true,
      // value: user?.firstName,
      placeholder: "Enter your first name",
      validation: z.string().min(1, "First Name is required"),
    },
    {
      name: "lastName",
      label: "Last Name",
      type: "text",
      required: true,
      // value: user?.lastName,
      placeholder: "Enter your last name",
      validation: z.string().min(1, "Last Name is required"),
    },
    {
      name: "email",
      label: "Email",
      type: "email",
      // value: user?.username,          
      required: true,
      placeholder: "Enter your email",
      validation: z.email(),
    },
    {
      name: "age",
      label: "Age",
      type: "number",
      required: true,
      validation: z.coerce
        .number()
        .int()
        .min(0, "age must be a positive number")
        .max(100, "age cannot be more than 100"),
    },
    {
      name: "dob",
      label: "Date of Birth",
      type: "date",
      required: false,
      // value: user?.dateOfBirth,
      validation: z.date().nullable().optional(),
    },
    {
      name: "gender",
      label: "Gender",
      type: "radio",
      required: true,
      options: [
        { label: "Male", value: "male" },
        { label: "Female", value: "female" },
      ],
      validation: z.enum(["male", "female"], "gender must be selected"),
    },
    {
      name: "maritalStatus",
      label: "Marital Status",
      type: "select",
      required: true,
      options: [
        { label: "Single", value: "single" },
        { label: "Married", value: "married" },
        { label: "Divorced", value: "divorced" },
        { label: "Widowed", value: "widowed" },
      ],
      validation: z.string().min(1, "Marital status is required"),
    },
    {
      name: "spouseName",
      label: "Spouse's Name",
      type: "text",
      required: true,
      placeholder: "Enter spouse's name",
      validation: z.string().min(1, "Spouse's name is required"),
      condition: (formValues) => formValues.maritalStatus === "married",
    },
    {
      name: "address",
      label: "Address",
      type: "group",
      fields: [
        {
          name: "addressLine1",
          label: "Address Line 1",
          type: "text",
          required: true,
          placeholder: "Enter your address",
          validation: z.string().min(1, "Address Line 1 is required"),
          layout: { colSpan: 3 },
        },
        {
          name: "addressLine2",
          label: "Address Line 2",
          type: "text",
          placeholder: "Enter your address",
          validation: z.string().optional(),
          layout: { colSpan: 3 },
        },
        {
          name: "pincode",
          label: "Pincode",
          type: "number",
          required: true,
          placeholder: "Enter your pincode",
          validation: z.coerce.number().int().min(100000).max(999999),
        },
        {
          name: "state",
          label: "State",
          type: "text",
          required: true,
          placeholder: "Enter your state",
          validation: z.string().min(1, "State is required"),
        },
        {
          name: "country",
          label: "Country",
          type: "combobox",
          options: [
            {
              label: "India",
              value: "in",
            },
            {
              label: "United States",
              value: "us",
            },
            {
              label: "United Kingdom",
              value: "gb",
            },
            {
              label: "Canada",
              value: "ca",
            },
            {
              label: "Australia",
              value: "au",
            },
            {
              label: "Germany",
              value: "de",
            },
            {
              label: "France",
              value: "fr",
            },
            {
              label: "Japan",
              value: "jp",
            },
            {
              label: "Brazil",
              value: "br",
            },
            {
              label: "China",
              value: "cn",
            },
            {
              label: "Singapore",
              value: "sg",
            },
            {
              label: "United Arab Emirates",
              value: "ae",
            },
            {
              label: "South Africa",
              value: "za",
            },
            {
              label: "Mexico",
              value: "mx",
            },
          ],
          required: true,
          placeholder: "Enter your country",
          validation: z.string().min(1, "Country is required"),
        },
      ],
      layouts: {
        cols: 3,
      },
      layout: {
        colSpan: 2,
      },
    },
    {
      name: "skills",
      label: "Skills",
      type: "array",
      layout: {
        colSpan: 2,
      },
      layouts: {
        cols: 2,
      },
      fields: [
        {
          name: "skillName",
          label: "Skill Name",
          type: "text",
          required: true,
          placeholder: "Enter your skill name",
          validation: z.string().min(1, "Skill name is required"),
          layout: {
            colSpan: 1,
          },
        },
        {
          name: "proficiency",
          label: "Proficiency",
          type: "select",
          required: true,
          placeholder: "Select your proficiency",
          options: [
            { label: "Beginner", value: "beginner" },
            { label: "Intermediate", value: "intermediate" },
            { label: "Advanced", value: "advanced" },
          ],
          validation: z.string().min(1, "Proficiency is required"),
          layout: {
            colSpan: 1,
          },
        },
      ],
    },
    {
      name: "bio",
      label: "Bio",
      type: "textarea",
      required: false,
      placeholder: "Describe yourself",
      validation: z.string(),
      layout: {
        colSpan: 2
      }
    },
  ],
  layouts: {
    cols: 2,
  },
};

export default function HomePage() {
  const { user } = useAuthStore();
  const [formDetail, setFormDetail] = useState<TFormDetail | null>(
    demoFormDetail
  );

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="mb-4">Welcome, {user?.firstName}!</p>

      <div className="max-w-3xl mx-auto mt-8">
        {formDetail && (
          <FormBuilder
            formDetail={formDetail}
            onSubmit={(data) => {
              alert(JSON.stringify(data,null,2));
            }}
            setDynamicFormDetail={setFormDetail}
          />
        )}
      </div>
    </div>
  );
}