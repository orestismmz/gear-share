import Link from "next/link";
import { User } from "lucide-react";

export default function Nav() {
  return (
    <nav>
      <Link 
        href="/profile" 
        className="inline-flex items-center gap-2 hover:opacity-80 transition-opacity"
        aria-label="Profile"
      >
        <div className="rounded-full border-2 border-secondary p-2">
          <User size={24} className="text-primary" />
        </div>
      </Link>
    </nav>
  );
}

