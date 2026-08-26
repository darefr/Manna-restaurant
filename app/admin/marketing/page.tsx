import { Card, PageHeader, StatusBadge, Th, Td } from '@/components/admin/ui'
import { requirePermission } from '@/lib/auth'
import { getCampaigns } from '@/lib/admin-data'

export default async function AdminMarketingPage() {
  await requirePermission('marketing.manage')
  const campaigns = await getCampaigns()
  return <><PageHeader title="Marketing" subtitle="Campaign drafts and delivery history for guest communications." /><Card className="overflow-hidden p-0"><div className="overflow-x-auto"><table className="w-full min-w-[760px]"><thead><tr><Th>Campaign</Th><Th>Audience</Th><Th>Status</Th><Th>Recipients</Th><Th>Sent</Th><Th>Created</Th></tr></thead><tbody>{campaigns.map((c) => <tr key={c.id} className="border-t border-border/70"><Td><p className="text-beige">{c.name}</p><p className="text-xs text-muted-foreground">{c.subject}</p></Td><Td>{c.audience}</Td><Td><StatusBadge label={c.status} /></Td><Td>{c.recipients}</Td><Td>{c.sent_count}</Td><Td>{new Date(c.created_at).toLocaleDateString('en-IN')}</Td></tr>)}</tbody></table></div>{campaigns.length === 0 && <p className="p-10 text-center text-sm text-muted-foreground">No campaigns created yet.</p>}</Card></>
}
