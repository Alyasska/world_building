"use client";

import Link from 'next/link';
import { useEffect, useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { FormField } from '@/components/ui/form-field';
import { SelectField } from '@/components/ui/select-field';
import { getUiText } from '@/lib/i18n/ui';
import { normalizeText } from '@/lib/form';

const ui = getUiText();

type ParticipantCharacter = {
  id: string;
  name: string;
  slug: string;
};

type EventParticipantRecord = {
  id: string;
  participantId: string;
  participantType: string;
  sequence: number | null;
  role: string | null;
  character: ParticipantCharacter;
};

type EventParticipantManagerProps = {
  eventId: string;
  participants: EventParticipantRecord[];
  availableCharacters: ParticipantCharacter[];
  loadError?: string | null;
};

export function EventParticipantManager({
  eventId,
  participants,
  availableCharacters,
  loadError = null,
}: EventParticipantManagerProps) {
  const router = useRouter();
  const [selectedCharacterId, setSelectedCharacterId] = useState('');
  const [roleInput, setRoleInput] = useState('');
  const [editRoles, setEditRoles] = useState<Record<string, string>>({});
  const [editSequences, setEditSequences] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setEditRoles(Object.fromEntries(participants.map((participant) => [participant.id, participant.role ?? ''])));
    setEditSequences(
      Object.fromEntries(
        participants.map((participant, index) => [participant.id, String(participant.sequence ?? index + 1)])
      )
    );
  }, [participants]);

  const attachedCharacterIds = useMemo(
    () => new Set(participants.map((participant) => participant.participantId)),
    [participants]
  );

  const selectableCharacters = useMemo(
    () => availableCharacters.filter((character) => !attachedCharacterIds.has(character.id)),
    [availableCharacters, attachedCharacterIds]
  );

  const characterOptions = [
    { value: '', label: ui.events.participants.selectCharacterPlaceholder },
    ...selectableCharacters.map((character) => ({
      value: character.id,
      label: character.name,
    })),
  ];

  function handleAttach() {
    setError(null);

    startTransition(async () => {
      try {
        if (!selectedCharacterId) {
          throw new Error(ui.events.participants.characterRequired);
        }

        const response = await fetch(`/api/events/${eventId}/participants`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            participantId: selectedCharacterId,
            participantType: 'character',
            role: normalizeText(roleInput),
          }),
        });

        const payload = await response.json().catch(() => null);

        if (!response.ok || payload?.success === false) {
          throw new Error(payload?.error ?? ui.events.participants.attachFailed);
        }

        setSelectedCharacterId('');
        setRoleInput('');
        router.refresh();
      } catch (attachError) {
        setError(attachError instanceof Error ? attachError.message : ui.events.participants.attachFailed);
      }
    });
  }

  function handleUpdate(participantId: string) {
    setError(null);

    startTransition(async () => {
      try {
        const normalizedRole = normalizeText(editRoles[participantId] ?? '');
        const normalizedSequence = normalizeSequenceInput(editSequences[participantId] ?? '');

        const response = await fetch(`/api/events/${eventId}/participants/${participantId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ role: normalizedRole, sequence: normalizedSequence }),
        });

        const payload = await response.json().catch(() => null);

        if (!response.ok || payload?.success === false) {
          throw new Error(payload?.error ?? ui.events.participants.updateFailed);
        }

        router.refresh();
      } catch (updateError) {
        setError(updateError instanceof Error ? updateError.message : ui.events.participants.updateFailed);
      }
    });
  }

  function handleRemove(participantId: string) {
    setError(null);

    startTransition(async () => {
      try {
        const response = await fetch(`/api/events/${eventId}/participants/${participantId}`, {
          method: 'DELETE',
        });

        const payload = await response.json().catch(() => null);

        if (!response.ok || payload?.success === false) {
          throw new Error(payload?.error ?? ui.events.participants.removeFailed);
        }

        router.refresh();
      } catch (removeError) {
        setError(removeError instanceof Error ? removeError.message : ui.events.participants.removeFailed);
      }
    });
  }

  return (
    <section className="panel detail-panel">
      <div className="link-section__header">
        <h2>{ui.events.participants.title}</h2>
        <p className="muted">{ui.events.participants.description}</p>
      </div>

      {loadError ? <p className="field__error">{loadError}</p> : null}

      {participants.length > 0 ? (
        <div className="link-list">
          {participants.map((participant, index) => (
            <div key={participant.id} className="participant-item">
              <div className="participant-item__main">
                <div className="participant-item__identity">
                  <Link href={`/characters/${participant.character.id}`} className="link-item__target">
                    {participant.character.name}
                  </Link>
                </div>

                <div className="participant-item__fields">
                  <FormField
                    label={ui.events.participants.order}
                    name={`participant-sequence-${participant.id}`}
                    type="number"
                    value={editSequences[participant.id] ?? String(index + 1)}
                    onChange={(value) =>
                      setEditSequences((current) => ({
                        ...current,
                        [participant.id]: value,
                      }))
                    }
                    placeholder={ui.events.participants.orderPlaceholder}
                  />
                  <FormField
                    label={ui.events.participants.role}
                    name={`participant-role-${participant.id}`}
                    value={editRoles[participant.id] ?? ''}
                    onChange={(value) =>
                      setEditRoles((current) => ({
                        ...current,
                        [participant.id]: value,
                      }))
                    }
                    placeholder={ui.events.participants.rolePlaceholder}
                  />
                </div>
              </div>

              <div className="participant-item__actions">
                <button
                  type="button"
                  className="button-link"
                  onClick={() => handleUpdate(participant.id)}
                  disabled={isPending}
                >
                  {ui.events.participants.saveParticipant}
                </button>
                <button
                  type="button"
                  className="tag-chip__remove"
                  onClick={() => handleRemove(participant.id)}
                  disabled={isPending}
                >
                  {ui.events.participants.removeButton}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="muted">{ui.events.participants.empty}</p>
      )}

      <div className="tag-form">
        <SelectField
          label={ui.events.participants.selectCharacter}
          name="event-participant-character"
          value={selectedCharacterId}
          options={characterOptions}
          onChange={(value) => setSelectedCharacterId(value)}
        />

        <FormField
          label={ui.events.participants.role}
          name="event-participant-role"
          value={roleInput}
          onChange={(value) => setRoleInput(value)}
          placeholder={ui.events.participants.rolePlaceholder}
        />

        {error ? <p className="field__error">{error}</p> : null}

        <div className="actions-row">
          <button type="button" className="button" onClick={handleAttach} disabled={isPending}>
            {isPending ? ui.common.saving : ui.events.participants.attachButton}
          </button>
        </div>
      </div>
    </section>
  );
}

function normalizeSequenceInput(value: string): number | null {
  const trimmed = value.trim();

  if (trimmed.length === 0) {
    return null;
  }

  const parsed = Number(trimmed);

  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new Error(ui.events.participants.orderInvalid);
  }

  return parsed;
}