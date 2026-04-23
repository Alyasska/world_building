"use client";

import Link from 'next/link';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { FormField } from '@/components/ui/form-field';
import { SelectField } from '@/components/ui/select-field';
import { getUiText } from '@/lib/i18n/ui';
import { normalizeText } from '@/lib/form';

const ui = getUiText();

type CharacterOption = { id: string; name: string };

type RelationItem = {
  id: string;
  relationType: string;
  relatedCharacter: { id: string; name: string };
};

type CharacterRelationManagerProps = {
  characterId: string;
  relations: RelationItem[];
  availableCharacters: CharacterOption[];
  loadError?: string | null;
};

export function CharacterRelationManager({ characterId, relations, availableCharacters, loadError = null }: CharacterRelationManagerProps) {
  const router = useRouter();
  const [selectedCharacterId, setSelectedCharacterId] = useState('');
  const [relationType, setRelationType] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const relatedIds = new Set(relations.map((r) => r.relatedCharacter.id));
  const selectableOptions = [
    { value: '', label: ui.characterRelations.selectPlaceholder },
    ...availableCharacters.filter((c) => c.id !== characterId && !relatedIds.has(c.id)).map((c) => ({ value: c.id, label: c.name })),
  ];

  function handleAttach() {
    setError(null);
    startTransition(async () => {
      try {
        if (!selectedCharacterId) throw new Error(ui.characterRelations.targetRequired);
        const type = normalizeText(relationType);
        if (!type) throw new Error(ui.characterRelations.relationTypeRequired);

        const response = await fetch('/api/character-relations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fromCharacterId: characterId, toCharacterId: selectedCharacterId, relationType: type }),
        });
        const payload = await response.json().catch(() => null);
        if (!response.ok || payload?.success === false) throw new Error(payload?.error ?? ui.characterRelations.attachFailed);

        setSelectedCharacterId('');
        setRelationType('');
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : ui.characterRelations.attachFailed);
      }
    });
  }

  function handleRemove(id: string) {
    setError(null);
    startTransition(async () => {
      try {
        const response = await fetch(`/api/character-relations/${id}`, { method: 'DELETE' });
        const payload = await response.json().catch(() => null);
        if (!response.ok || payload?.success === false) throw new Error(payload?.error ?? ui.characterRelations.removeFailed);
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : ui.characterRelations.removeFailed);
      }
    });
  }

  return (
    <section className="panel detail-panel">
      <div className="link-section__header">
        <h2>{ui.characterRelations.title}</h2>
        <p className="muted">{ui.characterRelations.description}</p>
      </div>

      {loadError ? <p className="field__error">{loadError}</p> : null}

      {relations.length > 0 ? (
        <div className="link-list">
          {relations.map((rel) => (
            <div key={rel.id} className="link-item">
              <div className="link-item__content">
                <Link href={`/characters/${rel.relatedCharacter.id}`} className="link-item__target">{rel.relatedCharacter.name}</Link>
                <span className="link-item__relation">{rel.relationType}</span>
              </div>
              <button type="button" className="tag-chip__remove" onClick={() => handleRemove(rel.id)} disabled={isPending} aria-label={`${ui.characterRelations.removeLabel} ${rel.relatedCharacter.name}`}>
                {ui.characterRelations.removeButton}
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="muted">{ui.characterRelations.empty}</p>
      )}

      <div className="tag-form">
        <SelectField label={ui.characterRelations.selectTarget} name="char-rel-target" value={selectedCharacterId} options={selectableOptions} onChange={setSelectedCharacterId} />
        <FormField label={ui.characterRelations.relationTypeLabel} name="char-rel-type" value={relationType} onChange={setRelationType} placeholder={ui.characterRelations.relationTypePlaceholder} />
        {error ? <p className="field__error">{error}</p> : null}
        <div className="actions-row">
          <button type="button" className="button" onClick={handleAttach} disabled={isPending}>
            {isPending ? ui.common.saving : ui.characterRelations.attachButton}
          </button>
        </div>
      </div>
    </section>
  );
}
