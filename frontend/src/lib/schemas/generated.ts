import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core";
import { z } from "zod";

const UserInput = z
  .object({
    id: z.string().uuid().optional(),
    firstName: z.string().min(0).max(50),
    lastName: z.string().min(0).max(50).optional(),
    username: z.string().min(0).max(50),
    password: z.string().min(6).max(64),
    email: z.string().optional(),
    dateOfBirth: z.string().optional(),
  })
  .passthrough();
const User = z
  .object({
    id: z.string().uuid(),
    createdAt: z.string().datetime({ offset: true }),
    updatedAt: z.string().datetime({ offset: true }),
    firstName: z.string(),
    lastName: z.string(),
    username: z.string(),
    email: z.string(),
    dateOfBirth: z.string(),
    enabled: z.boolean(),
    emailVerified: z.boolean(),
    keycloakId: z.string(),
  })
  .partial()
  .passthrough();
const PageResponseUser = z
  .object({
    content: z.array(User),
    page: z.number().int(),
    size: z.number().int(),
    totalElements: z.number().int(),
    totalPages: z.number().int(),
  })
  .partial()
  .passthrough();

export const schemas = {
  UserInput,
  User,
  PageResponseUser,
};

const endpoints = makeApi([
  {
    method: "get",
    path: "/api/v1/user",
    alias: "searchUsers",
    requestFormat: "json",
    parameters: [
      {
        name: "filters",
        type: "Query",
        schema: z.record(z.string()),
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().int().optional().default(0),
      },
      {
        name: "size",
        type: "Query",
        schema: z.number().int().optional().default(10),
      },
      {
        name: "sortBy",
        type: "Query",
        schema: z.string().optional().default("id"),
      },
      {
        name: "sortDir",
        type: "Query",
        schema: z.string().optional().default("asc"),
      },
    ],
    response: z.void(),
  },
  {
    method: "post",
    path: "/api/v1/user",
    alias: "createUser",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: UserInput,
      },
    ],
    response: z.void(),
  },
  {
    method: "get",
    path: "/api/v1/user/:id",
    alias: "getUserById",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: z.void(),
  },
  {
    method: "put",
    path: "/api/v1/user/:id",
    alias: "updateUser",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: UserInput,
      },
      {
        name: "id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: z.void(),
  },
  {
    method: "delete",
    path: "/api/v1/user/:id",
    alias: "deleteUser",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: z.void(),
  },
  {
    method: "patch",
    path: "/api/v1/user/:id",
    alias: "patchUser",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: UserInput,
      },
      {
        name: "id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: z.void(),
  },
  {
    method: "get",
    path: "/api/v1/user/me",
    alias: "getCurrentUser",
    requestFormat: "json",
    response: z.void(),
  },
]);

export const api = new Zodios(endpoints);

export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
  return new Zodios(baseUrl, endpoints, options);
}
