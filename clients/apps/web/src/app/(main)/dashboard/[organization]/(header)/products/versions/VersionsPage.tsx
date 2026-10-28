'use client'

import { DashboardBody } from '@/components/Layout/DashboardLayout'
import Pagination from '@/components/Pagination/Pagination'
import { EmptyState } from '@/components/Shared/EmptyState'
import { VersionRow } from '@/components/Catalog/VersionRow'
import { useCatalogs } from '@/hooks/queries/catalogs'
import { schemas } from '@polar-sh/client'
import { List } from '@polar-sh/orbit'
import { HistoryRounded } from '@polar-sh/orbit/icons'
import { useSearchParams } from 'next/navigation'
import { parseAsInteger, useQueryState } from 'nuqs'

const PAGE_SIZE = 20

export default function VersionsPage({
  organization,
}: {
  organization: schemas['Organization']
}) {
  const searchParams = useSearchParams()
  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1))
  const { data: catalogs, isLoading } = useCatalogs(
    organization.id,
    page,
    PAGE_SIZE,
  )

  return (
    <DashboardBody title="Versions">
      {isLoading ? null : catalogs && catalogs.items.length > 0 ? (
        <Pagination
          currentPage={page}
          pageSize={PAGE_SIZE}
          totalCount={catalogs.pagination.total_count}
          currentURL={searchParams}
          onPageChange={setPage}
        >
          <List size="small">
            {catalogs.items.map((catalog) => (
              <VersionRow
                key={catalog.id}
                name={catalog.name}
                isCurrent={catalog.status === 'live'}
                customers={catalog.customers}
                publishedAt={catalog.published_at ?? catalog.created_at}
              />
            ))}
          </List>
        </Pagination>
      ) : (
        <EmptyState
          icon={<HistoryRounded />}
          title="No versions yet"
          description="A version is published each time you apply product changes from your config."
        />
      )}
    </DashboardBody>
  )
}
