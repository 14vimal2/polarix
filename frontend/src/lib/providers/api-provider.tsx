"use client";

import { Configuration, UserApi } from "@/lib/api-client";
import { BASE_PATH } from "@/lib/api-client/runtime";
import type { Middleware } from "@/lib/api-client/runtime";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import React, { createContext, useContext, useMemo } from "react";
import { useAuth } from "./auth-provider";

// Create a client
const queryClient = new QueryClient();

interface IApiContext {
  userApi: UserApi;
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

  const userApi = useMemo(() => {
    const middleware: Middleware[] = [
      {
        async pre(context) {
          try {
            await keycloak.updateToken(30);
          } catch (error) {
            console.error("Failed to refresh token", error);
            // Fallback to login if token refresh fails
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
    return new UserApi(apiConfig);
  }, [keycloak]);

  return (
    <ApiContext.Provider value={{ userApi }}>
      <QueryClientProvider client={queryClient}>
        {children}
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ApiContext.Provider>
  );
}