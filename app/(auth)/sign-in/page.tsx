import SignInForm from "@/app/components/auth/SignInForm";

export default function SignInPage() {
  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">Sign In</h1>
        <p className="text-grey-dark">Sign in to GearShare to start renting gear</p>
      </div>
      <SignInForm />
    </div>
  );
}

