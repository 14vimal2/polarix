# @polarix/ui

> UI component library for internal projects

## Install

```bash
npm install @polarix/ui
```

## Usage

### Components

To use individual UI components, you can import them directly from the `@polarix/ui/components` submodule:

```tsx
import React from 'react'
import { Button } from '@polarix/ui/components'

const App = () => {
  return <Button>Click me</Button>
}
```

### FormBuilder

The `FormBuilder` component allows you to dynamically generate forms from a configuration object. You can import it from the `@polarix/ui/form-builder` submodule.

Here is a more advanced example of how to use `FormBuilder` to create a user profile form with dynamic fields, conditional logic, and nested field groups.

```tsx
import React, { useState } from "react";
import { FormBuilder, TFormDetail } from "@polarix/ui/form-builder";
import { z } from "zod";

function ProfileForm() {
  const formConfig: TFormDetail = {
    title: "User Information",
    description: "A comprehensive form to collect user data.",
    fields: [
      {
        id: "name",
        name: "name",
        label: "Name",
        type: "text",
        required: true,
        placeholder: "Enter your name",
        validation: z.string().min(1, "Name is required"),
      },
      {
        id: "email",
        name: "email",
        label: "Email",
        type: "email",
        required: true,
        placeholder: "Enter your email",
        validation: z.string().email(),
      },
      {
        id: "maritalStatus",
        name: "maritalStatus",
        label: "Marital Status",
        type: "select",
        required: true,
        options: [
          { label: "Single", value: "single" },
          { label: "Married", value: "married" },
        ],
        validation: z.string().min(1, "Marital status is required"),
      },
      {
        id: "spouseName",
        name: "spouseName",
        label: "Spouse's Name",
        type: "text",
        required: true,
        placeholder: "Enter spouse's name",
        validation: z.string().min(1, "Spouse's name is required"),
        condition: (formValues) => formValues.maritalStatus === "married",
      },
      {
        id: "address",
        name: "address",
        label: "Address",
        type: "group",
        fields: [
          {
            id: "addressLine1",
            name: "addressLine1",
            label: "Address Line 1",
            type: "text",
            required: true,
            placeholder: "Enter your address",
            validation: z.string().min(1, "Address is required"),
          },
          {
            id: "pincode",
            name: "pincode",
            label: "Pincode",
            type: "number",
            required: true,
            placeholder: "Enter your pincode",
            validation: z.coerce.number().int().min(100000).max(999999),
          },
        ],
      },
      {
        id: "skills",
        name: "skills",
        label: "Skills",
        type: "array",
        fields: [
          {
            id: "skillName",
            name: "skillName",
            label: "Skill Name",
            type: "text",
            required: true,
            placeholder: "Enter a skill",
            validation: z.string().min(1, "Skill name is required"),
          },
          {
            id: "proficiency",
            name: "proficiency",
            label: "Proficiency",
            type: "select",
            required: true,
            options: [
              { label: "Beginner", value: "beginner" },
              { label: "Intermediate", value: "intermediate" },
              { label: "Advanced", value: "advanced" },
            ],
            validation: z.string().min(1, "Proficiency is required"),
          },
        ],
      },
    ],
    layouts: {
      cols: 2,
    },
  };

  const [formDetail, setFormDetail] = useState<TFormDetail>(formConfig);

  const handleSubmit = (data: unknown) => {
    console.log("Form submitted:", data);
    alert(JSON.stringify(data, null, 2));
  };

  return (
    <div className="max-w-4xl mx-auto mt-8">
      <FormBuilder
        formDetail={formDetail}
        onSubmit={handleSubmit}
        setDynamicFormDetail={setFormDetail}
      />
    </div>
  );
}

export default ProfileForm;

```

## Available Components

- Button
- Calendar
- Checkbox
- Combobox
- Command
- Date Picker
- Dialog
- File Upload
- Form
- Input
- Label
- Multi Select
- Popover
- Radio Group
- Select
- Textarea