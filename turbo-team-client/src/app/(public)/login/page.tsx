'use client';

import Link from 'next/link';

import { Button } from '@/components/ui/button';

export default function LoginPage() {
  return (
    <div className="w-full max-w-md">
      <Link href="/stats">
        <Button className="w-full">Stats</Button>
      </Link>
    </div>
  );
}
