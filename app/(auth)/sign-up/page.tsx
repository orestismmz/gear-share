import SignUpForm from "@/app/components/auth/SignUpForm";

export default function SignUpPage() {
  return (
    <div >
      <div className="text-center pb-6">
        <h1 className="text-4xl font-bold pb-2">Create an Account</h1>
        <p className="text-grey-dark">Join GearShare to start renting gear</p>
      </div>
      <SignUpForm />
    </div>
  );
}

