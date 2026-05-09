import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";

import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { PageTransition } from "@/components/PageTransition";
import { AuthProvider } from "@/hooks/useAuth";

const Home = lazy(() => import("./pages/Home"));
const Index = lazy(() => import("./pages/Index"));
const CreateRoom = lazy(() => import("./pages/CreateRoom"));
const JoinRoom = lazy(() => import("./pages/JoinRoom"));
const RoomLobby = lazy(() => import("./pages/RoomLobby"));
const RoomGame = lazy(() => import("./pages/RoomGame"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

function PageLoader() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-background text-foreground">
      <Loader2 className="w-8 h-8 animate-spin text-primary-contrast" />
    </main>
  );
}

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            <PageTransition>
              <Home />
            </PageTransition>
          }
        />

        <Route
          path="/login"
          element={
            <PageTransition>
              <Login />
            </PageTransition>
          }
        />

        <Route
          path="/register"
          element={
            <PageTransition>
              <Register />
            </PageTransition>
          }
        />

        <Route
          path="/local"
          element={
            <PageTransition>
              <Index />
            </PageTransition>
          }
        />

        <Route
          path="/rooms/create"
          element={
            <PageTransition>
              <CreateRoom />
            </PageTransition>
          }
        />

        <Route
          path="/rooms/join"
          element={
            <PageTransition>
              <JoinRoom />
            </PageTransition>
          }
        />

        <Route
          path="/rooms/:code/lobby"
          element={
            <PageTransition>
              <RoomLobby />
            </PageTransition>
          }
        />

        <Route
          path="/rooms/:code/game"
          element={
            <PageTransition>
              <RoomGame />
            </PageTransition>
          }
        />

        <Route path="/game" element={<Navigate to="/local" replace />} />

        <Route
          path="*"
          element={
            <PageTransition>
              <NotFound />
            </PageTransition>
          }
        />
      </Routes>
    </AnimatePresence>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner duration={1500} />

        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <AnimatedRoutes />
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;