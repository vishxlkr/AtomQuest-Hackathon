import ProtectedRoute from "../../components/layout/ProtectedRoute";
import DashboardLayout from "../../components/layout/DashboardLayout";

export default function Layout({ children }) {
  return <ProtectedRoute><DashboardLayout>{children}</DashboardLayout></ProtectedRoute>;
}
