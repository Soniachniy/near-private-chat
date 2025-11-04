import { useMemo } from "react";
import { Route, Routes } from "react-router";
import { Toaster } from "sonner";
import { useChats } from "@/api/chat/queries";
import AdminProtectedRoute from "@/components/AdminProtectRoute";
import LoadingScreen from "@/components/common/LoadingScreen";
import AdminLayout from "@/components/layout/AdminLayot";
import Layout from "@/components/layout/Layout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAppInitialization } from "@/hooks/useAppInitialization";
import AuthPage from "@/pages/AuthPage";
import AdminPage from "@/pages/admin";
import AdminSettingsPage from "@/pages/admin/Settings";
import AdminUsersPage from "@/pages/admin/User";
import Home from "@/pages/Home";
import { APP_ROUTES } from "@/pages/routes";
import WelcomePage from "@/pages/WelcomePage";
import { useSettingsStore } from "@/stores/useSettingsStore";
import { useUserStore } from "@/stores/useUserStore";

function App() {
  const { isInitialized, isLoading: isAppLoading } = useAppInitialization();
  const { user } = useUserStore();
  const token = localStorage.getItem("token");
  const { isLoading: isChatLoading } = useChats({
    enabled: !!token && !!user,
  });

  const { settings } = useSettingsStore();
  console.log("isChatLoading", isInitialized, isChatLoading);

  const toasterTheme = useMemo(() => {
    if (settings.theme?.includes("dark")) {
      return "dark";
    }
    if (settings.theme === "system") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    return "light";
  }, [settings.theme]);

  if (!isInitialized || isAppLoading || (user && isChatLoading)) {
    return <LoadingScreen />;
  }

  return (
    <div className="relative h-screen">
      <Toaster theme={toasterTheme} richColors position="top-right" />
      <Routes>
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path={APP_ROUTES.HOME} element={<Home />} />
          <Route path={APP_ROUTES.CHAT} element={<Home />} />

          <Route
            element={
              <AdminProtectedRoute>
                <AdminLayout />
              </AdminProtectedRoute>
            }
          >
            <Route path={APP_ROUTES.ADMIN} element={<AdminPage />} />
            <Route path={APP_ROUTES.ADMIN_USERS} element={<AdminUsersPage />} />
            <Route path={APP_ROUTES.ADMIN_SETTINGS} element={<AdminSettingsPage />} />
            {/* <Route path={APP_ROUTES.PLAYGROUND} element={<Playground />} /> */}
          </Route>
        </Route>

        <Route path={APP_ROUTES.WELCOME} element={<WelcomePage />} />
        <Route path={APP_ROUTES.AUTH} element={<AuthPage />} />
      </Routes>
    </div>
  );
}

export default App;
