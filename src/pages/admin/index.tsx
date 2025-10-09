import { Navigate } from "react-router";
import { APP_ROUTES } from "../routes";

const AdminPage = () => {
  return <Navigate to={APP_ROUTES.ADMIN_USERS} replace />;
};

export default AdminPage;
