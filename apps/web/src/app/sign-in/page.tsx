import type { Metadata } from 'next';
import { Suspense } from 'react';

import { SignInForm } from '@/components/sign-in-form';
import { Spinner } from '@/components/ui';

export const metadata: Metadata = { title: 'Sign in' };

export default function SignInPage() {
  // useSearchParams needs a Suspense boundary for a static export.
  return (
    <Suspense fallback={<Spinner />}>
      <SignInForm />
    </Suspense>
  );
}
