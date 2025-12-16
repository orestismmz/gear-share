import Logo from "@/app/components/ui/Logo";
import Nav from "@/app/components/ui/Nav";
import { createClient } from "@/app/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  // // Check if user is already logged in
  // const supabase = await createClient();
  // const { data: { user } } = await supabase.auth.getUser();

  // if (user) redirect("/profile"); 
  
  return (
    <div className="min-h-screen flex flex-col">
      <header className="py-6 flex justify-between items-center">
        <Logo />
        <Nav />
      </header>
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-md px-4">
          {children}
        </div>
      </div>
    </div>
  );
}


