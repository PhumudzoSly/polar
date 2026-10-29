'use client'

import { extractApiErrorMessage } from '@/utils/api/errors'
import { api } from '@/utils/client'
import { schemas } from '@polar-sh/client'
import { Alert, Button, Text } from '@polar-sh/orbit'
import { Box } from '@polar-sh/orbit/Box'
import { useRef, useState } from 'react'
import { toast } from '../Toast/use-toast'
import { SettingsGroup, SettingsGroupItem } from './SettingsGroup'

const downloadJson = (data: unknown, filename: string) => {
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }),
  )
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

const countByAction = (changes: schemas['ConfigChange'][]) =>
  ['created', 'unchanged']
    .map((action) => ({
      action,
      count: changes.filter((change) => change.action === action).length,
    }))
    .filter(({ count }) => count > 0)
    .map(
      ({ action, count }) =>
        `${count} ${action === 'created' ? 'to create' : 'already there'}`,
    )
    .join(', ')

export default function OrganizationConfigCopySettings({
  organization,
  readOnly,
}: {
  organization: schemas['Organization']
  readOnly: boolean
}) {
  const fileInput = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [pending, setPending] = useState<{
    config: schemas['Config']
    plan: schemas['ConfigPlan']
  } | null>(null)

  const onExport = async () => {
    setBusy(true)
    const { data, error } = await api
      .GET('/v1/config/', {
        params: { query: { organization_id: organization.id, copy: true } },
      })
      .finally(() => setBusy(false))
    if (error) {
      toast({
        title: 'Export failed',
        description: extractApiErrorMessage(error),
      })
      return
    }
    const { settings: _settings, ...config } = data.config
    downloadJson(config, `polar-${organization.slug}-config.json`)
    toast({
      title: 'Config exported',
      description: data.skipped.length
        ? `${data.skipped.length} item(s) left out: ${data.skipped.map((skip) => skip.name).join(', ')}`
        : 'Everything was exported.',
    })
  }

  const onFile = async (file: File) => {
    let parsed: Record<string, unknown>
    try {
      parsed = JSON.parse(await file.text())
    } catch {
      toast({
        title: 'Import failed',
        description: 'That file is not valid JSON.',
      })
      return
    }
    const exported = (parsed.config ?? parsed) as Record<string, unknown>
    const { settings: _settings, webhooks: _webhooks, ...rest } = exported
    const config = {
      ...rest,
      organization_id: organization.id,
    } as schemas['Config']

    setBusy(true)
    const { data, error } = await api
      .POST('/v1/config/plan', {
        params: { query: { copy: true } },
        body: config,
      })
      .finally(() => setBusy(false))
    if (error) {
      toast({
        title: 'Import failed',
        description: extractApiErrorMessage(error),
      })
      return
    }
    setPending({ config, plan: data })
  }

  const onApply = async () => {
    if (!pending) return
    setBusy(true)
    const { data, error } = await api
      .POST('/v1/config/apply', {
        params: { query: { copy: true } },
        body: pending.config,
      })
      .finally(() => setBusy(false))
    if (error) {
      toast({
        title: 'Import failed',
        description: extractApiErrorMessage(error),
      })
      return
    }
    setPending(null)
    toast({
      title: 'Config imported',
      description: `${data.changes.filter((change) => change.action === 'created').length} item(s) created.`,
    })
  }

  const errors =
    pending?.plan.issues.filter((issue) => issue.severity === 'error') ?? []

  return (
    <SettingsGroup description="Copy meters, benefits and products between organizations, for example from sandbox to production. Importing only creates what's missing. It never changes existing items, settings or webhooks.">
      <SettingsGroupItem
        title="Export"
        description="Download this organization's meters, benefits and products as a JSON file."
      >
        <Button size="sm" variant="secondary" onClick={onExport} loading={busy}>
          Export
        </Button>
      </SettingsGroupItem>
      <SettingsGroupItem
        title="Import"
        description="Upload a file exported from another organization. You'll see what changes before anything is created."
      >
        <input
          ref={fileInput}
          type="file"
          accept="application/json,.json"
          hidden
          onChange={(event) => {
            const file = event.target.files?.[0]
            event.target.value = ''
            if (file) onFile(file)
          }}
        />
        <Button
          size="sm"
          variant="secondary"
          disabled={readOnly}
          loading={busy}
          onClick={() => fileInput.current?.click()}
        >
          Import
        </Button>
      </SettingsGroupItem>
      {pending && (
        <Box
          flexDirection="column"
          rowGap="m"
          paddingHorizontal="xl"
          paddingVertical="l"
        >
          <Text>
            {countByAction(pending.plan.changes) || 'Nothing to import.'}
          </Text>
          {errors.length > 0 && (
            <Alert
              variant="danger"
              title="This file can't be imported"
              description={
                <Box as="ul" flexDirection="column" rowGap="xs">
                  {errors.map((issue) => (
                    <Box as="li" key={issue.loc.join('.')}>
                      {issue.msg}
                    </Box>
                  ))}
                </Box>
              }
            />
          )}
          <Box columnGap="s">
            <Button
              size="sm"
              onClick={onApply}
              loading={busy}
              disabled={
                errors.length > 0 ||
                !pending.plan.changes.some(
                  (change) => change.action === 'created',
                )
              }
            >
              Import
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setPending(null)}>
              Cancel
            </Button>
          </Box>
        </Box>
      )}
    </SettingsGroup>
  )
}
