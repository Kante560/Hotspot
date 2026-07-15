import { Sidebar } from "../../components/layout/Sidebar";
import { BottomNav } from "../../components/layout/BottomNav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 min-w-0 p-4 pb-24 sm:p-6 md:pb-6 lg:p-8">
        <div className="mx-auto max-w-7xl">{children}</div>
      </main>
      <BottomNav />
    </div>
  );
}
