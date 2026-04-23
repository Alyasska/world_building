import Link from 'next/link';
import { listAssets } from '@/server/asset-service';
import { EmptyState } from '@/components/ui/empty-state';
import { PageContainer } from '@/components/ui/page-container';
import { SectionHeader } from '@/components/ui/section-header';
import { StatusBadge } from '@/components/ui/status-badge';
import { getUiText } from '@/lib/i18n/ui';

const ui = getUiText();

export default async function AssetsPage() {
  const items = await listAssets();

  return (
    <PageContainer>
      <SectionHeader title={ui.assets.title} description={ui.assets.pageDescription} actions={<Link href="/assets/new" className="button">{ui.assets.new}</Link>} />
      {items.length === 0 ? (
        <EmptyState title={ui.assets.emptyTitle} description={ui.assets.emptyDescription} action={<Link href="/assets/new" className="button">{ui.assets.create}</Link>} />
      ) : (
        <div className="list-stack">
          {items.map((item) => (
            <article key={item.id} className="list-item">
              <div className="list-item__topline">
                <div>
                  <h2 className="list-item__title"><Link href={`/assets/${item.id}`}>{item.name}</Link></h2>
                  <p className="muted">{item.fileName} · {item.mimeType} · {ui.assets.assetKindOptions[item.assetKind]}</p>
                </div>
                <div className="meta-row">
                  <StatusBadge value={item.status} label={ui.status[item.status]} />
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
