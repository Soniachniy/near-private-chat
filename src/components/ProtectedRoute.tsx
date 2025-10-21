import { Navigate } from "react-router";
import { APP_ROUTES } from "@/pages/routes";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  // const user = useUserStore((state) => state.user);
  const token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to={APP_ROUTES.WELCOME} replace />;
  }

  // if (!user) {
  //   return <Navigate to={APP_ROUTES.WELCOME} replace />;
  // }

  return children;
};

export default ProtectedRoute;
