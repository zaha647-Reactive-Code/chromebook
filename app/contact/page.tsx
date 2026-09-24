import '@/styles/about-base.css';
import '@/styles/contact.css';
import '@/styles/store.css';
import type { Metadata } from 'next';
import ContactView from './ContactView';
import Effects from '@/components/Effects';
import { getSettings } from '@/lib/catalog';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Get in touch with MyChromebook.pk for product questions, bulk school orders or to book a demo.',
  alternates: { canonical: '/contact' },
};
export default async function ContactPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const s = await getSettings();
  return <><ContactView supportHours={s.supportHours} email={s.email} phoneDisplay={s.phoneDisplay} demo={sp.topic === 'demo'} /><Effects /></>;
}
