import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { useAuth } from "./_core/hooks/useAuth";

// Public pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Pricing from "./pages/Pricing";

// Student pages
import StudentDashboard from "./pages/student/Dashboard";
import ParcoursList from "./pages/student/ParcoursList";
import ParcoursDetail from "./pages/student/ParcoursDetail";
import LessonView from "./pages/student/LessonView";
import QuizView from "./pages/student/QuizView";
import Profile from "./pages/student/Profile";
import Chatbot from "./pages/student/Chatbot";

// Admin pages
import AdminDashboard from "./pages/admin/Dashboard";
import AdminParcours from "./pages/admin/Parcours";
import AdminParcoursEdit from "./pages/admin/ParcoursEdit";
import AdminModules from "./pages/admin/Modules";
import AdminModuleEdit from "./pages/admin/ModuleEdit";
import AdminLessons from "./pages/admin/Lessons";
import AdminLessonEdit from "./pages/admin/LessonEdit";
import AdminQuizzes from "./pages/admin/Quizzes";
import AdminQuizEdit from "./pages/admin/QuizEdit";
import AdminUsers from "./pages/admin/Users";
import AdminAlerts from "./pages/admin/Alerts";
import AdminAiGeneration from "./pages/admin/AiGeneration";

// Protected route wrapper
function ProtectedRoute({ children, adminOnly = false }: { children: React.ReactNode; adminOnly?: boolean }) {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    window.location.href = "/login";
    return null;
  }

  if (adminOnly && user?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive">Accès refusé</h1>
          <p className="text-muted-foreground mt-2">Vous n'avez pas les permissions nécessaires.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

function Router() {
  return (
    <Switch>
      {/* Public routes */}
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/pricing" component={Pricing} />

      {/* Student routes */}
      <Route path="/dashboard">
        <ProtectedRoute>
          <StudentDashboard />
        </ProtectedRoute>
      </Route>
      <Route path="/parcours">
        <ProtectedRoute>
          <ParcoursList />
        </ProtectedRoute>
      </Route>
      <Route path="/parcours/:slug">
        {(params) => (
          <ProtectedRoute>
            <ParcoursDetail slug={params.slug} />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/lesson/:id">
        {(params) => (
          <ProtectedRoute>
            <LessonView lessonId={parseInt(params.id)} />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/quiz/:id">
        {(params) => (
          <ProtectedRoute>
            <QuizView quizId={parseInt(params.id)} />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/profile">
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      </Route>
      <Route path="/chatbot">
        <ProtectedRoute>
          <Chatbot />
        </ProtectedRoute>
      </Route>

      {/* Admin routes */}
      <Route path="/admin">
        <ProtectedRoute adminOnly>
          <AdminDashboard />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/parcours">
        <ProtectedRoute adminOnly>
          <AdminParcours />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/parcours/new">
        <ProtectedRoute adminOnly>
          <AdminParcoursEdit />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/parcours/:id">
        {(params) => (
          <ProtectedRoute adminOnly>
            <AdminParcoursEdit parcoursId={parseInt(params.id)} />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/admin/modules">
        <ProtectedRoute adminOnly>
          <AdminModules />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/modules/new">
        <ProtectedRoute adminOnly>
          <AdminModuleEdit />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/modules/:id">
        {(params) => (
          <ProtectedRoute adminOnly>
            <AdminModuleEdit moduleId={parseInt(params.id)} />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/admin/lessons">
        <ProtectedRoute adminOnly>
          <AdminLessons />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/lessons/new">
        <ProtectedRoute adminOnly>
          <AdminLessonEdit />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/lessons/:id">
        {(params) => (
          <ProtectedRoute adminOnly>
            <AdminLessonEdit lessonId={parseInt(params.id)} />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/admin/quizzes">
        <ProtectedRoute adminOnly>
          <AdminQuizzes />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/quizzes/new">
        <ProtectedRoute adminOnly>
          <AdminQuizEdit />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/quizzes/:id">
        {(params) => (
          <ProtectedRoute adminOnly>
            <AdminQuizEdit quizId={parseInt(params.id)} />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/admin/users">
        <ProtectedRoute adminOnly>
          <AdminUsers />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/alerts">
        <ProtectedRoute adminOnly>
          <AdminAlerts />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/ai-generation">
        <ProtectedRoute adminOnly>
          <AdminAiGeneration />
        </ProtectedRoute>
      </Route>

      {/* Fallback routes */}
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
