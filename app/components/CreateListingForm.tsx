"use client";

import { useState } from "react";
import { createListing } from "@/app/actions/listings";
import Button from "@/app/components/ui/Button";
import Image from "next/image";

export default function CreateListingForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);

    try {
      const result = await createListing(formData);
      if (result?.error) {
        setError(result.error);
        setIsSubmitting(false);
      }
      // If successful, the server action will redirect
    } catch (err) {
      setError("An unexpected error occurred");
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-md mx-auto">
      {error && (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="title" className="block text-sm font-medium mb-2">
          Title *
        </label>
        <input
          type="text"
          id="title"
          name="title"
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="e.g., Professional DSLR Camera"
        />
      </div>

      <div>
        <label htmlFor="image" className="block text-sm font-medium mb-2">
          Image *
        </label>
        <input
          type="file"
          id="image"
          name="image"
          accept="image/*"
          required
          onChange={handleImageChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
        {imagePreview && (
          <div className="mt-4 relative w-full h-64 rounded-lg overflow-hidden">
            <Image
              src={imagePreview}
              alt="Preview"
              fill
              className="object-cover"
            />
          </div>
        )}
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium mb-2">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="Describe your item in detail..."
        />
      </div>

      <div>
        <label
          htmlFor="price_per_day"
          className="block text-sm font-medium mb-2"
        >
          Price per day (DKK) *
        </label>
        <input
          type="number"
          id="price_per_day"
          name="price_per_day"
          required
          min="0.01"
          step="0.01"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="100.00"
        />
      </div>

      <div>
        <label htmlFor="category" className="block text-sm font-medium mb-2">
          Category *
        </label>
        <select
          id="category"
          name="category"
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">Select a category</option>
          <option value="diy">DIY</option>
          <option value="sports">Sports</option>
          <option value="outdoor">Outdoor</option>
          <option value="photography">Photography</option>
          <option value="music">Music</option>
        </select>
      </div>

      <div>
        <label htmlFor="condition" className="block text-sm font-medium mb-2">
          Condition *
        </label>
        <select
          id="condition"
          name="condition"
          required
          defaultValue="good"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="new">New</option>
          <option value="like_new">Like New</option>
          <option value="good">Good</option>
          <option value="fair">Fair</option>
          <option value="poor">Poor</option>
        </select>
      </div>

      <div>
        <label htmlFor="location" className="block text-sm font-medium mb-2">
          Location *
        </label>
        <select
          id="location"
          name="location"
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">Select a location</option>
          <option value="amagerbro">Amagerbro</option>
          <option value="østerbro">Østerbro</option>
          <option value="nørrebro">Nørrebro</option>
          <option value="vesterbro">Vesterbro</option>
        </select>
      </div>

      <div className="flex gap-4">
        <Button type="submit" disabled={isSubmitting} className="flex-1">
          {isSubmitting ? "Creating..." : "Create Listing"}
        </Button>
      </div>
    </form>
  );
}
