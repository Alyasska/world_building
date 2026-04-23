"use client";

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { FormField } from '@/components/ui/form-field';
import { SelectField } from '@/components/ui/select-field';
import { TextareaField } from '@/components/ui/textarea-field';
import { getUiText } from '@/lib/i18n/ui';
import { normalizeText, toInputValue, toTextareaValue } from '@/lib/form';

const ui = getUiText();

type CharacterFormValues = {
  name: string;
  slug: string;
  summary: string;
  content: string;
  status: string;
  canonState: string;
};

type CharacterFormProps = {
  mode: 'create' | 'edit';
  endpoint: string;
  redirectTo: string;
  initialValues?: Partial<CharacterFormValues>;
};

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

export function CharacterForm({ mode, endpoint, redirectTo, initialValues }: CharacterFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<CharacterFormValues>({
    name: initialValues?.name ?? '',
    slug: initialValues?.slug ?? '',
    summary: initialValues?.summary ?? '',
    content: initialValues?.content ?? '',
    status: initialValues?.status ?? 'draft',
    canonState: initialValues?.canonState ?? 'canonical',
  });
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const normalizedName = normalizeText(form.name);
    if (!normalizedName) {
      setError(ui.characters.form.nameRequired);
      return;
    }

    const normalizedSlug = normalizeText(form.slug);
    const payloadBody: Record<string, unknown> = {
      name: normalizedName,
      summary: normalizeText(form.summary),
      content: normalizeText(form.content),
      status: form.status,
      canonState: form.canonState,
    };

    if (normalizedSlug) {
      payloadBody.slug = normalizedSlug;
    }

    setIsSaving(true);

    try {
      const response = await fetch(endpoint, {
        method: mode === 'create' ? 'POST' : 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payloadBody),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok || payload?.success === false) {
        throw new Error(payload?.error ?? ui.characters.form.saveFailed);
      }

      const characterId = payload?.data?.id;
      if (typeof characterId !== 'string' || characterId.length === 0) {
        throw new Error(ui.characters.form.invalidResponse);
      }

      router.push(`${redirectTo}/${characterId}`);
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : ui.characters.form.saveFailed);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form className="form-grid" onSubmit={handleSubmit}>
      <div className="form-panel panel">
        <FormField label={ui.characters.form.name} name="name" value={form.name} onChange={(value) => setForm((current) => ({ ...current, name: value }))} required autoComplete="off" />
        <FormField label={ui.characters.form.slug} name="slug" value={form.slug} onChange={(value) => setForm((current) => ({ ...current, slug: value }))} hint={ui.characters.form.slugHint} />
        <TextareaField label={ui.characters.form.summary} name="summary" value={form.summary} onChange={(value) => setForm((current) => ({ ...current, summary: value }))} rows={3} />
        <TextareaField
          label={ui.characters.form.content}
          name="content"
          value={toTextareaValue(form.content)}
          onChange={(value) => setForm((current) => ({ ...current, content: value }))}
          hint={ui.characters.form.contentHint}
        />
        <SelectField label={ui.characters.form.status} name="status" value={toInputValue(form.status)} options={statusOptions} onChange={(value) => setForm((current) => ({ ...current, status: value }))} />
        <SelectField label={ui.characters.form.canonState} name="canonState" value={toInputValue(form.canonState)} options={canonOptions} onChange={(value) => setForm((current) => ({ ...current, canonState: value }))} />
        {error ? <p className="field__error">{error}</p> : null}
        <div className="actions-row">
          <button type="submit" className="button" disabled={isSaving}>
            {isSaving ? ui.common.saving : mode === 'create' ? ui.characters.form.saveCreate : ui.characters.form.saveEdit}
          </button>
        </div>
      </div>
    </form>
  );
}
