import { api } from '@/utils/client'
import { unwrap } from '@polar-sh/client'
import { useQuery } from '@tanstack/react-query'
import { defaultRetry } from './retry'

export const useLiveCatalog = (organizationId: string, enabled: boolean) =>
  useQuery({
    queryKey: ['catalogs', 'live', { organizationId }],
    queryFn: async () => {
      const data = await unwrap(
        api.GET('/v1/catalogs/', {
          params: {
            query: {
              organization_id: organizationId,
              status: 'live',
              limit: 1,
            },
          },
        }),
      )
      return data.items[0] ?? null
    },
    retry: defaultRetry,
    // Catalogs are published from the CLI, so refetch on every refocus
    staleTime: 0,
    enabled,
  })

export const useCatalogs = (
  organizationId: string,
  page: number,
  limit: number,
) =>
  useQuery({
    queryKey: ['catalogs', { organizationId, page, limit }],
    queryFn: () =>
      unwrap(
        api.GET('/v1/catalogs/', {
          params: {
            query: {
              organization_id: organizationId,
              status: ['live', 'archived'],
              page,
              limit,
            },
          },
        }),
      ),
    retry: defaultRetry,
    staleTime: 0,
  })

export const useProductVersions = (
  organizationId: string,
  externalId: string | null,
  enabled: boolean,
) =>
  useQuery({
    queryKey: ['catalogs', 'product', { organizationId, externalId }],
    queryFn: () =>
      unwrap(
        api.GET('/v1/products/external/{external_id}/versions', {
          params: {
            path: { external_id: externalId ?? '' },
            query: { organization_id: organizationId, limit: 100 },
          },
        }),
      ),
    retry: defaultRetry,
    staleTime: 0,
    enabled: enabled && externalId !== null,
  })
