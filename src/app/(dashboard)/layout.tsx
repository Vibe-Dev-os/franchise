import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar role={session.user.role} />
      <div className="flex min-h-screen flex-1 flex-col">
        <Topbar name={session.user.name ?? "User"} role={session.user.role} />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-7xl animate-in">{children}</div>
        </main>
      </div>
    </div>
  );
}
