import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
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
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </main>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />

        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/local" element={<Index />} />
              <Route path="/rooms/create" element={<CreateRoom />} />
              <Route path="/rooms/join" element={<JoinRoom />} />
              <Route path="/rooms/:code/lobby" element={<RoomLobby />} />
              <Route path="/rooms/:code/game" element={<RoomGame />} />
              <Route path="/game" element={<Navigate to="/local" replace />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;