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

type AssetFormValues = {
  name: string;
  slug: string;
  summary: string;
  assetKind: string;
  storageKey: string;
  fileName: string;
  mimeType: string;
  altText: string;
  sourceUri: string;
  status: string;
  canonState: string;
};

type AssetFormProps = {
  mode: 'create' | 'edit';
  endpoint: string;
  redirectTo: string;
  initialValues?: Partial<AssetFormValues>;
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

const assetKindOptions = [
  { label: ui.assets.assetKindOptions.image, value: 'image' },
  { label: ui.assets.assetKindOptions.document, value: 'document' },
  { label: ui.assets.assetKindOptions.audio, value: 'audio' },
  { label: ui.assets.assetKindOptions.video, value: 'video' },
  { label: ui.assets.assetKindOptions.archive, value: 'archive' },
  { label: ui.assets.assetKindOptions.other, value: 'other' },
];

export function AssetForm({ mode, endpoint, redirectTo, initialValues }: AssetFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<AssetFormValues>({
    name: initialValues?.name ?? '',
    slug: initialValues?.slug ?? '',
    summary: initialValues?.summary ?? '',
    assetKind: initialValues?.assetKind ?? 'other',
    storageKey: initialValues?.storageKey ?? '',
    fileName: initialValues?.fileName ?? '',
    mimeType: initialValues?.mimeType ?? '',
    altText: initialValues?.altText ?? '',
    sourceUri: initialValues?.sourceUri ?? '',
    status: initialValues?.status ?? 'draft',
    canonState: initialValues?.canonState ?? 'canonical',
  });
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const normalizedName = normalizeText(form.name);
    if (!normalizedName) { setError(ui.assets.form.nameRequired); return; }
    const storageKey = normalizeText(form.storageKey);
    if (!storageKey) { setError(ui.assets.form.storageKeyRequired); return; }
    const fileName = normalizeText(form.fileName);
    if (!fileName) { setError(ui.assets.form.fileNameRequired); return; }
    const mimeType = normalizeText(form.mimeType);
    if (!mimeType) { setError(ui.assets.form.mimeTypeRequired); return; }

    const normalizedSlug = normalizeText(form.slug);
    const payloadBody: Record<string, unknown> = {
      name: normalizedName,
      summary: normalizeText(form.summary),
      assetKind: form.assetKind,
      storageKey,
      fileName,
      mimeType,
      altText: normalizeText(form.altText),
      sourceUri: normalizeText(form.sourceUri),
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
      if (!response.ok || payload?.success === false) throw new Error(payload?.error ?? ui.assets.form.saveFailed);
      const itemId = payload?.data?.id;
      if (typeof itemId !== 'string' || itemId.length === 0) throw new Error(ui.assets.form.invalidResponse);
      router.push(`${redirectTo}/${itemId}`);
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : ui.assets.form.saveFailed);
    } finally {
      setIsSaving(false);
    }
  }

  const set = (key: keyof AssetFormValues) => (v: string) => setForm((c) => ({ ...c, [key]: v }));

  return (
    <form className="form-grid" onSubmit={handleSubmit}>
      <div className="form-panel panel">
        <FormField label={ui.assets.form.name} name="name" value={form.name} onChange={set('name')} required autoComplete="off" />
        <FormField label={ui.assets.form.slug} name="slug" value={form.slug} onChange={set('slug')} hint={ui.assets.form.slugHint} />
        <TextareaField label={ui.assets.form.summary} name="summary" value={form.summary} onChange={set('summary')} rows={2} />
        <SelectField label={ui.assets.form.assetKind} name="assetKind" value={toInputValue(form.assetKind)} options={assetKindOptions} onChange={set('assetKind')} />
        <FormField label={ui.assets.form.storageKey} name="storageKey" value={form.storageKey} onChange={set('storageKey')} hint={ui.assets.form.storageKeyHint} required />
        <FormField label={ui.assets.form.fileName} name="fileName" value={form.fileName} onChange={set('fileName')} required />
        <FormField label={ui.assets.form.mimeType} name="mimeType" value={form.mimeType} onChange={set('mimeType')} hint={ui.assets.form.mimeTypeHint} required />
        <FormField label={ui.assets.form.altText} name="altText" value={form.altText} onChange={set('altText')} />
        <FormField label={ui.assets.form.sourceUri} name="sourceUri" value={form.sourceUri} onChange={set('sourceUri')} />
        <SelectField label={ui.assets.form.status} name="status" value={toInputValue(form.status)} options={statusOptions} onChange={set('status')} />
        <SelectField label={ui.assets.form.canonState} name="canonState" value={toInputValue(form.canonState)} options={canonOptions} onChange={set('canonState')} />
        {error ? <p className="field__error">{error}</p> : null}
        <div className="actions-row">
          <button type="submit" className="button" disabled={isSaving}>
            {isSaving ? ui.common.saving : mode === 'create' ? ui.assets.form.saveCreate : ui.assets.form.saveEdit}
          </button>
        </div>
      </div>
    </form>
  );
}
