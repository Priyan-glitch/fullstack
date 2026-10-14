import { SignIn } from '@clerk/react';
import AuthLayout from '../components/auth/AuthLayout';
import { AUTH_ROUTES } from '../config/clerk';

export default function LoginPage() {
  return (
    <AuthLayout>
      <SignIn
        routing="path"
        path={AUTH_ROUTES.signIn}
        signUpUrl={AUTH_ROUTES.signUp}
      />
    </AuthLayout>
  );
}
