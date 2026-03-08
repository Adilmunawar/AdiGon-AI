
import AuthForm from "@/components/AuthForm";

const AuthPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(168_80%_38%/0.04),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,hsl(174_65%_43%/0.03),transparent_50%)]" />
      </div>
      <div className="w-full max-w-md animate-fade-in-up">
        <AuthForm />
      </div>
    </div>
  );
};

export default AuthPage;
