"use client";

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { FormField } from '@/components/ui/form-field';
import { SelectField } from '@/components/ui/select-field';
import { TextareaField } from '@/components/ui/textarea-field';
import { normalizeText, toInputValue, toTextareaValue } from '@/lib/form';

type PlaceFormValues = {
  name: string;
  slug: string;
  summary: string;
  content: string;
  status: string;
  canonState: string;
  placeKind: string;
  locationText: string;
};

type PlaceFormProps = {
  mode: 'create' | 'edit';
  endpoint: string;
  redirectTo: (id: string) => string;
  initialValues?: Partial<PlaceFormValues>;
};

const statusOptions = [
  { label: 'Draft', value: 'draft' },
  { label: 'Active', value: 'active' },
  { label: 'Archived', value: 'archived' },
];

const canonOptions = [
  { label: 'Canonical', value: 'canonical' },
  { label: 'Alternate', value: 'alternate' },
  { label: 'Uncertain', value: 'uncertain' },
  { label: 'Noncanonical', value: 'noncanonical' },
];

export function PlaceForm({ mode, endpoint, redirectTo, initialValues }: PlaceFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<PlaceFormValues>({
    name: initialValues?.name ?? '',
    slug: initialValues?.slug ?? '',
    summary: initialValues?.summary ?? '',
    content: initialValues?.content ?? '',
    status: initialValues?.status ?? 'draft',
    canonState: initialValues?.canonState ?? 'canonical',
    placeKind: initialValues?.placeKind ?? '',
    locationText: initialValues?.locationText ?? '',
  });
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (form.name.trim().length === 0) {
      setError('Name is required.');
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch(endpoint, {
        method: mode === 'create' ? 'POST' : 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: normalizeText(form.name),
          slug: normalizeText(form.slug),
          summary: normalizeText(form.summary),
          content: normalizeText(form.content),
          status: form.status,
          canonState: form.canonState,
          placeKind: normalizeText(form.placeKind),
          locationText: normalizeText(form.locationText),
        }),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(payload?.error ?? 'Unable to save place');
      }

      router.push(redirectTo(payload.data.id));
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unable to save place');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form className="form-grid" onSubmit={handleSubmit}>
      <div className="form-panel panel">
        <FormField label="Name" name="name" value={form.name} onChange={(value) => setForm((current) => ({ ...current, name: value }))} required autoComplete="off" />
        <FormField label="Slug" name="slug" value={form.slug} onChange={(value) => setForm((current) => ({ ...current, slug: value }))} hint="Optional. Leave blank to generate from the name." />
        <TextareaField label="Summary" name="summary" value={form.summary} onChange={(value) => setForm((current) => ({ ...current, summary: value }))} rows={3} />
        <TextareaField
          label="Content"
          name="content"
          value={toTextareaValue(form.content)}
          onChange={(value) => setForm((current) => ({ ...current, content: value }))}
          hint="Plain text or JSON string is acceptable for now."
        />
        <FormField label="Place kind" name="placeKind" value={form.placeKind} onChange={(value) => setForm((current) => ({ ...current, placeKind: value }))} hint="City, region, room, landmark, and similar labels." />
        <TextareaField label="Location text" name="locationText" value={form.locationText} onChange={(value) => setForm((current) => ({ ...current, locationText: value }))} rows={3} />
        <SelectField label="Status" name="status" value={toInputValue(form.status)} options={statusOptions} onChange={(value) => setForm((current) => ({ ...current, status: value }))} />
        <SelectField label="Canon state" name="canonState" value={toInputValue(form.canonState)} options={canonOptions} onChange={(value) => setForm((current) => ({ ...current, canonState: value }))} />
        {error ? <p className="field__error">{error}</p> : null}
        <div className="actions-row">
          <button type="submit" className="button" disabled={isSaving}>
            {isSaving ? 'Saving…' : mode === 'create' ? 'Create Place' : 'Save Place'}
          </button>
        </div>
      </div>
    </form>
  );
}
