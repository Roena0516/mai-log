import V3Shell from './components/V3Shell';
import type { ReactNode } from 'react';

export default function V3Layout({ children }: { children: ReactNode }) {
  return <V3Shell>{children}</V3Shell>;
}
