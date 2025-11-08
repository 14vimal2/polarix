import type { Meta, StoryObj } from "@storybook/react";
import { AppSidebar } from "../components/app-sidebar";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "../components/ui/sidebar";

const meta: Meta<typeof AppSidebar> = {
  title: "Components/AppSidebar",
  component: AppSidebar,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <SidebarProvider>
        <Story />
        <SidebarInset>
          <div className="p-4">
            <SidebarTrigger />
            <h1 className="text-xl font-bold">Main Content</h1>
            <p>This is the main content area.</p>
          </div>
        </SidebarInset>
      </SidebarProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof AppSidebar>;

export const Default: Story = {};