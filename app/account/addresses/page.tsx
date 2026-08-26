import AddressManager from '@/components/account/AddressManager'
import { SectionHeader } from '@/components/account/ui'
import { requireUser } from '@/lib/auth'
import { getAddresses } from '@/lib/customer'

export const metadata = { title: 'Addresses' }

export default async function AddressesPage() {
  const user = await requireUser()
  const addresses = await getAddresses(user.id)

  return (
    <>
      <SectionHeader
        title="Delivery addresses"
        subtitle="Saved addresses appear at checkout for faster ordering."
      />
      <AddressManager addresses={addresses} />
    </>
  )
}
