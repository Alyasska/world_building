"use client";

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useUiText } from '@/lib/i18n/use-ui-text';

type DeleteButtonProps = {
  endpoint: string;
  redirectTo: string;
  label?: string;
  confirmText?: string;
};

export function DeleteButton({ endpoint, redirectTo, label, confirmText }: DeleteButtonProps) {
  const ui = useUiText();
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const resolvedLabel = label ?? ui.common.delete;
  const resolvedConfirmText = confirmText ?? ui.common.confirmDelete;

  async function handleDelete() {
    if (!window.confirm(resolvedConfirmText)) {
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch(endpoint, { method: 'DELETE' });
      const payload = await response.json().catch(() => null);

      if (!response.ok || payload?.success === false) {
        throw new Error(payload?.error ?? ui.common.deleteFailed);
      }

      router.push(redirectTo);
      router.refresh();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : ui.common.deleteFailed);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
      <button type="button" className="button button--danger" onClick={handleDelete} disabled={isDeleting}>
        {isDeleting ? ui.common.deleting : resolvedLabel}
      </button>
      {error ? <p className="field__error">{error}</p> : null}
    </>
  );
}
