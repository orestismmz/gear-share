import SignUpForm from "../components/sign-up-form";

export default function SignUpPage() {
  return (
    <div className="py-12">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">Create an Account</h1>
        <p className="text-grey-dark">Join Gear Share to start sharing and borrowing gear</p>
      </div>
      <SignUpForm />
    </div>
  );
}

