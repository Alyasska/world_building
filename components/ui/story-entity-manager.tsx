"use client";

import Link from 'next/link';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { FormField } from '@/components/ui/form-field';
import { SelectField } from '@/components/ui/select-field';
import { getUiText } from '@/lib/i18n/ui';
import { normalizeText } from '@/lib/form';

const ui = getUiText();

type EntityOption = { id: string; name: string };

type StoryEntityItem = {
  id: string;
  entityType: string;
  entityId: string;
  entityRole: string;
  sequence: number | null;
  name: string;
  href: string;
};

type StoryEntityManagerProps = {
  storyId: string;
  entities: StoryEntityItem[];
  availableCharacters: EntityOption[];
  availablePlaces: EntityOption[];
  availableFactions: EntityOption[];
  loadError?: string | null;
};

const entityTypeOptions = [
  { value: '', label: ui.storyEntities.entityTypeLabel },
  { value: 'character', label: ui.storyEntities.entityTypeCharacter },
  { value: 'place', label: ui.storyEntities.entityTypePlace },
  { value: 'faction', label: ui.storyEntities.entityTypeFaction },
];

export function StoryEntityManager({ storyId, entities, availableCharacters, availablePlaces, availableFactions, loadError = null }: StoryEntityManagerProps) {
  const router = useRouter();
  const [entityType, setEntityType] = useState('');
  const [entityId, setEntityId] = useState('');
  const [role, setRole] = useState('');
  const [sequence, setSequence] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const attachedIds = new Set(entities.map((e) => e.entityId));

  function getEntityOptions() {
    const pool =
      entityType === 'character' ? availableCharacters :
      entityType === 'place' ? availablePlaces :
      entityType === 'faction' ? availableFactions : [];
    return [
      { value: '', label: ui.storyEntities.entityPlaceholder },
      ...pool.filter((e) => !attachedIds.has(e.id)).map((e) => ({ value: e.id, label: e.name })),
    ];
  }

  function handleTypeChange(value: string) {
    setEntityType(value);
    setEntityId('');
  }

  function handleAttach() {
    setError(null);
    startTransition(async () => {
      try {
        if (!entityType) throw new Error(ui.storyEntities.entityTypeRequired);
        if (!entityId) throw new Error(ui.storyEntities.entityRequired);
        const normalizedRole = normalizeText(role);
        if (!normalizedRole) throw new Error(ui.storyEntities.roleRequired);

        const seq = sequence.trim() ? parseInt(sequence.trim(), 10) : null;

        const response = await fetch('/api/story-entities', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ storyId, entityType, entityId, entityRole: normalizedRole, sequence: seq }),
        });
        const payload = await response.json().catch(() => null);
        if (!response.ok || payload?.success === false) throw new Error(payload?.error ?? ui.storyEntities.attachFailed);

        setEntityType('');
        setEntityId('');
        setRole('');
        setSequence('');
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : ui.storyEntities.attachFailed);
      }
    });
  }

  function handleRemove(id: string) {
    setError(null);
    startTransition(async () => {
      try {
        const response = await fetch(`/api/story-entities/${id}`, { method: 'DELETE' });
        const payload = await response.json().catch(() => null);
        if (!response.ok || payload?.success === false) throw new Error(payload?.error ?? ui.storyEntities.removeFailed);
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : ui.storyEntities.removeFailed);
      }
    });
  }

  return (
    <section className="panel detail-panel">
      <div className="link-section__header">
        <h2>{ui.storyEntities.title}</h2>
        <p className="muted">{ui.storyEntities.description}</p>
      </div>

      {loadError ? <p className="field__error">{loadError}</p> : null}

      {entities.length > 0 ? (
        <div className="link-list">
          {entities.map((item) => (
            <div key={item.id} className="link-item">
              <div className="link-item__content">
                <Link href={item.href} className="link-item__target">{item.name}</Link>
                <span className="link-item__relation">{item.entityRole}{item.sequence !== null ? ` · #${item.sequence}` : ''}</span>
              </div>
              <button type="button" className="tag-chip__remove" onClick={() => handleRemove(item.id)} disabled={isPending} aria-label={`${ui.storyEntities.removeLabel} ${item.name}`}>
                {ui.storyEntities.removeButton}
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="muted">{ui.storyEntities.empty}</p>
      )}

      <div className="tag-form">
        <SelectField label={ui.storyEntities.entityTypeLabel} name="story-entity-type" value={entityType} options={entityTypeOptions} onChange={handleTypeChange} />
        {entityType ? (
          <SelectField label={ui.storyEntities.entityLabel} name="story-entity-id" value={entityId} options={getEntityOptions()} onChange={setEntityId} />
        ) : null}
        <FormField label={ui.storyEntities.roleLabel} name="story-entity-role" value={role} onChange={setRole} placeholder={ui.storyEntities.rolePlaceholder} />
        <FormField label={ui.storyEntities.sequenceLabel} name="story-entity-seq" value={sequence} onChange={setSequence} />
        {error ? <p className="field__error">{error}</p> : null}
        <div className="actions-row">
          <button type="button" className="button" onClick={handleAttach} disabled={isPending}>
            {isPending ? ui.common.saving : ui.storyEntities.attachButton}
          </button>
        </div>
      </div>
    </section>
  );
}
