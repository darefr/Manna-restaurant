import { Card, PageHeader, StatusBadge, Th, Td } from '@/components/admin/ui'
import { requirePermission } from '@/lib/auth'
import { getAdminStaff } from '@/lib/admin-data'
import StaffAccessToggle from '@/components/admin/StaffAccessToggle'

export default async function AdminStaffPage() {
  await requirePermission('staff.manage')
  const staff = await getAdminStaff()
  return <><PageHeader title="Staff & access" subtitle="Manage the people who can operate Manna and their account status." /><Card className="overflow-hidden p-0"><div className="overflow-x-auto"><table className="w-full min-w-[720px]"><thead><tr><Th>Team member</Th><Th>Role</Th><Th>Status</Th><Th>Last login</Th><Th align="right">Access</Th></tr></thead><tbody>{staff.map((member) => <tr key={member.id} className="border-t border-border/70"><Td><p className="text-beige">{member.name}</p><p className="text-xs text-muted-foreground">{member.email}</p></Td><Td><span className="text-xs uppercase tracking-widest text-gold">{member.role.replace('_',' ')}</span></Td><Td><StatusBadge label={member.is_active ? 'Active' : 'Inactive'} tone={member.is_active ? 'green' : 'red'} /></Td><Td>{member.last_login_at ? new Date(member.last_login_at).toLocaleString('en-IN') : 'Never'}</Td><Td align="right">{member.role === 'SUPER_ADMIN' ? <span className="text-xs text-muted-foreground">Protected</span> : <StaffAccessToggle id={member.id} isActive={member.is_active} />}</Td></tr>)}</tbody></table></div></Card></>
}
