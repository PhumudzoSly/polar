import { useIsManagedAsCode } from '@/hooks/permissions'
import { useProductVersions } from '@/hooks/queries/catalogs'
import { schemas } from '@polar-sh/client'
import { Button, Text } from '@polar-sh/orbit'
import { Box } from '@polar-sh/orbit/Box'
import {
  Check,
  ChevronDown,
  ChevronRight,
  PeopleAltOutlined,
} from '@polar-sh/orbit/icons'
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

const SectionLabel = ({ children }: { children: string }) => (
  <Box paddingHorizontal="m" paddingTop="m" paddingBottom="xs">
    <Text variant="caption" color="muted">
      {children}
    </Text>
  </Box>
)

const VersionRow = ({
  organization,
  version,
  selected,
}: {
  organization: schemas['Organization']
  version: schemas['ProductVersion']
  selected: boolean
}) => {
  const count = version.active_subscriptions_count
  return (
    <DropdownMenuItem
      asChild
      className="dark:focus:bg-polar-800 gap-3 rounded-md px-2 py-2 focus:bg-gray-100"
    >
      <Link
        href={`/dashboard/${organization.slug}/products/${version.product_id}`}
      >
        <Box alignItems="center" columnGap="s" flex={1} minWidth={0}>
          <Text truncate variant={selected ? 'title' : 'default'}>
            {version.name ?? 'Untitled'}
          </Text>
          {selected ? <Check className="size-3.5! shrink-0" /> : null}
        </Box>
        <Box
          alignItems="center"
          columnGap="xs"
          aria-label={pluralize(count, 'subscription')}
        >
          <Text as="span" color={count ? 'muted' : 'disabled'}>
            <PeopleAltOutlined sx={{ fontSize: 14, display: 'block' }} />
          </Text>
          {/* Fixed widths keep the icon and date columns aligned across rows. */}
          <Box width={16} justifyContent="end">
            <Text tabularNums color={count ? 'default' : 'disabled'}>
              {count}
            </Text>
          </Box>
        </Box>
        <Box width={44} justifyContent="end">
          <Text variant="caption" color="muted" tabularNums wrap="nowrap">
            {formatPublishedAt(version.published_at)}
          </Text>
        </Box>
      </Link>
    </DropdownMenuItem>
  )
}

export const ProductVersionSelect = ({
  organization,
  product,
}: {
  organization: schemas['Organization']
  product: schemas['Product']
}) => {
  const managedAsCode = useIsManagedAsCode(organization.id)
  const { data } = useProductVersions(
    organization.id,
    product.external_id,
    managedAsCode,
  )
  const versions = data?.items
  const selected = versions?.find(
    (version) => version.product_id === product.id,
  )

  if (!versions || !selected) {
    return null
  }

  const current = versions.find((version) => version.is_current)
  const previous = versions.filter((version) => !version.is_current)

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
        className="w-[320px] origin-(--radix-dropdown-menu-content-transform-origin) overflow-hidden rounded-2xl p-0 duration-150"
      >
        <Box flexDirection="column">
          {current ? (
            <>
              <SectionLabel>Current version</SectionLabel>
              <Box
                flexDirection="column"
                paddingHorizontal="xs"
                paddingBottom="xs"
                borderBottomWidth={1}
                borderStyle="solid"
                borderColor="border-secondary"
              >
                <VersionRow
                  organization={organization}
                  version={current}
                  selected={current.product_id === product.id}
                />
              </Box>
            </>
          ) : null}
          {previous.length > 0 ? (
            <>
              <SectionLabel>
                {current ? 'Previous versions' : 'Versions'}
              </SectionLabel>
              {/* Height cuts through a row so it's obvious the list scrolls. */}
              <Box
                flexDirection="column"
                maxHeight={340}
                overflowY="auto"
                padding="xs"
              >
                {previous.map((version) => (
                  <VersionRow
                    key={version.product_id}
                    organization={organization}
                    version={version}
                    selected={version.product_id === product.id}
                  />
                ))}
              </Box>
            </>
          ) : null}
          <Box
            flexDirection="column"
            padding="xs"
            borderTopWidth={1}
            borderStyle="solid"
            borderColor="border-secondary"
          >
            <DropdownMenuItem
              asChild
              className="dark:focus:bg-polar-800 rounded-md px-2 py-2 focus:bg-gray-100"
            >
              <Link href={`/dashboard/${organization.slug}/products/versions`}>
                <Box flex={1} justifyContent="between" alignItems="center">
                  <Text variant="caption" color="muted" tabularNums>
                    {pluralize(data.pagination.total_count, 'version')}
                  </Text>
                  <Box
                    alignItems="center"
                    columnGap="xs"
                    color="text-secondary"
                  >
                    <Text variant="caption" color="inherit">
                      View all
                    </Text>
                    <ChevronRight size={14} />
                  </Box>
                </Box>
              </Link>
            </DropdownMenuItem>
          </Box>
        </Box>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
