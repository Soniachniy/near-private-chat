import { Navigate } from "react-router";
import { APP_ROUTES } from "@/pages/routes";
import { useUserStore } from "@/stores/useUserStore";

const AdminProtectedRoute: React.FC<React.PropsWithChildren> = ({ children }) => {
  const user = useUserStore((state) => state.user);

  const isAdmin = user?.role === "admin";

  if (!isAdmin) {
    return <Navigate to={APP_ROUTES.HOME} replace />;
  }

  return children;
};

export default AdminProtectedRoute;
