import {
  Grid,
  ListItem,
  Text,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@polar-sh/orbit'
import { Box } from '@polar-sh/orbit/Box'
import FormattedDateTime from '@polar-sh/ui/components/atoms/FormattedDateTime'
import PolarTimeAgo from '@polar-sh/ui/components/atoms/PolarTimeAgo'
import { useState } from 'react'

const WEEK_MS = 7 * 24 * 60 * 60 * 1000

const CurrentBadge = () => (
  <Box
    as="span"
    display="inline-flex"
    paddingHorizontal="m"
    paddingVertical="xs"
    borderRadius="full"
    backgroundColor="background-secondary"
  >
    <Text as="span" color="muted">
      Current
    </Text>
  </Box>
)

const PublishedAt = ({ datetime }: { datetime: string }) => {
  const [now] = useState(() => Date.now())

  if (now - new Date(datetime).getTime() >= WEEK_MS) {
    return <FormattedDateTime datetime={datetime} />
  }

  return (
    <Tooltip delayDuration={150}>
      <TooltipTrigger asChild>
        <span>
          <PolarTimeAgo date={new Date(datetime)} />
        </span>
      </TooltipTrigger>
      <TooltipContent>
        <FormattedDateTime datetime={datetime} resolution="time" />
      </TooltipContent>
    </Tooltip>
  )
}

export const VersionRow = ({
  name,
  isCurrent,
  customers,
  publishedAt,
}: {
  name: string | null
  isCurrent: boolean
  customers: number
  publishedAt: string | null
}) => (
  <ListItem>
    <Grid
      templateColumns="minmax(0, 1fr) auto 120px 130px"
      columnGap="xl"
      alignItems="center"
      width="100%"
    >
      <Text color={name ? 'default' : 'muted'} truncate>
        {name ?? 'Untitled'}
      </Text>
      <Box>{isCurrent ? <CurrentBadge /> : null}</Box>
      <Text color="muted" align="right">
        {customers.toLocaleString()}{' '}
        {customers === 1 ? 'customer' : 'customers'}
      </Text>
      <Text color="muted" align="right">
        {publishedAt ? <PublishedAt datetime={publishedAt} /> : null}
      </Text>
    </Grid>
  </ListItem>
)
