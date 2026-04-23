import Link from 'next/link';
import { listFactions } from '@/server/faction-service';
import { EmptyState } from '@/components/ui/empty-state';
import { PageContainer } from '@/components/ui/page-container';
import { SectionHeader } from '@/components/ui/section-header';
import { StatusBadge } from '@/components/ui/status-badge';
import { getUiText } from '@/lib/i18n/ui';

const ui = getUiText();

export default async function FactionsPage() {
  const factions = await listFactions();

  return (
    <PageContainer>
      <SectionHeader
        title={ui.factions.title}
        description={ui.factions.pageDescription}
        actions={
          <Link href="/factions/new" className="button">
            {ui.factions.new}
          </Link>
        }
      />

      {factions.length === 0 ? (
        <EmptyState
          title={ui.factions.emptyTitle}
          description={ui.factions.emptyDescription}
          action={
            <Link href="/factions/new" className="button">
              {ui.factions.create}
            </Link>
          }
        />
      ) : (
        <div className="list-stack">
          {factions.map((faction) => (
            <article key={faction.id} className="list-item">
              <div className="list-item__topline">
                <div>
                  <p className="list-item__type">
                    {ui.common.entityTypes.faction}
                    {faction.factionKind ? ` · ${faction.factionKind}` : ''}
                  </p>
                  <h2 className="list-item__title">
                    <Link href={`/factions/${faction.id}`}>{faction.name}</Link>
                  </h2>
                </div>
                <div className="meta-row">
                  <StatusBadge value={faction.status} label={ui.status[faction.status]} />
                  <StatusBadge value={faction.canonState} label={ui.status[faction.canonState]} />
                </div>
              </div>
              {faction.summary ? <p className="list-item__summary">{faction.summary}</p> : null}
            </article>
          ))}
        </div>
      )}
    </PageContainer>
  );
}
