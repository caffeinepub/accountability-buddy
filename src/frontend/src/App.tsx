import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";
import {
  Link,
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
  useRouterState,
} from "@tanstack/react-router";
import {
  LayoutDashboard,
  Loader2,
  LogIn,
  LogOut,
  Shield,
  Target,
} from "lucide-react";
import { useEffect } from "react";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import Dashboard from "./pages/Dashboard";
import GoalDetail from "./pages/GoalDetail";
import Goals from "./pages/Goals";
import { useGoalsStore } from "./store/goalsStore";

function NavLink({
  to,
  icon: Icon,
  label,
  ocid,
}: {
  to: string;
  icon: React.ElementType;
  label: string;
  ocid: string;
}) {
  const state = useRouterState();
  const isActive =
    to === "/"
      ? state.location.pathname === "/"
      : state.location.pathname.startsWith(to);
  return (
    <Link
      to={to}
      data-ocid={ocid}
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
        isActive
          ? "bg-primary/15 text-primary"
          : "text-muted-foreground hover:text-foreground hover:bg-secondary",
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  );
}

function RootLayout() {
  const { login, clear, loginStatus, identity, isInitializing } =
    useInternetIdentity();
  const seedIfEmpty = useGoalsStore((s) => s.seedIfEmpty);

  useEffect(() => {
    seedIfEmpty();
  }, [seedIfEmpty]);

  const isLoggingIn = loginStatus === "logging-in";
  const principal = identity?.getPrincipal().toString();
  const shortPrincipal = principal
    ? `${principal.slice(0, 5)}...${principal.slice(-3)}`
    : "";

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-7 h-7 rounded-md bg-primary/20 border border-primary/30 flex items-center justify-center">
              <Shield className="h-4 w-4 text-primary" />
            </div>
            <span className="font-bold text-sm tracking-tight text-foreground">
              Accountability Buddy
            </span>
          </Link>

          {/* Nav */}
          <nav className="hidden sm:flex items-center gap-1">
            <NavLink
              to="/"
              icon={LayoutDashboard}
              label="Dashboard"
              ocid="nav.dashboard.link"
            />
            <NavLink
              to="/goals"
              icon={Target}
              label="Goals"
              ocid="nav.goals.link"
            />
          </nav>

          {/* Auth */}
          <div className="flex items-center gap-2">
            {isInitializing ? (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            ) : identity ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground hidden sm:block">
                  {shortPrincipal}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => clear()}
                  data-ocid="auth.logout.button"
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <Button
                size="sm"
                onClick={() => login()}
                disabled={isLoggingIn}
                data-ocid="auth.login.button"
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {isLoggingIn ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <LogIn className="h-4 w-4 mr-1" />
                )}
                Sign In
              </Button>
            )}
          </div>
        </div>

        {/* Mobile nav */}
        <div className="sm:hidden flex items-center gap-1 px-4 pb-2">
          <NavLink
            to="/"
            icon={LayoutDashboard}
            label="Dashboard"
            ocid="mobile.nav.dashboard.link"
          />
          <NavLink
            to="/goals"
            icon={Target}
            label="Goals"
            ocid="mobile.nav.goals.link"
          />
        </div>
      </header>

      {/* Main */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-auto py-4 px-4">
        <div className="max-w-6xl mx-auto text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()}. Built with ❤️ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-foreground transition-colors"
          >
            caffeine.ai
          </a>
        </div>
      </footer>

      <Toaster richColors position="top-right" />
    </div>
  );
}

const rootRoute = createRootRoute({ component: RootLayout });
const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: Dashboard,
});
const goalsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/goals",
  component: Goals,
});
const goalDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/goals/$goalId",
  component: GoalDetail,
});

const routeTree = rootRoute.addChildren([
  dashboardRoute,
  goalsRoute,
  goalDetailRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
