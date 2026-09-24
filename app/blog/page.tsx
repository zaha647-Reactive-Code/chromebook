import '@/styles/blog-base.css';
import '@/styles/store.css';
import type { Metadata } from 'next';
import StaticHtml from '@/components/StaticHtml';
import Effects from '@/components/Effects';
import { blogBody } from '@/content/blog';

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Guides, classroom stories and buying tips — everything about Chromebooks in Pakistan.',
  alternates: { canonical: '/blog' },
};
export default function BlogPage() { return <><StaticHtml html={blogBody} /><Effects /></>; }
