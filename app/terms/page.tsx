import '@/styles/shop-base.css';
import '@/styles/legal.css';
import '@/styles/store.css';
import type { Metadata } from 'next';
import StaticHtml from '@/components/StaticHtml';
import { termsBody } from '@/content/terms';

export const metadata: Metadata = {
  title: 'Terms & conditions',
  alternates: { canonical: '/terms' },
};
export default function Page() { return <StaticHtml html={termsBody} />; }
