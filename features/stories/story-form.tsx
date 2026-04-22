"use client";

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { FormField } from '@/components/ui/form-field';
import { SelectField } from '@/components/ui/select-field';
import { TextareaField } from '@/components/ui/textarea-field';
import type { PlaceScale } from '@/lib/place-scale';
import { getUiText } from '@/lib/i18n/ui';
import { normalizeText, toInputValue, toTextareaValue } from '@/lib/form';

const ui = getUiText();

type StoryFormValues = {
  title: string;
  slug: string;
  summary: string;
  content: string;
  status: string;
  canonState: string;
  storyKind: string;
  primaryPlaceId: string;
  startDateText: string;
  endDateText: string;
};

type StoryPlaceOption = {
  id: string;
  name: string;
  placeScale: PlaceScale;
};

type StoryFormProps = {
  mode: 'create' | 'edit';
  endpoint: string;
  redirectTo: (id: string) => string;
  initialValues?: Partial<StoryFormValues>;
  placeOptions: StoryPlaceOption[];
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

export function StoryForm({ mode, endpoint, redirectTo, initialValues, placeOptions }: StoryFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<StoryFormValues>({
    title: initialValues?.title ?? '',
    slug: initialValues?.slug ?? '',
    summary: initialValues?.summary ?? '',
    content: initialValues?.content ?? '',
    status: initialValues?.status ?? 'draft',
    canonState: initialValues?.canonState ?? 'canonical',
    storyKind: initialValues?.storyKind ?? '',
    primaryPlaceId: initialValues?.primaryPlaceId ?? '',
    startDateText: initialValues?.startDateText ?? '',
    endDateText: initialValues?.endDateText ?? '',
  });
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const normalizedTitle = normalizeText(form.title);
    if (!normalizedTitle) {
      setError(ui.stories.form.titleRequired);
      return;
    }

    const payloadBody: Record<string, unknown> = {
      title: normalizedTitle,
      summary: normalizeText(form.summary),
      content: normalizeText(form.content),
      status: form.status,
      canonState: form.canonState,
      storyKind: normalizeText(form.storyKind),
      primaryPlaceId: normalizeText(form.primaryPlaceId),
      startDateText: normalizeText(form.startDateText),
      endDateText: normalizeText(form.endDateText),
    };
    const normalizedSlug = normalizeText(form.slug);

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
        throw new Error(payload?.error ?? ui.stories.form.saveFailed);
      }

      const storyId = payload?.data?.id;
      if (typeof storyId !== 'string' || storyId.length === 0) {
        throw new Error(ui.stories.form.invalidResponse);
      }

      router.push(redirectTo(storyId));
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : ui.stories.form.saveFailed);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form className="form-grid" onSubmit={handleSubmit}>
      <div className="form-panel panel">
        <FormField label={ui.stories.form.title} name="title" value={form.title} onChange={(value) => setForm((current) => ({ ...current, title: value }))} required autoComplete="off" />
        <FormField label={ui.stories.form.slug} name="slug" value={form.slug} onChange={(value) => setForm((current) => ({ ...current, slug: value }))} hint={ui.stories.form.slugHint} />
        <TextareaField label={ui.stories.form.summary} name="summary" value={form.summary} onChange={(value) => setForm((current) => ({ ...current, summary: value }))} rows={3} />
        <FormField label={ui.stories.form.storyKind} name="storyKind" value={form.storyKind} onChange={(value) => setForm((current) => ({ ...current, storyKind: value }))} hint={ui.stories.form.storyKindHint} />
        <SelectField
          label={ui.stories.form.primaryPlace}
          name="primaryPlaceId"
          value={toInputValue(form.primaryPlaceId)}
          options={[
            { label: ui.stories.form.noPrimaryPlaceOption, value: '' },
            ...placeOptions.map((place) => ({
              label: `${place.name} (${ui.places.scaleOptions[place.placeScale]})`,
              value: place.id,
            })),
          ]}
          onChange={(value) => setForm((current) => ({ ...current, primaryPlaceId: value }))}
          hint={ui.stories.form.primaryPlaceHint}
        />
        <FormField label={ui.stories.form.startDateText} name="startDateText" value={form.startDateText} onChange={(value) => setForm((current) => ({ ...current, startDateText: value }))} hint={ui.stories.form.startDateHint} />
        <FormField label={ui.stories.form.endDateText} name="endDateText" value={form.endDateText} onChange={(value) => setForm((current) => ({ ...current, endDateText: value }))} hint={ui.stories.form.endDateHint} />
        <TextareaField label={ui.stories.form.content} name="content" value={toTextareaValue(form.content)} onChange={(value) => setForm((current) => ({ ...current, content: value }))} hint={ui.stories.form.contentHint} />
        <SelectField label={ui.stories.form.status} name="status" value={toInputValue(form.status)} options={statusOptions} onChange={(value) => setForm((current) => ({ ...current, status: value }))} />
        <SelectField label={ui.stories.form.canonState} name="canonState" value={toInputValue(form.canonState)} options={canonOptions} onChange={(value) => setForm((current) => ({ ...current, canonState: value }))} />
        {error ? <p className="field__error">{error}</p> : null}
        <div className="actions-row">
          <button type="submit" className="button" disabled={isSaving}>
            {isSaving ? ui.common.saving : mode === 'create' ? ui.stories.form.saveCreate : ui.stories.form.saveEdit}
          </button>
        </div>
      </div>
    </form>
  );
}
