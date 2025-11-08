"use client";

import { createContext, useContext, useEffect, useState } from "react";
import keycloak from "../../../keycloak";
import { KeycloakInstance, KeycloakProfile } from "keycloak-js";
import { useAuthStore } from "@/store/auth-store";
import { Skeleton } from "@polarix/ui/components";

interface IAuthContext {
  keycloak: KeycloakInstance;
  profile: KeycloakProfile | null;
}

export const AuthContext = createContext<IAuthContext | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

/** Skeleton loader for the authentication flow */
function AuthSkeleton() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b">
        <div className="container flex h-20 items-center justify-between">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-10 w-20" />
        </div>
      </header>
      <main className="flex flex-1 flex-col items-center justify-center p-6">
        <div className="w-full max-w-md space-y-4 text-center">
          <Skeleton className="h-8 w-3/4 mx-auto" />
          <Skeleton className="h-6 w-1/2 mx-auto" />
          <Skeleton className="h-10 w-32 mx-auto" />
        </div>
      </main>
    </div>
  );
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { setAuthentication, setLoading, setError, setUser } = useAuthStore();
  const [keycloakInstance, setKeycloakInstance] =
    useState<KeycloakInstance | null>(null);
  const [profile, setProfile] = useState<KeycloakProfile | null>(null);

  useEffect(() => {
    const initKeycloak = async () => {
      setLoading(true);
      try {
        const authenticated = await keycloak.init({
          onLoad: "check-sso",
          silentCheckSsoRedirectUri:
            window.location.origin + "/silent-check-sso.html",
        });

        setAuthentication(authenticated);

        if (authenticated) {
          const profileData = await keycloak.loadUserProfile();
          setProfile(profileData);
          setUser({
            firstName: profileData.firstName,
            lastName: profileData.lastName,
            username: profileData.username,
          });
        }

        setKeycloakInstance(keycloak);
      } catch (error) {
        console.error("Failed to initialize Keycloak", error);
        setError("Authentication failed");
        setAuthentication(false);
      } finally {
        setLoading(false);
      }
    };

    if (typeof window !== "undefined") {
      initKeycloak();
    }
  }, [setAuthentication, setLoading, setError, setUser]);

  const { isLoading } = useAuthStore.getState();

  if (isLoading || !keycloakInstance) {
    return <AuthSkeleton />;
  }

  return (
    <AuthContext.Provider value={{ keycloak: keycloakInstance, profile }}>
      {children}
    </AuthContext.Provider>
  );
};
