import '@/styles/shop-base.css';
import '@/styles/account.css';
import '@/styles/store.css';
import type { Metadata } from 'next';
import AccountView from './AccountView';

export const metadata: Metadata = { title: 'My account', robots: { index: false, follow: false } };
export default function AccountPage() { return <AccountView />; }
