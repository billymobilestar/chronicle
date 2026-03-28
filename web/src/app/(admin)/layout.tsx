import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import AdminSidebar from "@/components/layout/AdminSidebar";
import MobileShell from "@/components/layout/MobileShell";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentUser();
  if (!profile || profile.role !== "admin") redirect("/sign-in");

  return (
    <MobileShell sidebar={<AdminSidebar />} label="Admin">
      <div className="p-4 sm:p-6 lg:p-8">{children}</div>
    </MobileShell>
  );
}
