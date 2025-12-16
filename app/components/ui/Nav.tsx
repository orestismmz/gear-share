import Link from "next/link";
import { User } from "lucide-react";

export default function Nav() {
  return (
    <nav>
      <Link 
        href="/profile" 
        className="inline-flex items-center gap-2 text-primary hover:opacity-80 transition-opacity"
        aria-label="Profile"
      >
        <User size={24} />
      </Link>
    </nav>
  );
}

