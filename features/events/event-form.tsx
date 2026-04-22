"use client";

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { FormField } from '@/components/ui/form-field';
import { SelectField } from '@/components/ui/select-field';
import { TextareaField } from '@/components/ui/textarea-field';
import { eventDatePrecisionValues, type EventDatePrecision } from '@/lib/event-date-precision';
import type { PlaceScale } from '@/lib/place-scale';
import { getUiText } from '@/lib/i18n/ui';
import { normalizeText, toDateInputValue, toInputValue, toTextareaValue } from '@/lib/form';

const ui = getUiText();

type EventFormValues = {
  title: string;
  slug: string;
  summary: string;
  content: string;
  status: string;
  canonState: string;
  storyId: string;
  placeId: string;
  eventDateText: string;
  startAt: string;
  endAt: string;
  datePrecision: EventDatePrecision;
};

type EventPlaceOption = {
  id: string;
  name: string;
  placeScale: PlaceScale;
};

type EventStoryOption = {
  id: string;
  title: string;
};

type EventFormProps = {
  mode: 'create' | 'edit';
  endpoint: string;
  redirectTo: (id: string) => string;
  initialValues?: Partial<EventFormValues>;
  placeOptions: EventPlaceOption[];
  storyOptions: EventStoryOption[];
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

const datePrecisionOptions = eventDatePrecisionValues.map((value) => ({
  label: ui.events.datePrecisionOptions[value],
  value,
}));

export function EventForm({ mode, endpoint, redirectTo, initialValues, placeOptions, storyOptions }: EventFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<EventFormValues>({
    title: initialValues?.title ?? '',
    slug: initialValues?.slug ?? '',
    summary: initialValues?.summary ?? '',
    content: initialValues?.content ?? '',
    status: initialValues?.status ?? 'draft',
    canonState: initialValues?.canonState ?? 'canonical',
    storyId: initialValues?.storyId ?? '',
    placeId: initialValues?.placeId ?? '',
    eventDateText: initialValues?.eventDateText ?? '',
    startAt: initialValues?.startAt ?? '',
    endAt: initialValues?.endAt ?? '',
    datePrecision: initialValues?.datePrecision ?? 'unknown',
  });
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const normalizedTitle = normalizeText(form.title);
    if (!normalizedTitle) {
      setError(ui.events.form.titleRequired);
      return;
    }

    const normalizedPlaceId = normalizeText(form.placeId);
    if (!normalizedPlaceId) {
      setError(ui.events.form.placeRequired);
      return;
    }

    const payloadBody: Record<string, unknown> = {
      title: normalizedTitle,
      summary: normalizeText(form.summary),
      content: normalizeText(form.content),
      status: form.status,
      canonState: form.canonState,
      storyId: normalizeText(form.storyId),
      placeId: normalizedPlaceId,
      eventDateText: normalizeText(form.eventDateText),
      startAt: normalizeText(form.startAt),
      endAt: normalizeText(form.endAt),
      datePrecision: form.datePrecision,
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
        throw new Error(payload?.error ?? ui.events.form.saveFailed);
      }

      const eventId = payload?.data?.id;
      if (typeof eventId !== 'string' || eventId.length === 0) {
        throw new Error(ui.events.form.invalidResponse);
      }

      router.push(redirectTo(eventId));
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : ui.events.form.saveFailed);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form className="form-grid" onSubmit={handleSubmit}>
      <div className="form-panel panel">
        <FormField label={ui.events.form.title} name="title" value={form.title} onChange={(value) => setForm((current) => ({ ...current, title: value }))} required autoComplete="off" />
        <FormField label={ui.events.form.slug} name="slug" value={form.slug} onChange={(value) => setForm((current) => ({ ...current, slug: value }))} hint={ui.events.form.slugHint} />
        <TextareaField label={ui.events.form.summary} name="summary" value={form.summary} onChange={(value) => setForm((current) => ({ ...current, summary: value }))} rows={3} />
        <SelectField
          label={ui.events.form.place}
          name="placeId"
          value={toInputValue(form.placeId)}
          options={[
            { label: ui.events.form.noPlaceOption, value: '' },
            ...placeOptions.map((place) => ({
              label: `${place.name} (${ui.places.scaleOptions[place.placeScale]})`,
              value: place.id,
            })),
          ]}
          onChange={(value) => setForm((current) => ({ ...current, placeId: value }))}
          hint={ui.events.form.placeHint}
        />
        <SelectField
          label={ui.events.form.story}
          name="storyId"
          value={toInputValue(form.storyId)}
          options={[
            { label: ui.events.form.noStoryOption, value: '' },
            ...storyOptions.map((story) => ({
              label: story.title,
              value: story.id,
            })),
          ]}
          onChange={(value) => setForm((current) => ({ ...current, storyId: value }))}
          hint={ui.events.form.storyHint}
        />
        <FormField label={ui.events.form.eventDateText} name="eventDateText" value={form.eventDateText} onChange={(value) => setForm((current) => ({ ...current, eventDateText: value }))} hint={ui.events.form.eventDateHint} />
        <FormField label={ui.events.form.startAt} name="startAt" type="date" value={form.startAt} onChange={(value) => setForm((current) => ({ ...current, startAt: value }))} />
        <FormField label={ui.events.form.endAt} name="endAt" type="date" value={form.endAt} onChange={(value) => setForm((current) => ({ ...current, endAt: value }))} />
        <SelectField
          label={ui.events.form.datePrecision}
          name="datePrecision"
          value={toInputValue(form.datePrecision)}
          options={datePrecisionOptions}
          onChange={(value) => setForm((current) => ({ ...current, datePrecision: value as EventDatePrecision }))}
          hint={ui.events.form.datePrecisionHint}
        />
        <TextareaField label={ui.events.form.content} name="content" value={toTextareaValue(form.content)} onChange={(value) => setForm((current) => ({ ...current, content: value }))} hint={ui.events.form.contentHint} />
        <SelectField label={ui.events.form.status} name="status" value={toInputValue(form.status)} options={statusOptions} onChange={(value) => setForm((current) => ({ ...current, status: value }))} />
        <SelectField label={ui.events.form.canonState} name="canonState" value={toInputValue(form.canonState)} options={canonOptions} onChange={(value) => setForm((current) => ({ ...current, canonState: value }))} />
        {error ? <p className="field__error">{error}</p> : null}
        <div className="actions-row">
          <button type="submit" className="button" disabled={isSaving}>
            {isSaving ? ui.common.saving : mode === 'create' ? ui.events.form.saveCreate : ui.events.form.saveEdit}
          </button>
        </div>
      </div>
    </form>
  );
}
