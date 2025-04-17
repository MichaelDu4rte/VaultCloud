import { getCurrentUser } from "@/lib/actions/user.actions";
import Sidebar from "../../components/Sidebar";
import React from "react";
import { redirect } from "next/navigation";
import MobileNavigation from "@/components/MobileNavigation";
import { Toaster } from "@/components/ui/toaster";
import Header from "@/components/Header";

const layout = async ({ children }: { children: React.ReactNode }) => {
  const currentUser = await getCurrentUser();

  if (!currentUser) return redirect("/sign-in");

  return (
    <main className="h-screen bg-white bg-center">
      <Sidebar
        {...currentUser}
        userId={currentUser.$id}
        accountId={currentUser.accountId}
      />
      <section className="flex h-full flex-col md:pl-64">
        <MobileNavigation {...currentUser} />
        <Header />
        <div className="main-content p-6">
          {children}
          <Toaster />
        </div>
      </section>
    </main>
  );
};

export default layout;
