import Link from 'next/link';
import { listRuleSystems } from '@/server/rule-system-service';
import { EmptyState } from '@/components/ui/empty-state';
import { PageContainer } from '@/components/ui/page-container';
import { SectionHeader } from '@/components/ui/section-header';
import { StatusBadge } from '@/components/ui/status-badge';
import { getUiText } from '@/lib/i18n/ui';

const ui = getUiText();

export default async function RuleSystemsPage() {
  const items = await listRuleSystems();

  return (
    <PageContainer>
      <SectionHeader title={ui.ruleSystems.title} description={ui.ruleSystems.pageDescription} actions={<Link href="/rule-systems/new" className="button">{ui.ruleSystems.new}</Link>} />
      {items.length === 0 ? (
        <EmptyState title={ui.ruleSystems.emptyTitle} description={ui.ruleSystems.emptyDescription} action={<Link href="/rule-systems/new" className="button">{ui.ruleSystems.create}</Link>} />
      ) : (
        <div className="list-stack">
          {items.map((item) => (
            <article key={item.id} className="list-item">
              <p className="list-item__type">{ui.common.entityTypes.ruleSystem}</p>
              <div className="list-item__topline">
                <div>
                  <h2 className="list-item__title"><Link href={`/rule-systems/${item.id}`}>{item.title}</Link></h2>
                  <p className="list-item__subtitle">{item.slug}{item.systemKind ? ` В· ${item.systemKind}` : ''}{item.versionLabel ? ` В· ${item.versionLabel}` : ''}</p>
                </div>
                <div className="meta-row">
                  <StatusBadge value={item.status} label={ui.status[item.status]} />
                  <StatusBadge value={item.canonState} label={ui.status[item.canonState]} />
                </div>
              </div>
              {item.summary ? <p className="list-item__summary">{item.summary}</p> : null}
            </article>
          ))}
        </div>
      )}
    </PageContainer>
  );
}
