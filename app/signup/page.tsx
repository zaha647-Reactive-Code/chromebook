import '@/styles/shop-base.css';
import '@/styles/account.css';
import '@/styles/store.css';
import type { Metadata } from 'next';
import AuthForm from '@/app/login/AuthForm';

export const metadata: Metadata = { title: 'Create account', robots: { index: false, follow: false } };
export default async function SignupPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  return <AuthForm mode="signup" next={sp.next || '/account'} pre={{ name: sp.name, email: sp.email, phone: sp.phone }} />;
}
