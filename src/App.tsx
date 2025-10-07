import { useEffect } from "react";
import { Route, Routes } from "react-router";
import { Toaster } from "sonner";
import { useChats } from "./api/chat/queries";
import LoadingScreen from "./components/common/LoadingScreen";
import Layout from "./components/layout/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import AuthPage from "./pages/AuthPage";
import Home from "./pages/Home";
import { APP_ROUTES } from "./pages/routes";
import WelcomePage from "./pages/WelcomePage";
import { useAppInitialization } from "./stores/useAppInitialization";
import { useSettingsStore } from "./stores/useSettingsStore";
import { useUserStore } from "./stores/useUserStore";

function App() {
  const { isInitialized, isLoading: isAppLoading, initializeApp } = useAppInitialization();
  const { user } = useUserStore();
  const { isLoading: isChatLoading } = useChats();

  const { settings } = useSettingsStore();

  useEffect(() => {
    initializeApp();
  }, [initializeApp]);

  if (!isInitialized || isAppLoading || (user && isChatLoading)) {
    return <LoadingScreen />;
  }

  // Determine theme for Toaster
  const getToasterTheme = () => {
    if (settings.theme?.includes("dark")) {
      return "dark";
    }
    if (settings.theme === "system") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    return "light";
  };

  return (
    <div className="relative h-screen">
      <Toaster theme={getToasterTheme()} richColors position="top-right" />
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
        </Route>

        <Route path={APP_ROUTES.WELCOME} element={<WelcomePage />} />
        <Route path={APP_ROUTES.AUTH} element={<AuthPage />} />
      </Routes>
    </div>
  );
}

export default App;
