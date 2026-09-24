import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import AdminDashboard from "@/components/admin/AdminDashboard";

export default function AdminPage() {
  const cookieStore = cookies();
  const auth = cookieStore.get("base9_admin");

  if (!auth || auth.value !== "authenticated") {
    redirect("/admin/login");
  }

  return <AdminDashboard />;
}
