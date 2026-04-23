"use client";

import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { FormField } from '@/components/ui/form-field';
import { SelectField } from '@/components/ui/select-field';
import { getUiText } from '@/lib/i18n/ui';
import { normalizeText } from '@/lib/form';

const ui = getUiText();

type TagOption = {
  id: string;
  name: string;
  slug: string;
  color: string | null;
};

type EntityTagRecord = {
  id: string;
  tagId: string;
  tag: TagOption;
};

type TagManagerProps = {
  entityId: string;
  entityType: 'character' | 'place' | 'faction' | 'lore-entry' | 'rule-system';
  assignedTags: EntityTagRecord[];
  availableTags: TagOption[];
  loadError?: string | null;
};

export function TagManager({ entityId, entityType, assignedTags, availableTags, loadError = null }: TagManagerProps) {
  const router = useRouter();
  const [selectedTagId, setSelectedTagId] = useState('');
  const [newTagName, setNewTagName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const assignedTagIds = useMemo(() => new Set(assignedTags.map((tag) => tag.tagId)), [assignedTags]);
  const selectableTags = useMemo(
    () => availableTags.filter((tag) => !assignedTagIds.has(tag.id)),
    [availableTags, assignedTagIds]
  );

  const tagOptions = [
    { value: '', label: ui.tags.selectPlaceholder },
    ...selectableTags.map((tag) => ({ value: tag.id, label: tag.name })),
  ];

  async function attachTag(tagId: string) {
    const response = await fetch('/api/entity-tags', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        entityType,
        entityId,
        tagId,
        status: 'active',
      }),
    });

    const payload = await response.json().catch(() => null);

    if (!response.ok || payload?.success === false) {
      throw new Error(payload?.error ?? ui.tags.attachFailed);
    }
  }

  async function ensureTagId(): Promise<string> {
    if (selectedTagId) {
      return selectedTagId;
    }

    const normalizedName = normalizeText(newTagName);

    if (!normalizedName) {
      throw new Error(ui.tags.nameRequired);
    }

    const existing = availableTags.find((tag) => tag.name.trim().toLowerCase() === normalizedName.toLowerCase());

    if (existing) {
      return existing.id;
    }

    const response = await fetch('/api/tags', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: normalizedName,
        status: 'active',
      }),
    });

    const payload = await response.json().catch(() => null);

    if (!response.ok || payload?.success === false) {
      throw new Error(payload?.error ?? ui.tags.createFailed);
    }

    const createdTagId = payload?.data?.id;

    if (typeof createdTagId !== 'string' || createdTagId.length === 0) {
      throw new Error(ui.tags.invalidResponse);
    }

    return createdTagId;
  }

  function handleAttach() {
    setError(null);

    startTransition(async () => {
      try {
        const tagId = await ensureTagId();

        if (assignedTagIds.has(tagId)) {
          throw new Error(ui.tags.alreadyAttached);
        }

        await attachTag(tagId);
        setSelectedTagId('');
        setNewTagName('');
        router.refresh();
      } catch (attachError) {
        setError(attachError instanceof Error ? attachError.message : ui.tags.attachFailed);
      }
    });
  }

  function handleRemove(entityTagId: string) {
    setError(null);

    startTransition(async () => {
      try {
        const response = await fetch(`/api/entity-tags/${entityTagId}`, { method: 'DELETE' });
        const payload = await response.json().catch(() => null);

        if (!response.ok || payload?.success === false) {
          throw new Error(payload?.error ?? ui.tags.removeFailed);
        }

        router.refresh();
      } catch (removeError) {
        setError(removeError instanceof Error ? removeError.message : ui.tags.removeFailed);
      }
    });
  }

  return (
    <section className="panel detail-panel">
      <div className="tag-section__header">
        <h2>{ui.tags.title}</h2>
        <p className="muted">{ui.tags.description}</p>
      </div>

      {loadError ? <p className="field__error">{loadError}</p> : null}

      {assignedTags.length > 0 ? (
        <div className="tag-list">
          {assignedTags.map((entityTag) => (
            <div key={entityTag.id} className="tag-chip">
              <span className="tag-chip__label">
                {entityTag.tag.color ? <span className="tag-chip__swatch" style={{ backgroundColor: entityTag.tag.color }} aria-hidden="true" /> : null}
                {entityTag.tag.name}
              </span>
              <button
                type="button"
                className="tag-chip__remove"
                onClick={() => handleRemove(entityTag.id)}
                disabled={isPending}
                aria-label={`${ui.tags.removeLabel} ${entityTag.tag.name}`}
              >
                {ui.tags.removeButton}
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="muted">{ui.tags.empty}</p>
      )}

      <div className="tag-form">
        <SelectField
          label={ui.tags.attachExisting}
          name={`${entityType}-tag-select`}
          value={selectedTagId}
          options={tagOptions}
          onChange={(value) => setSelectedTagId(value)}
        />
        <FormField
          label={ui.tags.createNew}
          name={`${entityType}-tag-name`}
          value={newTagName}
          onChange={setNewTagName}
          placeholder={ui.tags.namePlaceholder}
        />
        {error ? <p className="field__error">{error}</p> : null}
        <div className="actions-row">
          <button type="button" className="button" onClick={handleAttach} disabled={isPending}>
            {isPending ? ui.common.saving : ui.tags.attachButton}
          </button>
        </div>
      </div>
    </section>
  );
}
