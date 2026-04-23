"use client";

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { ContentField } from '@/components/ui/content-field';
import { FormField } from '@/components/ui/form-field';
import { SelectField } from '@/components/ui/select-field';
import { TextareaField } from '@/components/ui/textarea-field';
import { placeScaleValues, type PlaceScale } from '@/lib/place-scale';
import { normalizeText, toInputValue, toTextareaValue } from '@/lib/form';
import { useUiText } from '@/lib/i18n/use-ui-text';

type PlaceFormValues = {
  name: string;
  slug: string;
  summary: string;
  content: string;
  status: string;
  canonState: string;
  placeScale: PlaceScale;
  placeKind: string;
  parentPlaceId: string;
  locationText: string;
};

type PlaceParentOption = {
  id: string;
  name: string;
  placeScale: PlaceScale;
};

type PlaceFormProps = {
  mode: 'create' | 'edit';
  endpoint: string;
  redirectTo: string;
  initialValues?: Partial<PlaceFormValues>;
  parentOptions: PlaceParentOption[];
};

export function PlaceForm({ mode, endpoint, redirectTo, initialValues, parentOptions }: PlaceFormProps) {
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
  const placeScaleOptions = placeScaleValues.map((value) => ({
    label: ui.places.scaleOptions[value],
    value,
  }));
  const [form, setForm] = useState<PlaceFormValues>({
    name: initialValues?.name ?? '',
    slug: initialValues?.slug ?? '',
    summary: initialValues?.summary ?? '',
    content: initialValues?.content ?? '',
    status: initialValues?.status ?? 'draft',
    canonState: initialValues?.canonState ?? 'canonical',
    placeScale: initialValues?.placeScale ?? 'other',
    placeKind: initialValues?.placeKind ?? '',
    parentPlaceId: initialValues?.parentPlaceId ?? '',
    locationText: initialValues?.locationText ?? '',
  });
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const normalizedName = normalizeText(form.name);
    if (!normalizedName) {
      setError(ui.places.form.nameRequired);
      return;
    }

    const normalizedSlug = normalizeText(form.slug);
    const payloadBody: Record<string, unknown> = {
      name: normalizedName,
      summary: normalizeText(form.summary),
      content: normalizeText(form.content),
      status: form.status,
      canonState: form.canonState,
      placeScale: form.placeScale,
      placeKind: normalizeText(form.placeKind),
      parentPlaceId: normalizeText(form.parentPlaceId),
      locationText: normalizeText(form.locationText),
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
        throw new Error(payload?.error ?? ui.places.form.saveFailed);
      }

      const placeId = payload?.data?.id;
      if (typeof placeId !== 'string' || placeId.length === 0) {
        throw new Error(ui.places.form.invalidResponse);
      }

      router.push(`${redirectTo}/${placeId}`);
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : ui.places.form.saveFailed);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form className="form-grid" onSubmit={handleSubmit}>
      <div className="form-panel panel">
        <FormField label={ui.places.form.name} name="name" value={form.name} onChange={(value) => setForm((current) => ({ ...current, name: value }))} required autoComplete="off" />
        <FormField label={ui.places.form.slug} name="slug" value={form.slug} onChange={(value) => setForm((current) => ({ ...current, slug: value }))} hint={ui.places.form.slugHint} />
        <TextareaField label={ui.places.form.summary} name="summary" value={form.summary} onChange={(value) => setForm((current) => ({ ...current, summary: value }))} rows={3} />
        <SelectField
          label={ui.places.form.placeScale}
          name="placeScale"
          value={toInputValue(form.placeScale)}
          options={placeScaleOptions}
          onChange={(value) => setForm((current) => ({ ...current, placeScale: value as PlaceScale }))}
          hint={ui.places.form.placeScaleHint}
        />
        <SelectField
          label={ui.places.form.parentPlace}
          name="parentPlaceId"
          value={toInputValue(form.parentPlaceId)}
          options={[
            { label: ui.places.form.noParentOption, value: '' },
            ...parentOptions.map((place) => ({
              label: `${place.name} (${ui.places.scaleOptions[place.placeScale]})`,
              value: place.id,
            })),
          ]}
          onChange={(value) => setForm((current) => ({ ...current, parentPlaceId: value }))}
          hint={ui.places.form.parentPlaceHint}
        />
        <FormField label={ui.places.form.placeKind} name="placeKind" value={form.placeKind} onChange={(value) => setForm((current) => ({ ...current, placeKind: value }))} hint={ui.places.form.placeKindHint} />
        <ContentField
          label={ui.places.form.content}
          name="content"
          value={toTextareaValue(form.content)}
          onChange={(value) => setForm((current) => ({ ...current, content: value }))}
          hint={ui.places.form.contentHint}
        />
        <TextareaField label={ui.places.form.locationText} name="locationText" value={form.locationText} onChange={(value) => setForm((current) => ({ ...current, locationText: value }))} rows={3} />
        <SelectField label={ui.places.form.status} name="status" value={toInputValue(form.status)} options={statusOptions} onChange={(value) => setForm((current) => ({ ...current, status: value }))} />
        <SelectField label={ui.places.form.canonState} name="canonState" value={toInputValue(form.canonState)} options={canonOptions} onChange={(value) => setForm((current) => ({ ...current, canonState: value }))} />
        {error ? <p className="field__error">{error}</p> : null}
        <div className="actions-row">
          <button type="submit" className="button" disabled={isSaving}>
            {isSaving ? ui.common.saving : mode === 'create' ? ui.places.form.saveCreate : ui.places.form.saveEdit}
          </button>
        </div>
      </div>
    </form>
  );
}
