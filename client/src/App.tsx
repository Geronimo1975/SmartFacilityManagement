import { Switch, Route, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { queryClient } from "./lib/queryClient";
import AuthPage from "./pages/AuthPage";
import DashboardPage from "./pages/DashboardPage";
import { useUser } from "./hooks/use-user";
import { Loader2 } from "lucide-react";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppRoutes />
      <Toaster />
    </QueryClientProvider>
  );
}

function AppRoutes() {
  const { user, isLoading } = useUser();
  const [, setLocation] = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If user is not authenticated, show auth page
  if (!user) {
    return <AuthPage />;
  }

  // If user is authenticated and on root, redirect to dashboard
  if (window.location.pathname === '/') {
    setLocation('/dashboard');
    return null;
  }

  return (
    <Switch>
      <Route path="/dashboard/*" component={DashboardPage} />
      <Route>
        <div className="flex items-center justify-center min-h-screen">
          <h1 className="text-2xl font-bold">404 - Page Not Found</h1>
        </div>
      </Route>
    </Switch>
  );
}

export default App;