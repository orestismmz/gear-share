import SignInForm from "../components/sign-in-form";

export default function SignInPage() {
  return (
    <div className="py-12">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">Sign In</h1>
        <p className="text-grey-dark">Welcome back to Gear Share</p>
      </div>
      <SignInForm />
    </div>
  );
}

