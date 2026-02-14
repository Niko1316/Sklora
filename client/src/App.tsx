import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { useAuth } from "./_core/hooks/useAuth";
import { lazy, Suspense } from "react";
import { Loader2 } from "lucide-react";

// Loading spinner for lazy-loaded pages
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
        <p className="text-muted-foreground text-sm">Chargement...</p>
      </div>
    </div>
  );
}

// Public pages (Home loaded eagerly for fast first paint)
import Home from "./pages/Home";
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const Pricing = lazy(() => import("./pages/Pricing"));
const VerifyCertificate = lazy(() => import("./pages/VerifyCertificate"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Student pages (lazy loaded)
const StudentDashboard = lazy(() => import("./pages/student/Dashboard"));
const ParcoursList = lazy(() => import("./pages/student/ParcoursList"));
const ParcoursDetail = lazy(() => import("./pages/student/ParcoursDetail"));
const LessonView = lazy(() => import("./pages/student/LessonView"));
const QuizView = lazy(() => import("./pages/student/QuizView"));
const Profile = lazy(() => import("./pages/student/Profile"));
const Chatbot = lazy(() => import("./pages/student/Chatbot"));
const Progress = lazy(() => import("./pages/student/Progress"));
const Certificates = lazy(() => import("./pages/student/Certificates"));
const CertificateView = lazy(() => import("./pages/student/CertificateView"));

// Admin pages (lazy loaded)
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));
const AdminParcours = lazy(() => import("./pages/admin/Parcours"));
const AdminParcoursEdit = lazy(() => import("./pages/admin/ParcoursEdit"));
const AdminModules = lazy(() => import("./pages/admin/Modules"));
const AdminModuleEdit = lazy(() => import("./pages/admin/ModuleEdit"));
const AdminLessons = lazy(() => import("./pages/admin/Lessons"));
const AdminLessonEdit = lazy(() => import("./pages/admin/LessonEdit"));
const AdminQuizzes = lazy(() => import("./pages/admin/Quizzes"));
const AdminQuizEdit = lazy(() => import("./pages/admin/QuizEdit"));
const AdminUsers = lazy(() => import("./pages/admin/Users"));
const AdminAlerts = lazy(() => import("./pages/admin/Alerts"));
const AdminAiGeneration = lazy(() => import("./pages/admin/AiGeneration"));
const AdminUserProgress = lazy(() => import("./pages/admin/UserProgress"));

// Protected route wrapper
function ProtectedRoute({ children, adminOnly = false }: { children: React.ReactNode; adminOnly?: boolean }) {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return <PageLoader />;
  }

  if (!isAuthenticated) {
    window.location.href = "/login";
    return null;
  }

  if (adminOnly && user?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-3">
          <h1 className="text-2xl font-heading font-bold text-destructive">Accès refusé</h1>
          <p className="text-muted-foreground">Vous n'avez pas les permissions nécessaires.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

function Router() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Switch>
        {/* Public routes */}
        <Route path="/" component={Home} />
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        <Route path="/pricing" component={Pricing} />
        <Route path="/verify-certificate" component={VerifyCertificate} />
        <Route path="/verify-certificate/:credentialId">
          {(params) => <VerifyCertificate credentialId={params.credentialId} />}
        </Route>

        {/* Onboarding (protected) */}
        <Route path="/onboarding">
          <ProtectedRoute>
            <Onboarding />
          </ProtectedRoute>
        </Route>

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
        <Route path="/progress">
          <ProtectedRoute>
            <Progress />
          </ProtectedRoute>
        </Route>
        <Route path="/certificates">
          <ProtectedRoute>
            <Certificates />
          </ProtectedRoute>
        </Route>
        <Route path="/certificates/:id">
          {(params) => (
            <ProtectedRoute>
              <CertificateView certificateId={parseInt(params.id)} />
            </ProtectedRoute>
          )}
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
        <Route path="/admin/progress">
          <ProtectedRoute adminOnly>
            <AdminUserProgress />
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
    </Suspense>
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
