import { Switch, Route, useLocation } from "wouter";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { BuildingControls } from "@/components/dashboard/BuildingControls";
import { SystemStatus } from "@/components/dashboard/SystemStatus";
import { useUser } from "@/hooks/use-user";
import { DASHBOARD_CONFIG } from "@/lib/constants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Building } from "@db/schema";
import { Loader2 } from "lucide-react";
import { OccupancyHeatMap } from "@/components/dashboard/OccupancyHeatMap";

export default function DashboardPage() {
  const { user } = useUser();
  const [location] = useLocation();
  
  if (!user) return null;
  
  const config = DASHBOARD_CONFIG[user.role as keyof typeof DASHBOARD_CONFIG];

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto bg-background">
        <div className="h-full p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight">
              {config.title}
            </h1>
          </div>

          <Switch>
            <Route path="/dashboard" component={Overview} />
            <Route path="/dashboard/controls" component={Controls} />
            <Route path="/dashboard/users" component={UserManagement} />
            <Route path="/dashboard/reports" component={Reports} />
            <Route>
              <div className="flex items-center justify-center h-[calc(100vh-200px)]">
                <h2 className="text-2xl font-semibold">Page Not Found</h2>
              </div>
            </Route>
          </Switch>
        </div>
      </main>
    </div>
  );
}

function Overview() {
  const { data: buildings, isLoading } = useQuery<Building[]>({
    queryKey: ['/api/buildings'],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!buildings?.length) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <p className="text-muted-foreground">No buildings found</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {buildings.map((building) => (
        <Card key={building.id}>
          <CardHeader>
            <CardTitle>{building.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <SystemStatus buildingId={building.id} />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function Controls() {
  const { data: buildings, isLoading } = useQuery<Building[]>({
    queryKey: ['/api/buildings'],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!buildings?.length) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <p className="text-muted-foreground">No buildings found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {buildings.map((building) => (
        <div key={building.id} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{building.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <BuildingControls buildingId={building.id} />
                <OccupancyHeatMap buildingId={building.id} />
              </div>
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  );
}

function UserManagement() {
  const { user } = useUser();
  
  if (user?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <p className="text-muted-foreground">Access Denied</p>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Management</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          User management functionality to be implemented
        </p>
      </CardContent>
    </Card>
  );
}

function Reports() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Reports</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          Reports functionality to be implemented
        </p>
      </CardContent>
    </Card>
  );
}