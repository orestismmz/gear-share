import Logo from "@/app/components/ui/Logo";
import Nav from "@/app/components/ui/Nav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <header className="sticky top-0 z-50 bg-background py-6 flex justify-between items-center">
        <Logo />
        <Nav />
      </header>
      {children}
    </div>
  );
}
