"use client";

import Link from 'next/link';
import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { FormField } from '@/components/ui/form-field';
import { SelectField } from '@/components/ui/select-field';
import { getUiText } from '@/lib/i18n/ui';
import { normalizeText } from '@/lib/form';

const ui = getUiText();

type LinkableEntity = {
  id: string;
  name: string;
  slug: string;
};

type RelatedLink = {
  id: string;
  relatedEntityId: string;
  relatedEntityName: string;
  relatedEntityHref: string;
  relationType: string;
};

type EntityLinkManagerProps = {
  entityId: string;
  entityType: 'character' | 'place' | 'faction';
  targetEntityType: 'character' | 'place' | 'faction';
  relatedLinks: RelatedLink[];
  availableEntities: LinkableEntity[];
  loadError?: string | null;
};

export function EntityLinkManager({
  entityId,
  entityType,
  targetEntityType,
  relatedLinks,
  availableEntities,
  loadError = null,
}: EntityLinkManagerProps) {
  const router = useRouter();
  const [selectedEntityId, setSelectedEntityId] = useState('');
  const [relationType, setRelationType] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const linkedEntityIds = useMemo(() => new Set(relatedLinks.map((link) => link.relatedEntityId)), [relatedLinks]);
  const selectableEntities = useMemo(
    () => availableEntities.filter((entity) => !linkedEntityIds.has(entity.id)),
    [availableEntities, linkedEntityIds]
  );

  const entityOptions = [
    { value: '', label: ui.links.selectPlaceholder },
    ...selectableEntities.map((entity) => ({ value: entity.id, label: entity.name })),
  ];

  function handleAttach() {
    setError(null);

    startTransition(async () => {
      try {
        if (!selectedEntityId) {
          throw new Error(ui.links.entityRequired);
        }

        const normalizedRelationType = normalizeText(relationType);

        if (!normalizedRelationType) {
          throw new Error(ui.links.relationRequired);
        }

        const response = await fetch('/api/entity-links', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sourceEntityType: entityType,
            sourceEntityId: entityId,
            targetEntityType,
            targetEntityId: selectedEntityId,
            relationType: normalizedRelationType,
            isBidirectional: true,
            status: 'active',
          }),
        });

        const payload = await response.json().catch(() => null);

        if (!response.ok || payload?.success === false) {
          throw new Error(payload?.error ?? ui.links.attachFailed);
        }

        setSelectedEntityId('');
        setRelationType('');
        router.refresh();
      } catch (attachError) {
        setError(attachError instanceof Error ? attachError.message : ui.links.attachFailed);
      }
    });
  }

  function handleRemove(linkId: string) {
    setError(null);

    startTransition(async () => {
      try {
        const response = await fetch(`/api/entity-links/${linkId}`, { method: 'DELETE' });
        const payload = await response.json().catch(() => null);

        if (!response.ok || payload?.success === false) {
          throw new Error(payload?.error ?? ui.links.removeFailed);
        }

        router.refresh();
      } catch (removeError) {
        setError(removeError instanceof Error ? removeError.message : ui.links.removeFailed);
      }
    });
  }

  return (
    <section className="panel detail-panel">
      <div className="link-section__header">
        <h2>{ui.links.title}</h2>
        <p className="muted">{ui.links.description}</p>
      </div>

      {loadError ? <p className="field__error">{loadError}</p> : null}

      {relatedLinks.length > 0 ? (
        <div className="link-list">
          {relatedLinks.map((link) => (
            <div key={link.id} className="link-item">
              <div className="link-item__content">
                <Link href={link.relatedEntityHref} className="link-item__target">
                  {link.relatedEntityName}
                </Link>
                <span className="link-item__relation">{link.relationType}</span>
              </div>
              <button
                type="button"
                className="tag-chip__remove"
                onClick={() => handleRemove(link.id)}
                disabled={isPending}
                aria-label={`${ui.links.removeLabel} ${link.relatedEntityName}`}
              >
                {ui.links.removeButton}
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="muted">{ui.links.empty}</p>
      )}

      <div className="tag-form">
        <SelectField
          label={ui.links.selectTarget}
          name={`${entityType}-link-target`}
          value={selectedEntityId}
          options={entityOptions}
          onChange={(value) => setSelectedEntityId(value)}
        />
        <FormField
          label={ui.links.relationLabel}
          name={`${entityType}-relation-type`}
          value={relationType}
          onChange={setRelationType}
          placeholder={ui.links.relationPlaceholder}
        />
        {error ? <p className="field__error">{error}</p> : null}
        <div className="actions-row">
          <button type="button" className="button" onClick={handleAttach} disabled={isPending}>
            {isPending ? ui.common.saving : ui.links.attachButton}
          </button>
        </div>
      </div>
    </section>
  );
}
