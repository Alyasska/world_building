"use client";

import Link from 'next/link';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { FormField } from '@/components/ui/form-field';
import { SelectField } from '@/components/ui/select-field';
import { getUiText } from '@/lib/i18n/ui';
import { normalizeText } from '@/lib/form';

const ui = getUiText();

type PlaceOption = { id: string; name: string };

type ConnectionItem = {
  id: string;
  connectionType: string;
  isBidirectional: boolean;
  travelTimeText: string | null;
  relatedPlace: { id: string; name: string };
};

type PlaceConnectionManagerProps = {
  placeId: string;
  connections: ConnectionItem[];
  availablePlaces: PlaceOption[];
  loadError?: string | null;
};

export function PlaceConnectionManager({ placeId, connections, availablePlaces, loadError = null }: PlaceConnectionManagerProps) {
  const router = useRouter();
  const [selectedPlaceId, setSelectedPlaceId] = useState('');
  const [connectionType, setConnectionType] = useState('');
  const [travelTimeText, setTravelTimeText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const connectedIds = new Set(connections.map((c) => c.relatedPlace.id));
  const selectableOptions = [
    { value: '', label: ui.placeConnections.selectPlaceholder },
    ...availablePlaces.filter((p) => p.id !== placeId && !connectedIds.has(p.id)).map((p) => ({ value: p.id, label: p.name })),
  ];

  function handleAttach() {
    setError(null);
    startTransition(async () => {
      try {
        if (!selectedPlaceId) throw new Error(ui.placeConnections.targetRequired);
        const type = normalizeText(connectionType);
        if (!type) throw new Error(ui.placeConnections.connectionTypeRequired);

        const response = await fetch('/api/place-connections', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fromPlaceId: placeId, toPlaceId: selectedPlaceId, connectionType: type, isBidirectional: true, travelTimeText: normalizeText(travelTimeText) }),
        });
        const payload = await response.json().catch(() => null);
        if (!response.ok || payload?.success === false) throw new Error(payload?.error ?? ui.placeConnections.attachFailed);

        setSelectedPlaceId('');
        setConnectionType('');
        setTravelTimeText('');
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : ui.placeConnections.attachFailed);
      }
    });
  }

  function handleRemove(id: string) {
    setError(null);
    startTransition(async () => {
      try {
        const response = await fetch(`/api/place-connections/${id}`, { method: 'DELETE' });
        const payload = await response.json().catch(() => null);
        if (!response.ok || payload?.success === false) throw new Error(payload?.error ?? ui.placeConnections.removeFailed);
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : ui.placeConnections.removeFailed);
      }
    });
  }

  return (
    <section className="panel detail-panel">
      <div className="link-section__header">
        <h2>{ui.placeConnections.title}</h2>
        <p className="muted">{ui.placeConnections.description}</p>
      </div>

      {loadError ? <p className="field__error">{loadError}</p> : null}

      {connections.length > 0 ? (
        <div className="link-list">
          {connections.map((conn) => (
            <div key={conn.id} className="link-item">
              <div className="link-item__content">
                <Link href={`/places/${conn.relatedPlace.id}`} className="link-item__target">{conn.relatedPlace.name}</Link>
                <span className="link-item__relation">{conn.connectionType}{conn.travelTimeText ? ` · ${conn.travelTimeText}` : ''}{conn.isBidirectional ? '' : ' →'}</span>
              </div>
              <button type="button" className="tag-chip__remove" onClick={() => handleRemove(conn.id)} disabled={isPending} aria-label={`${ui.placeConnections.removeLabel} ${conn.relatedPlace.name}`}>
                {ui.placeConnections.removeButton}
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="muted">{ui.placeConnections.empty}</p>
      )}

      <div className="tag-form">
        <SelectField label={ui.placeConnections.selectTarget} name="place-conn-target" value={selectedPlaceId} options={selectableOptions} onChange={setSelectedPlaceId} />
        <FormField label={ui.placeConnections.connectionTypeLabel} name="place-conn-type" value={connectionType} onChange={setConnectionType} placeholder={ui.placeConnections.connectionTypePlaceholder} />
        <FormField label={ui.placeConnections.travelTimeLabel} name="place-conn-travel" value={travelTimeText} onChange={setTravelTimeText} placeholder={ui.placeConnections.travelTimePlaceholder} />
        {error ? <p className="field__error">{error}</p> : null}
        <div className="actions-row">
          <button type="button" className="button" onClick={handleAttach} disabled={isPending}>
            {isPending ? ui.common.saving : ui.placeConnections.attachButton}
          </button>
        </div>
      </div>
    </section>
  );
}
