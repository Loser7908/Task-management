import { metadata } from './metadata';
import ClientLayout from './layout';

export { metadata };

export default function RootLayout({ children }) {
  return <ClientLayout>{children}</ClientLayout>;
} 