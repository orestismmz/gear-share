"use client";

import { useState } from "react";
import Button from "../ui/Button";
import { logOutAction } from "@/app/actions/auth";

export default function LogoutButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await logOutAction();
    } catch (error) {
      console.error("Logout error:", error);
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="secondary"
      size="md"
      onClick={handleLogout}
      disabled={isLoading}
    >
      {isLoading ? "Logging out..." : "Log Out"}
    </Button>
  );
}

