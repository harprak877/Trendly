import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-accent-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-secondary-900 mb-2">
            Join Trendly.ai
          </h1>
          <p className="text-secondary-600">
            Create your account to start generating trending content
          </p>
        </div>
        <SignUp 
          appearance={{
            elements: {
              formButtonPrimary: "bg-primary-600 hover:bg-primary-700 text-sm normal-case",
              card: "shadow-lg",
            },
          }}
        />
      </div>
    </div>
  );
}
