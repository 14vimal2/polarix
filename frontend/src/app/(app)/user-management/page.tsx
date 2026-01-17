"use client";

import { SimpleTabs } from "@/components/ui/simple-tabs";
import { ModuleTab } from "./_components/module-tab";
import { ScopeTab } from "./_components/scope-tab";
import { RoleTab } from "./_components/role-tab";

export default function UserManagementPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">User Management</h1>
      <SimpleTabs
        modulesContent={<ModuleTab />}
        scopesContent={<ScopeTab />}
        rolesContent={<RoleTab />}
      />
    </div>
  );
}