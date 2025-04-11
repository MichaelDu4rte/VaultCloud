import { getCurrentUser } from "@/lib/actions/user.actions";
import Sidebar from "../../components/Sidebar";
import React from "react";
import { redirect } from "next/navigation";
import MobileNavigation from "@/components/MobileNavigation";

const layout = async ({ children }: { children: React.ReactNode }) => {
  const currentUser = await getCurrentUser();

  if (!currentUser) return redirect("/sign-in");

  return (
    <main className="flex h-screen bg-white">
      <Sidebar {...currentUser} />
      <section className="flex h-full flex-1 flex-col">
        <MobileNavigation {...currentUser} />
        <div className="main-content">{children}</div>
      </section>
    </main>
  );
};

export default layout;
