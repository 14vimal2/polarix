"use client";

import {
  Configuration,
  UserApi,
  PermissionsModulesApi,
  PermissionsRolesApi,
  PermissionsScopesApi,
} from "@/lib/api-client";
import { BASE_PATH } from "@/lib/api-client/runtime";
import type { Middleware } from "@/lib/api-client/runtime";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import React, { createContext, useContext, useMemo } from "react";
import { useAuth } from "./auth-provider";

const queryClient = new QueryClient();

// 1. Add the new API clients to the context interface
interface IApiContext {
  userApi: UserApi;
  permissionsModules: PermissionsModulesApi;
  permissionsRoles: PermissionsRolesApi;
  permissionsScopes: PermissionsScopesApi;
}

const ApiContext = createContext<IApiContext | null>(null);

export const useApi = () => {
  const context = useContext(ApiContext);
  if (!context) {
    throw new Error("useApi must be used within an ApiProvider");
  }
  return context;
};

export function ApiProvider({ children }: { children: React.ReactNode }) {
  const { keycloak } = useAuth();

  // 2. Create all API clients in a single memoized object
  const apiClients = useMemo(() => {
    const middleware: Middleware[] = [
      {
        async pre(context) {
          try {
            await keycloak.updateToken(30);
          } catch (error) {
            console.error("Failed to refresh token", error);
            keycloak.login();
          }

          const headers = new Headers(context.init.headers);
          headers.set("Authorization", `Bearer ${keycloak.token}`);
          context.init.headers = headers;

          return {
            url: context.url,
            init: context.init,
          };
        },
      },
    ];

    const apiConfig = new Configuration({
      basePath: BASE_PATH,
      middleware,
    });
    
    // Instantiate all clients with the same configuration
    return {
      userApi: new UserApi(apiConfig),
      permissionsModules: new PermissionsModulesApi(apiConfig),
      permissionsRoles: new PermissionsRolesApi(apiConfig),
      permissionsScopes: new PermissionsScopesApi(apiConfig),
    };
  }, [keycloak]);

  return (
    // 3. Provide all the clients in the context value
    <ApiContext.Provider value={apiClients}>
      <QueryClientProvider client={queryClient}>
        {children}
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ApiContext.Provider>
  );
}