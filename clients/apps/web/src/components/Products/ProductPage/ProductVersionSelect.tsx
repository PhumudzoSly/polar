import { useIsManagedAsCode } from '@/hooks/permissions'
import { useProductVersions } from '@/hooks/queries/catalogs'
import { schemas } from '@polar-sh/client'
import { Button, Text } from '@polar-sh/orbit'
import { Box } from '@polar-sh/orbit/Box'
import { Check, ChevronDown, Users } from '@polar-sh/orbit/icons'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@polar-sh/ui/components/ui/dropdown-menu'
import Link from 'next/link'

export const formatPublishedAt = (datetime: string | null) => {
  if (!datetime) return ''
  const date = new Date(datetime)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    ...(date.getFullYear() !== new Date().getFullYear() && {
      year: 'numeric',
    }),
  })
}

const pluralize = (count: number, noun: string) =>
  `${count.toLocaleString()} ${count === 1 ? noun : `${noun}s`}`

export const ProductVersionSelect = ({
  organization,
  product,
}: {
  organization: schemas['Organization']
  product: schemas['Product']
}) => {
  const managedAsCode = useIsManagedAsCode(organization.id)
  const { data: versions } = useProductVersions(product.id, managedAsCode)
  const selected = versions?.find(
    (version) => version.product_id === product.id,
  )

  if (!versions || !selected) {
    return null
  }

  const totalCustomers = versions.reduce(
    (total, version) => total + version.customers,
    0,
  )

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary">
          <span className="inline-flex items-center gap-1">
            <span>{selected.name ?? 'Untitled'}</span>
            <span className="dark:text-polar-500 text-gray-500">
              ·{' '}
              {selected.is_current
                ? 'Current'
                : formatPublishedAt(selected.published_at)}
            </span>
            <ChevronDown size={14} />
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-[340px] origin-(--radix-dropdown-menu-content-transform-origin) overflow-hidden rounded-2xl p-0 duration-150"
      >
        <Box flexDirection="column" maxHeight={560}>
          <Box
            alignItems="center"
            justifyContent="between"
            paddingHorizontal="l"
            paddingTop="l"
            paddingBottom="xs"
          >
            <Text variant="title" as="h2">
              Versions
            </Text>
            <Text variant="caption" color="muted" tabularNums>
              {pluralize(versions.length, 'version')} ·{' '}
              {pluralize(totalCustomers, 'customer')}
            </Text>
          </Box>
          <Box
            flexDirection="column"
            minHeight={0}
            overflowY="auto"
            padding="s"
          >
            {versions.map((version) => (
              <DropdownMenuItem
                key={version.product_id}
                asChild
                className="dark:focus:bg-polar-800 gap-3 rounded-lg px-2 py-1.5 focus:bg-gray-100"
              >
                <Link
                  href={`/dashboard/${organization.slug}/products/${version.product_id}`}
                >
                  <Box width={14} flexShrink={0} justifyContent="center">
                    {version.product_id === product.id ? (
                      <Check className="size-3.5!" />
                    ) : null}
                  </Box>
                  <Box alignItems="center" columnGap="s" flex={1} minWidth={0}>
                    <Text truncate>{version.name ?? 'Untitled'}</Text>
                    {version.is_current ? (
                      <Box
                        as="span"
                        display="inline-flex"
                        flexShrink={0}
                        paddingHorizontal="s"
                        borderRadius="full"
                        backgroundColor="background-secondary"
                      >
                        <Text as="span" variant="caption" color="muted">
                          Current
                        </Text>
                      </Box>
                    ) : null}
                  </Box>
                  <Text color="muted" wrap="nowrap" tabularNums>
                    {formatPublishedAt(version.published_at)}
                  </Text>
                  <Box
                    alignItems="center"
                    justifyContent="end"
                    columnGap="xs"
                    minWidth={48}
                    flexShrink={0}
                    aria-label={pluralize(version.customers, 'customer')}
                  >
                    <Users className="dark:text-polar-500 size-3.5! text-gray-500" />
                    <Text color="muted" tabularNums>
                      {version.customers.toLocaleString()}
                    </Text>
                  </Box>
                </Link>
              </DropdownMenuItem>
            ))}
          </Box>
        </Box>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
