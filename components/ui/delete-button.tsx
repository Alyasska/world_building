"use client";

import { useRouter } from 'next/navigation';
import { useState } from 'react';

type DeleteButtonProps = {
  endpoint: string;
  redirectTo: string;
  label?: string;
  confirmText?: string;
};

export function DeleteButton({ endpoint, redirectTo, label = 'Delete', confirmText = 'Delete this item?' }: DeleteButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    if (!window.confirm(confirmText)) {
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch(endpoint, { method: 'DELETE' });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error ?? 'Delete failed');
      }

      router.push(redirectTo);
      router.refresh();
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <button type="button" className="button button--danger" onClick={handleDelete} disabled={isDeleting}>
      {isDeleting ? 'Deleting…' : label}
    </button>
  );
}
