import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useUser } from "@/hooks/use-user";
import { DASHBOARD_CONFIG } from "@/lib/constants";
import {
  Building2,
  LayoutDashboard,
  Settings,
  Users,
  FileText,
  LogOut,
} from "lucide-react";

export function Sidebar() {
  const { user, logout } = useUser();
  
  if (!user) return null;
  
  const config = DASHBOARD_CONFIG[user.role as keyof typeof DASHBOARD_CONFIG];

  return (
    <div className="flex h-screen flex-col border-r bg-sidebar">
      <div className="p-6">
        <h2 className="font-semibold text-lg text-sidebar-foreground">
          Facility Management
        </h2>
      </div>
      <ScrollArea className="flex-1 px-4">
        <div className="space-y-2">
          <Button
            variant="ghost"
            className="w-full justify-start"
            asChild
          >
            <Link href="/dashboard">
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Dashboard
            </Link>
          </Button>
          
          {config.features.includes("userManagement") && (
            <Button
              variant="ghost"
              className="w-full justify-start"
              asChild
            >
              <Link href="/dashboard/users">
                <Users className="mr-2 h-4 w-4" />
                Users
              </Link>
            </Button>
          )}
          
          {config.features.includes("systemControls") && (
            <Button
              variant="ghost"
              className="w-full justify-start"
              asChild
            >
              <Link href="/dashboard/controls">
                <Building2 className="mr-2 h-4 w-4" />
                Building Controls
              </Link>
            </Button>
          )}
          
          {config.features.includes("reports") && (
            <Button
              variant="ghost"
              className="w-full justify-start"
              asChild
            >
              <Link href="/dashboard/reports">
                <FileText className="mr-2 h-4 w-4" />
                Reports
              </Link>
            </Button>
          )}
        </div>
      </ScrollArea>
      <div className="p-4 border-t">
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={() => logout()}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
}
