"use client";

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { ContentField } from '@/components/ui/content-field';
import { FormField } from '@/components/ui/form-field';
import { SelectField } from '@/components/ui/select-field';
import { TextareaField } from '@/components/ui/textarea-field';
import { normalizeText, toInputValue, toTextareaValue } from '@/lib/form';
import { useUiText } from '@/lib/i18n/use-ui-text';

type LoreEntryFormValues = {
  title: string;
  slug: string;
  summary: string;
  entryKind: string;
  topic: string;
  content: string;
  status: string;
  canonState: string;
};

type LoreEntryFormProps = {
  mode: 'create' | 'edit';
  endpoint: string;
  redirectTo: string;
  initialValues?: Partial<LoreEntryFormValues>;
};

export function LoreEntryForm({ mode, endpoint, redirectTo, initialValues }: LoreEntryFormProps) {
  const ui = useUiText();
  const router = useRouter();
  const statusOptions = [
    { label: ui.status.draft, value: 'draft' },
    { label: ui.status.active, value: 'active' },
    { label: ui.status.archived, value: 'archived' },
  ];
  const canonOptions = [
    { label: ui.status.canonical, value: 'canonical' },
    { label: ui.status.alternate, value: 'alternate' },
    { label: ui.status.uncertain, value: 'uncertain' },
    { label: ui.status.noncanonical, value: 'noncanonical' },
  ];
  const [form, setForm] = useState<LoreEntryFormValues>({
    title: initialValues?.title ?? '',
    slug: initialValues?.slug ?? '',
    summary: initialValues?.summary ?? '',
    entryKind: initialValues?.entryKind ?? '',
    topic: initialValues?.topic ?? '',
    content: initialValues?.content ?? '',
    status: initialValues?.status ?? 'draft',
    canonState: initialValues?.canonState ?? 'canonical',
  });
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const normalizedTitle = normalizeText(form.title);
    if (!normalizedTitle) {
      setError(ui.loreEntries.form.titleRequired);
      return;
    }

    const normalizedSlug = normalizeText(form.slug);
    const payloadBody: Record<string, unknown> = {
      title: normalizedTitle,
      summary: normalizeText(form.summary),
      entryKind: normalizeText(form.entryKind),
      topic: normalizeText(form.topic),
      content: normalizeText(form.content),
      status: form.status,
      canonState: form.canonState,
    };

    if (normalizedSlug) payloadBody.slug = normalizedSlug;

    setIsSaving(true);

    try {
      const response = await fetch(endpoint, {
        method: mode === 'create' ? 'POST' : 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payloadBody),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok || payload?.success === false) {
        throw new Error(payload?.error ?? ui.loreEntries.form.saveFailed);
      }

      const entryId = payload?.data?.id;
      if (typeof entryId !== 'string' || entryId.length === 0) {
        throw new Error(ui.loreEntries.form.invalidResponse);
      }

      router.push(`${redirectTo}/${entryId}`);
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : ui.loreEntries.form.saveFailed);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form className="form-grid" onSubmit={handleSubmit}>
      <div className="form-panel panel">
        <FormField label={ui.loreEntries.form.title} name="title" value={form.title} onChange={(v) => setForm((c) => ({ ...c, title: v }))} required autoComplete="off" />
        <FormField label={ui.loreEntries.form.slug} name="slug" value={form.slug} onChange={(v) => setForm((c) => ({ ...c, slug: v }))} hint={ui.loreEntries.form.slugHint} />
        <TextareaField label={ui.loreEntries.form.summary} name="summary" value={form.summary} onChange={(v) => setForm((c) => ({ ...c, summary: v }))} rows={3} />
        <FormField label={ui.loreEntries.form.entryKind} name="entryKind" value={form.entryKind} onChange={(v) => setForm((c) => ({ ...c, entryKind: v }))} hint={ui.loreEntries.form.entryKindHint} />
        <FormField label={ui.loreEntries.form.topic} name="topic" value={form.topic} onChange={(v) => setForm((c) => ({ ...c, topic: v }))} hint={ui.loreEntries.form.topicHint} />
        <ContentField
          label={ui.loreEntries.form.content}
          name="content"
          value={toTextareaValue(form.content)}
          onChange={(v) => setForm((c) => ({ ...c, content: v }))}
          hint={ui.loreEntries.form.contentHint}
        />
        <SelectField label={ui.loreEntries.form.status} name="status" value={toInputValue(form.status)} options={statusOptions} onChange={(v) => setForm((c) => ({ ...c, status: v }))} />
        <SelectField label={ui.loreEntries.form.canonState} name="canonState" value={toInputValue(form.canonState)} options={canonOptions} onChange={(v) => setForm((c) => ({ ...c, canonState: v }))} />
        {error ? <p className="field__error">{error}</p> : null}
        <div className="actions-row">
          <button type="submit" className="button" disabled={isSaving}>
            {isSaving ? ui.common.saving : mode === 'create' ? ui.loreEntries.form.saveCreate : ui.loreEntries.form.saveEdit}
          </button>
        </div>
      </div>
    </form>
  );
}
