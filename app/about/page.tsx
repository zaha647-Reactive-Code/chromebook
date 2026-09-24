import '@/styles/about-base.css';
import '@/styles/about-extra.css';
import '@/styles/store.css';
import type { Metadata } from 'next';
import StaticHtml from '@/components/StaticHtml';
import Effects from '@/components/Effects';
import { aboutBody } from '@/content/about';

export const metadata: Metadata = {
  title: 'About us',
  description: 'MyChromebook.pk is a venture of Tech Valley, an official Google for Education and ChromeOS partner in Pakistan.',
  alternates: { canonical: '/about' },
};
export default function AboutPage() { return <><StaticHtml html={aboutBody} /><Effects /></>; }
