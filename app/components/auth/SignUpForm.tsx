"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Button from "../ui/Button";
import { createClient } from "@/app/lib/supabase/client";

export default function SignUpForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      setIsLoading(false);
      return;
    }

    try {
      // Create Supabase client
      const supabase = createClient();

      // Pre-check: Verify username is available before creating auth user
      const { data: existingUsername } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", formData.username.trim())
        .maybeSingle();

      if (existingUsername) {
        setError("This username is already taken. Please choose another.");
        return;
      }

      // Step 1: Sign up the user with Supabase Auth
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: formData.email.trim(),
        password: formData.password,
      });

      if (signUpError) {
        if (signUpError.message.includes("already registered")) {
          setError("This email is already registered. Please sign in instead.");
        } else {
          setError(signUpError.message || "Failed to create account. Please try again.");
        }
        return;
      }

      if (!authData.user) {
        setError("Failed to create account. Please try again.");
        return;
      }

      // Step 2: Create profile in profiles table
      const { error: profileError } = await supabase
        .from("profiles")
        .insert({
          id: authData.user.id,
          firstname: formData.firstname.trim(),
          lastname: formData.lastname.trim(),
          username: formData.username.trim(),
          is_verified: false,
        });

      if (profileError) {
        // Handle profile creation errors
        if (profileError.code === "23505") {
          if (profileError.message.includes("username")) {
            setError("This username is already taken. Please choose another.");
          } else {
            setError("Failed to create profile. Please try again.");
          }
        } else {
          setError(profileError.message || "Failed to create profile. Please try again.");
        }
        return;
      }

      // Reset form on success
      setFormData({
        firstname: "",
        lastname: "",
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
      });

      // Navigate to sign-in page
      router.push("/sign-in");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4">
      <div>
        <label htmlFor="firstname" className="block text-sm font-medium mb-1">
          First Name
        </label>
        <input
          type="text"
          id="firstname"
          name="firstname"
          value={formData.firstname}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border border-grey-dark/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          placeholder="John"
        />
      </div>

      <div>
        <label htmlFor="lastname" className="block text-sm font-medium mb-1">
          Last Name
        </label>
        <input
          type="text"
          id="lastname"
          name="lastname"
          value={formData.lastname}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border border-grey-dark/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          placeholder="Doe"
        />
      </div>

      <div>
        <label htmlFor="username" className="block text-sm font-medium mb-1">
          Username
        </label>
        <input
          type="text"
          id="username"
          name="username"
          value={formData.username}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border border-grey-dark/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          placeholder="johndoe"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-1">
          Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border border-grey-dark/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          placeholder="john@example.com"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium mb-1">
          Password
        </label>
        <input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
          minLength={6}
          className="w-full px-4 py-2 border border-grey-dark/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          placeholder="••••••••"
        />
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">
          Confirm Password
        </label>
        <input
          type="password"
          id="confirmPassword"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
          minLength={6}
          className="w-full px-4 py-2 border border-grey-dark/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          placeholder="••••••••"
        />
      </div>

      {error && (
        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      <Button
        type="submit"
        variant="primary"
        size="lg"
        className="w-full"
        disabled={isLoading}
      >
        {isLoading ? "Signing up..." : "Sign Up"}
      </Button>

      <p className="text-center text-sm text-grey-dark">
        or{" "}
        <Link href="/sign-in" className="text-primary hover:underline font-medium">
          Sign in if you already have an account
        </Link>
      </p>
    </form>
  );
}

