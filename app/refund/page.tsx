import '@/styles/shop-base.css';
import '@/styles/legal.css';
import '@/styles/store.css';
import type { Metadata } from 'next';
import StaticHtml from '@/components/StaticHtml';
import { refundBody } from '@/content/refund';

export const metadata: Metadata = {
  title: 'Refund & returns policy',
  alternates: { canonical: '/refund' },
};
export default function Page() { return <StaticHtml html={refundBody} />; }
