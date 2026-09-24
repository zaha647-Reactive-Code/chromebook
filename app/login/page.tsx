import '@/styles/shop-base.css';
import '@/styles/account.css';
import '@/styles/store.css';
import type { Metadata } from 'next';
import AuthForm from './AuthForm';

export const metadata: Metadata = { title: 'Sign in', robots: { index: false, follow: false } };
export default async function LoginPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  return <AuthForm mode={sp.reset ? 'forgot' : 'signin'} next={sp.next || '/account'} pre={{ email: sp.email }} />;
}
