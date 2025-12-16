import Logo from "@/app/components/ui/Logo";
import Nav from "@/app/components/ui/Nav";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <header className="py-6 flex justify-between items-center">
        <Logo />
        <Nav />
      </header>
      {children}
    </div>
  );
}

