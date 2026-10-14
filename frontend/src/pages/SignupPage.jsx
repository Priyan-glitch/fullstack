import { SignUp } from '@clerk/react';
import AuthLayout from '../components/auth/AuthLayout';
import { AUTH_ROUTES } from '../config/clerk';

export default function SignupPage() {
  return (
    <AuthLayout>
      <SignUp
        routing="path"
        path={AUTH_ROUTES.signUp}
        signInUrl={AUTH_ROUTES.signIn}
      />
    </AuthLayout>
  );
}
