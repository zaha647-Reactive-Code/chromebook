import '@/styles/shop-base.css';
import '@/styles/account.css';
import '@/styles/admin.css';
import '@/styles/store.css';
import type { Metadata } from 'next';
import AdminView from './AdminView';

export const metadata: Metadata = { title: 'Store admin', robots: { index: false, follow: false } };
export default function AdminPage() { return <AdminView />; }
