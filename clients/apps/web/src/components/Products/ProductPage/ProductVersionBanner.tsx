import { useIsManagedAsCode } from '@/hooks/permissions'
import { useProductVersions } from '@/hooks/queries/catalogs'
import { schemas } from '@polar-sh/client'
import { Button, Text } from '@polar-sh/orbit'
import { Box } from '@polar-sh/orbit/Box'
import { useRouter } from 'next/navigation'
import { formatPublishedAt } from './ProductVersionSelect'

const Stat = ({ label, value }: { label: string; value: string }) => (
  <Box flexDirection="column" rowGap="xs">
    <Text variant="caption" color="muted">
      {label}
    </Text>
    <Text tabularNums wrap="nowrap">
      {value}
    </Text>
  </Box>
)

export const ProductVersionBanner = ({
  organization,
  product,
}: {
  organization: schemas['Organization']
  product: schemas['Product']
}) => {
  const router = useRouter()
  const managedAsCode = useIsManagedAsCode(organization.id)
  const { data: versions } = useProductVersions(
    organization.id,
    product.external_id,
    managedAsCode,
  )
  const selected = versions?.find(
    (version) => version.product_id === product.id,
  )
  const current = versions?.find((version) => version.is_current)

  if (!selected || selected.is_current || !current) {
    return null
  }

  return (
    <Box
      flexDirection={{ base: 'column', md: 'row' }}
      alignItems={{ base: 'start', md: 'center' }}
      justifyContent="between"
      columnGap="2xl"
      rowGap="l"
      marginBottom="l"
      paddingVertical="l"
      paddingHorizontal="xl"
      borderRadius="l"
      borderWidth={1}
      borderStyle="solid"
      borderColor="border-primary"
    >
      <Box flexDirection="column" rowGap="xs" minWidth={0}>
        <Text variant="title">You&apos;re viewing an older version</Text>
        <Text color="muted">
          New checkouts use{' '}
          <Text as="span" color="default">
            {current.name ?? 'the current version'}
          </Text>
          .
        </Text>
      </Box>
      <Box
        alignItems="center"
        flexWrap="wrap"
        columnGap="2xl"
        rowGap="l"
        flexShrink={0}
      >
        <Stat
          label="Published"
          value={formatPublishedAt(selected.published_at)}
        />
        <Stat
          label="Subscriptions"
          value={selected.active_subscriptions_count.toLocaleString()}
        />
        <Button
          variant="secondary"
          onClick={() =>
            router.push(
              `/dashboard/${organization.slug}/products/${current.product_id}`,
            )
          }
        >
          View current version
        </Button>
      </Box>
    </Box>
  )
}
