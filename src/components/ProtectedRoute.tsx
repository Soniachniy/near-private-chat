import { Navigate } from "react-router";
import { APP_ROUTES } from "@/pages/routes";
import { useAppInitialization } from "@/stores/useAppInitialization";
import { useUserStore } from "@/stores/useUserStore";
import LoadingScreen from "./common/LoadingScreen";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const user = useUserStore((state) => state.user);
  const { isInitialized, isLoading } = useAppInitialization();

  if (isLoading || !isInitialized) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Navigate to={APP_ROUTES.WELCOME} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
