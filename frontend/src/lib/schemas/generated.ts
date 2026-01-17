import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core";
import { z } from "zod";

type PolicyRepresentation = Partial<{
  id: string;
  name: string;
  description: string;
  type: string;
  policies: Array<string>;
  resources: Array<string>;
  scopes: Array<string>;
  logic: "POSITIVE" | "NEGATIVE";
  decisionStrategy: "AFFIRMATIVE" | "UNANIMOUS" | "CONSENSUS";
  owner: string;
  resourceType: string;
  resourcesData: Array<ResourceRepresentation>;
  scopesData: Array<ScopeRepresentation>;
  config: {};
}>;
type ResourceOwnerRepresentation = Partial<{
  id: string;
  name: string;
}>;
type ResourceRepresentation = Partial<{
  name: string;
  type: string;
  owner: ResourceOwnerRepresentation;
  ownerManagedAccess: boolean;
  displayName: string;
  attributes: {};
  _id: string;
  uris: Array<string>;
  scopes: Array<ScopeRepresentation>;
  icon_uri: string;
  uri: string;
  resource_scopes: Array<ScopeRepresentation>;
}>;
type ScopeRepresentation = Partial<{
  id: string;
  name: string;
  iconUri: string;
  policies: Array<PolicyRepresentation>;
  resources: Array<ResourceRepresentation>;
  displayName: string;
}>;

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
const ScopeRequest = z
  .object({ name: z.string(), displayName: z.string() })
  .partial()
  .passthrough();
const RoleRequest = z
  .object({ name: z.string(), description: z.string() })
  .partial()
  .passthrough();
const PermissionRequest = z
  .object({ moduleName: z.string(), actions: z.array(z.string()) })
  .partial()
  .passthrough();
const ModuleRequest = z
  .object({
    name: z.string(),
    displayName: z.string(),
    actions: z.array(z.string()),
  })
  .partial()
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
const ResourceOwnerRepresentation = z
  .object({ id: z.string(), name: z.string() })
  .partial()
  .passthrough();
const PolicyRepresentation: z.ZodType<PolicyRepresentation> = z.lazy(() =>
  z
    .object({
      id: z.string(),
      name: z.string(),
      description: z.string(),
      type: z.string(),
      policies: z.array(z.string()),
      resources: z.array(z.string()),
      scopes: z.array(z.string()),
      logic: z.enum(["POSITIVE", "NEGATIVE"]),
      decisionStrategy: z.enum(["AFFIRMATIVE", "UNANIMOUS", "CONSENSUS"]),
      owner: z.string(),
      resourceType: z.string(),
      resourcesData: z.array(ResourceRepresentation),
      scopesData: z.array(ScopeRepresentation),
      config: z.record(z.string()),
    })
    .partial()
    .passthrough()
);
const ScopeRepresentation: z.ZodType<ScopeRepresentation> = z.lazy(() =>
  z
    .object({
      id: z.string(),
      name: z.string(),
      iconUri: z.string(),
      policies: z.array(PolicyRepresentation),
      resources: z.array(ResourceRepresentation),
      displayName: z.string(),
    })
    .partial()
    .passthrough()
);
const ResourceRepresentation: z.ZodType<ResourceRepresentation> = z.lazy(() =>
  z
    .object({
      name: z.string(),
      type: z.string(),
      owner: ResourceOwnerRepresentation,
      ownerManagedAccess: z.boolean(),
      displayName: z.string(),
      attributes: z.record(z.array(z.string())),
      _id: z.string(),
      uris: z.array(z.string()),
      scopes: z.array(ScopeRepresentation),
      icon_uri: z.string(),
      uri: z.string(),
      resource_scopes: z.array(ScopeRepresentation),
    })
    .partial()
    .passthrough()
);
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
const Composites = z
  .object({
    realm: z.array(z.string()),
    client: z.record(z.array(z.string())),
    application: z.record(z.array(z.string())),
  })
  .partial()
  .passthrough();
const RoleRepresentation = z
  .object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    scopeParamRequired: z.boolean(),
    composite: z.boolean(),
    composites: Composites,
    clientRole: z.boolean(),
    containerId: z.string(),
    attributes: z.record(z.array(z.string())),
  })
  .partial()
  .passthrough();

export const schemas = {
  UserInput,
  ScopeRequest,
  RoleRequest,
  PermissionRequest,
  ModuleRequest,
  User,
  ResourceOwnerRepresentation,
  PolicyRepresentation,
  ScopeRepresentation,
  ResourceRepresentation,
  PageResponseUser,
  Composites,
  RoleRepresentation,
};

const endpoints = makeApi([
  {
    method: "get",
    path: "/api/v1/modules",
    alias: "getAllModules",
    requestFormat: "json",
    response: z.void(),
  },
  {
    method: "post",
    path: "/api/v1/modules",
    alias: "createModule",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: ModuleRequest,
      },
    ],
    response: z.void(),
  },
  {
    method: "get",
    path: "/api/v1/modules/:moduleName",
    alias: "getModuleByName",
    requestFormat: "json",
    parameters: [
      {
        name: "moduleName",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: z.void(),
  },
  {
    method: "put",
    path: "/api/v1/modules/:moduleName/actions",
    alias: "updateModuleActions",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: z.array(z.string()),
      },
      {
        name: "moduleName",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: z.void(),
  },
  {
    method: "get",
    path: "/api/v1/roles",
    alias: "getAllRoles",
    requestFormat: "json",
    response: z.void(),
  },
  {
    method: "post",
    path: "/api/v1/roles",
    alias: "createRole",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: RoleRequest,
      },
    ],
    response: z.void(),
  },
  {
    method: "post",
    path: "/api/v1/roles/:roleName/permissions",
    alias: "assignPermissionsToRole",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: PermissionRequest,
      },
      {
        name: "roleName",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: z.void(),
  },
  {
    method: "get",
    path: "/api/v1/scopes",
    alias: "getAllScopes",
    requestFormat: "json",
    response: z.void(),
  },
  {
    method: "post",
    path: "/api/v1/scopes",
    alias: "createScope",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: ScopeRequest,
      },
    ],
    response: z.void(),
  },
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
