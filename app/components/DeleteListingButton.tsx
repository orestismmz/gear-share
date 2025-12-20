"use client";

import { useState } from "react";
import { deleteListing } from "@/app/actions/listings";
import Button from "./ui/Button";

interface DeleteListingButtonProps {
  listingId: string;
}

export default function DeleteListingButton({
  listingId,
}: DeleteListingButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this listing? This action cannot be undone."
      )
    ) {
      return;
    }

    setIsDeleting(true);

    try {
      await deleteListing(listingId);
    } catch (error) {
      console.error("Error deleting listing:", error);
      alert("Failed to delete listing. Please try again.");
      setIsDeleting(false);
    }
  };

  return (
    <Button
      onClick={handleDelete}
      disabled={isDeleting}
      className="bg-red-600 hover:bg-red-700"
    >
      {isDeleting ? "Deleting..." : "Delete Listing"}
    </Button>
  );
}
