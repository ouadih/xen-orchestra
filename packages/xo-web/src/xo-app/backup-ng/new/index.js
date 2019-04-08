import _, { messages } from 'intl'
import ActionButton from 'action-button'
import decorate from 'apply-decorators'
import defined, { get } from '@xen-orchestra/defined'
import Icon from 'icon'
import Link from 'link'
import React from 'react'
import Select from 'form/select'
import SelectCompression from 'select-compression'
import Tooltip from 'tooltip'
import Upgrade from 'xoa-upgrade'
import { addSubscriptions, connectStore, resolveId, resolveIds } from 'utils'
import { Card, CardBlock, CardHeader } from 'card'
import { constructSmartPattern, destructSmartPattern } from 'smart-backup'
import { Container, Col, Row } from 'grid'
import { createGetObjectsOfType } from 'selectors'
import { flatten, includes, isEmpty, map, mapValues, omit, some } from 'lodash'
import { form } from 'modal'
import { generateId } from 'reaclette-utils'
import { injectIntl } from 'react-intl'
import { injectState, provideState } from 'reaclette'
import { Number } from 'form'
import { renderXoItemFromId, Remote } from 'render-xo-item'
import { SelectRemote, SelectSr, SelectVm } from 'select-objects'
import {
  createBackupNgJob,
  createSchedule,
  deleteSchedule,
  editBackupNgJob,
  editSchedule,
  isSrWritable,
  subscribeRemotes,
} from 'xo'

import Schedules from './_schedules'
import SmartBackup from './smart-backup'
import getSettingsWithNonDefaultValue from '../_getSettingsWithNonDefaultValue'
import {
  canDeltaBackup,
  constructPattern,
  destructPattern,
  FormFeedback,
  FormGroup,
  Input,
  Li,
  Ul,
} from './../utils'

export NewMetadataBackup from './metadata'

// ===================================================================

// A retention can be:
// - number: set by user
// - undefined: will be replaced by the default value in the display(table + modal) and on submitting the form
const DEFAULT_RETENTION = 1
const RETENTIONS = {
  copyRetention: {
    defaultValue: DEFAULT_RETENTION,
    name: _('scheduleCopyRetention'),
    valuePath: 'copyRetention',
  },
  exportRetention: {
    defaultValue: DEFAULT_RETENTION,
    name: _('scheduleExportRetention'),
    valuePath: 'exportRetention',
  },
  snapshotRetention: {
    defaultValue: DEFAULT_RETENTION,
    name: _('snapshotRetention'),
    valuePath: 'snapshotRetention',
  },
}

const RETENTIONS_REQUIRED_MODE = {
  copyRetention: 'copyMode',
  exportRetention: 'exportMode',
  snapshotRetention: 'snapshotMode',
}

const SR_BACKEND_FAILURE_LINK =
  'https://xen-orchestra.com/docs/backup_troubleshooting.html#srbackendfailure44-insufficient-space'

const BACKUP_NG_DOC_LINK = 'https://xen-orchestra.com/docs/backups.html'

const ThinProvisionedTip = ({ label }) => (
  <Tooltip content={_(label)}>
    <a
      className='text-info'
      href={SR_BACKEND_FAILURE_LINK}
      rel='noopener noreferrer'
      target='_blank'
    >
      <Icon icon='info' />
    </a>
  </Tooltip>
)

const normalizeTagValues = values => resolveIds(values).map(value => [value])

const normalizeSettings = (settings, schedules, modes) => {
  const predicate = (setting, id) =>
    schedules[id] !== undefined
      ? mapValues(setting, (value = DEFAULT_RETENTION, name) =>
          modes[RETENTIONS_REQUIRED_MODE[name]] ? value : undefined
        )
      : setting
  return mapValues(settings, predicate)
}

const destructVmsPattern = pattern =>
  pattern.id === undefined
    ? {
        tags: destructSmartPattern(pattern.tags, flatten),
      }
    : {
        vms: destructPattern(pattern),
      }

const REPORT_WHEN_FILTER_OPTIONS = [
  {
    label: 'reportWhenAlways',
    value: 'always',
  },
  {
    label: 'reportWhenFailure',
    value: 'failure',
  },
  {
    label: 'reportWhenNever',
    value: 'Never',
  },
]

const getOptionRenderer = ({ label }) => <span>{_(label)}</span>

const createDoesRetentionExist = name => {
  const predicate = setting => setting[name] > 0
  return ({ settings }) => some(settings, predicate)
}

const getInitialState = () => ({
  _displayAdvancedSettings: undefined,
  _schedules: undefined,
  _settings: undefined,
  _vmsPattern: undefined,
  backupMode: false,
  compression: undefined,
  crMode: false,
  deltaMode: false,
  drMode: false,
  name: '',
  paramsUpdated: false,
  remotes: [],
  showErrors: false,
  smartMode: false,
  snapshotMode: false,
  srs: [],
  tags: {
    notValues: ['Continuous Replication', 'Disaster Recovery', 'XOSAN'],
  },
  vms: [],
})

const DeleteOldBackupsFirst = ({ handler, handlerParam, value }) => (
  <ActionButton
    handler={handler}
    handlerParam={handlerParam}
    icon={value ? 'toggle-on' : 'toggle-off'}
    iconColor={value ? 'text-success' : undefined}
    size='small'
    tooltip={_('deleteOldBackupsFirstMessage')}
  >
    {_('deleteOldBackupsFirst')}
  </ActionButton>
)

export default decorate([
  New => props => (
    <Upgrade place='newBackup' required={2}>
      <New {...props} />
    </Upgrade>
  ),
  addSubscriptions({
    remotes: subscribeRemotes,
  }),
  connectStore(() => ({
    hostsById: createGetObjectsOfType('host'),
    poolsById: createGetObjectsOfType('pool'),
    srsById: createGetObjectsOfType('SR'),
  })),
  injectIntl,
  provideState({
    initialState: getInitialState,
    effects: {
      createJob: () => async state => {
        if (state.isJobInvalid) {
          return {
            ...state,
            showErrors: true,
          }
        }

        await createBackupNgJob({
          name: state.name,
          mode: state.isDelta ? 'delta' : 'full',
          compression: state.compression,
          schedules: mapValues(
            state.schedules,
            ({ id, ...schedule }) => schedule
          ),
          settings: normalizeSettings(state.settings, state.schedules, {
            exportMode: state.exportMode,
            copyMode: state.copyMode,
            snapshotMode: state.snapshotMode,
          }),
          remotes:
            state.deltaMode || state.backupMode
              ? constructPattern(state.remotes)
              : undefined,
          srs:
            state.crMode || state.drMode
              ? constructPattern(state.srs)
              : undefined,
          vms: state.smartMode
            ? state.vmsSmartPattern
            : constructPattern(state.vms),
        })
      },
      editJob: () => async (state, props) => {
        if (state.isJobInvalid) {
          return {
            ...state,
            showErrors: true,
          }
        }

        const settings = { ...state.settings }
        await Promise.all([
          ...map(props.schedules, ({ id }) => {
            const schedule = state.schedules[id]
            if (schedule === undefined) {
              return deleteSchedule(id)
            }

            return editSchedule({
              id,
              cron: schedule.cron,
              name: schedule.name,
              timezone: schedule.timezone,
              enabled: schedule.enabled,
            })
          }),
          ...map(state.schedules, async schedule => {
            if (props.schedules[schedule.id] === undefined) {
              const { id } = await createSchedule(props.job.id, {
                cron: schedule.cron,
                name: schedule.name,
                timezone: schedule.timezone,
                enabled: schedule.enabled,
              })
              settings[id] = settings[schedule.id]
              delete settings[schedule.id]
            }
          }),
        ])

        await editBackupNgJob({
          id: props.job.id,
          name: state.name,
          mode: state.isDelta ? 'delta' : 'full',
          compression: state.compression,
          settings: normalizeSettings(settings, state.schedules, {
            exportMode: state.exportMode,
            copyMode: state.copyMode,
            snapshotMode: state.snapshotMode,
          }),
          remotes:
            state.deltaMode || state.backupMode
              ? constructPattern(state.remotes)
              : constructPattern([]),
          srs:
            state.crMode || state.drMode
              ? constructPattern(state.srs)
              : constructPattern([]),
          vms: state.smartMode
            ? state.vmsSmartPattern
            : constructPattern(state.vms),
        })
      },
      toggleMode: (_, { mode }) => state => ({
        ...state,
        [mode]: !state[mode],
      }),
      setCheckboxValue: (_, { target: { checked, name } }) => state => ({
        ...state,
        [name]: checked,
      }),
      toggleScheduleState({ setSchedules }, id) {
        const { schedules } = this.state
        setSchedules({
          ...schedules,
          [id]: {
            ...schedules[id],
            enabled: !schedules[id].enabled,
          },
        })
      },
      setName: (_, { target: { value } }) => state => ({
        ...state,
        name: value,
      }),
      setTargetDeleteFirst({ setSettings }, id) {
        const { settings } = this.state
        setSettings({
          ...settings,
          [id]: {
            ...settings[id],
            deleteFirst: !get(() => settings[id].deleteFirst),
          },
        })
      },
      addRemote: (_, remote) => state => {
        return {
          ...state,
          remotes: [...state.remotes, resolveId(remote)],
        }
      },
      deleteRemote: (_, key) => state => {
        const remotes = [...state.remotes]
        remotes.splice(key, 1)
        return {
          ...state,
          remotes,
        }
      },
      addSr: (_, sr) => state => ({
        ...state,
        srs: [...state.srs, resolveId(sr)],
      }),
      deleteSr: (_, key) => state => {
        const srs = [...state.srs]
        srs.splice(key, 1)
        return {
          ...state,
          srs,
        }
      },
      setVms: (_, vms) => state => ({ ...state, vms }),
      updateParams: () => (_, { job, schedules }) => {
        const remotes =
          job.remotes !== undefined ? destructPattern(job.remotes) : []
        const srs = job.srs !== undefined ? destructPattern(job.srs) : []

        return {
          name: job.name,
          paramsUpdated: true,
          smartMode: job.vms.id === undefined,
          snapshotMode: some(
            job.settings,
            ({ snapshotRetention }) => snapshotRetention > 0
          ),
          backupMode: job.mode === 'full' && !isEmpty(remotes),
          deltaMode: job.mode === 'delta' && !isEmpty(remotes),
          drMode: job.mode === 'full' && !isEmpty(srs),
          crMode: job.mode === 'delta' && !isEmpty(srs),
          remotes,
          srs,
          ...destructVmsPattern(job.vms),
        }
      },
      onVmsPatternChange: (_, _vmsPattern) => ({
        _vmsPattern,
      }),
      setTagValues: (_, values) => state => ({
        ...state,
        tags: {
          ...state.tags,
          values,
        },
      }),
      setTagNotValues: (_, notValues) => state => ({
        ...state,
        tags: {
          ...state.tags,
          notValues,
        },
      }),
      resetJob: ({ updateParams }) => (state, { job }) => {
        if (job !== undefined) {
          updateParams()
        }

        return getInitialState()
      },
      setCompression: (_, compression) => ({ compression }),
      toggleDisplayAdvancedSettings: () => ({ displayAdvancedSettings }) => ({
        _displayAdvancedSettings: !displayAdvancedSettings,
      }),
      setSchedules(_, schedules) {
        this.state._schedules = schedules
      },
      setSettings(_, settings) {
        this.state._settings = settings
      },
      setGlobalSettings({ setSettings }, { name, value }) {
        const { settings } = this.state
        setSettings({
          ...settings,
          '': {
            ...settings[''],
            [name]: value,
          },
        })
      },
      setReportWhen: ({ setGlobalSettings }, { value }) => () => {
        setGlobalSettings({
          name: 'reportWhen',
          value,
        })
      },
      setConcurrency: ({ setGlobalSettings }, value) => () => {
        setGlobalSettings({
          name: 'concurrency',
          value,
        })
      },
      setTimeout: ({ setGlobalSettings }, value) => () => {
        setGlobalSettings({
          name: 'timeout',
          value: value && value * 3600e3,
        })
      },
      setFullInterval({ setGlobalSettings }, value) {
        setGlobalSettings({
          name: 'fullInterval',
          value,
        })
      },
      setOfflineSnapshot: (
        { setGlobalSettings },
        { target: { checked: value } }
      ) => () => {
        setGlobalSettings({
          name: 'offlineSnapshot',
          value,
        })
      },
    },
    computed: {
      compressionId: generateId,
      formId: generateId,
      inputConcurrencyId: generateId,
      inputFullIntervalId: generateId,
      inputReportWhenId: generateId,
      inputTimeoutId: generateId,

      vmsPattern: ({ _vmsPattern }, { job }) =>
        defined(
          _vmsPattern,
          () => (job.vms.id !== undefined ? undefined : job.vms),
          {
            type: 'VM',
          }
        ),
      needUpdateParams: (state, { job, schedules }) =>
        job !== undefined && schedules !== undefined && !state.paramsUpdated,
      isJobInvalid: state =>
        state.missingName ||
        state.missingVms ||
        state.missingBackupMode ||
        state.missingSchedules ||
        state.missingRemotes ||
        state.missingSrs ||
        state.missingExportRetention ||
        state.missingCopyRetention ||
        state.missingSnapshotRetention,
      missingName: state => state.name.trim() === '',
      missingVms: state => isEmpty(state.vms) && !state.smartMode,
      missingBackupMode: state =>
        !state.isDelta && !state.isFull && !state.snapshotMode,
      missingRemotes: state =>
        (state.backupMode || state.deltaMode) && isEmpty(state.remotes),
      missingSrs: state => (state.drMode || state.crMode) && isEmpty(state.srs),
      missingSchedules: state => isEmpty(state.schedules),
      missingExportRetention: state =>
        state.exportMode && !state.exportRetentionExists,
      missingCopyRetention: state =>
        state.copyMode && !state.copyRetentionExists,
      missingSnapshotRetention: state =>
        state.snapshotMode && !state.snapshotRetentionExists,
      exportMode: state => state.backupMode || state.deltaMode,
      copyMode: state => state.drMode || state.crMode,
      retentions: state => {
        const retentions = []
        if (state.copyMode) {
          retentions.push(RETENTIONS.copyRetention)
        }
        if (state.exportMode) {
          retentions.push(RETENTIONS.exportRetention)
        }
        if (state.snapshotMode) {
          retentions.push(RETENTIONS.snapshotRetention)
        }
        return retentions
      },
      exportRetentionExists: createDoesRetentionExist('exportRetention'),
      copyRetentionExists: createDoesRetentionExist('copyRetention'),
      snapshotRetentionExists: createDoesRetentionExist('snapshotRetention'),
      isDelta: state => state.deltaMode || state.crMode,
      isFull: state => state.backupMode || state.drMode,
      vmsSmartPattern: ({ tags, vmsPattern }) => ({
        ...vmsPattern,
        tags: constructSmartPattern(tags, normalizeTagValues),
      }),
      vmPredicate: ({ isDelta }, { hostsById, poolsById }) => ({
        $container,
      }) =>
        !isDelta ||
        canDeltaBackup(
          get(() => hostsById[$container].version) ||
            get(() => hostsById[poolsById[$container].master].version)
        ),
      srPredicate: ({ srs }) => sr => isSrWritable(sr) && !includes(srs, sr.id),
      remotePredicate: ({ remotes }) => ({ id }) => !includes(remotes, id),
      settings: ({ _settings }, { job }) =>
        defined(_settings, () => job.settings, {}),
      schedules: ({ _schedules }, { schedules }) =>
        defined(_schedules, schedules, {}),
      displayAdvancedSettings: (state, props) =>
        defined(
          state._displayAdvancedSettings,
          !isEmpty(
            getSettingsWithNonDefaultValue(state.isFull ? 'full' : 'delta', {
              compression: get(() => props.job.compression),
              ...get(() => omit(props.job.settings[''], 'reportWhen')),
            })
          )
        ),
    },
  }),
  injectState,
  ({ state, effects, remotes, srsById, job = {}, intl }) => {
    const { formatMessage } = intl
    const compression = defined(state.compression, job.compression, '')
    const {
      concurrency,
      fullInterval,
      offlineSnapshot,
      reportWhen = 'failure',
      timeout,
    } = defined(() => state.settings[''], {})
    const {
      missingBackupMode,
      missingCopyRetention,
      missingExportRetention,
      missingName,
      missingRemotes,
      missingSchedules,
      missingSnapshotRetention,
      missingSrs,
      missingVms,
    } = state.showErrors ? state : {}

    if (state.needUpdateParams) {
      effects.updateParams()
    }

    return (
      <form id={state.formId}>
        <Container>
          <Row>
            <Col mediumSize={6}>
              <Card>
                <CardHeader>{_('backupName')}*</CardHeader>
                <CardBlock>
                  <FormFeedback
                    component={Input}
                    message={_('missingBackupName')}
                    onChange={effects.setName}
                    error={missingName}
                    value={state.name}
                  />
                </CardBlock>
              </Card>
              <FormFeedback
                component={Card}
                error={missingBackupMode}
                message={_('missingBackupMode')}
              >
                <CardBlock>
                  <div className='text-xs-center'>
                    <ActionButton
                      active={state.snapshotMode}
                      data-mode='snapshotMode'
                      handler={effects.toggleMode}
                      icon='rolling-snapshot'
                    >
                      {_('rollingSnapshot')}
                    </ActionButton>{' '}
                    <ActionButton
                      active={state.backupMode}
                      data-mode='backupMode'
                      disabled={state.isDelta}
                      handler={effects.toggleMode}
                      icon='backup'
                    >
                      {_('backup')}
                    </ActionButton>{' '}
                    <ActionButton
                      active={state.deltaMode}
                      data-mode='deltaMode'
                      disabled={
                        state.isFull ||
                        (!state.deltaMode && process.env.XOA_PLAN < 3)
                      }
                      handler={effects.toggleMode}
                      icon='delta-backup'
                    >
                      {_('deltaBackup')}
                    </ActionButton>{' '}
                    <ActionButton
                      active={state.drMode}
                      data-mode='drMode'
                      disabled={
                        state.isDelta ||
                        (!state.drMode && process.env.XOA_PLAN < 3)
                      }
                      handler={effects.toggleMode}
                      icon='disaster-recovery'
                    >
                      {_('disasterRecovery')}
                    </ActionButton>{' '}
                    {process.env.XOA_PLAN < 3 && (
                      <Tooltip content={_('dbAndDrRequireEnterprisePlan')}>
                        <Icon icon='info' />
                      </Tooltip>
                    )}{' '}
                    <ActionButton
                      active={state.crMode}
                      data-mode='crMode'
                      disabled={
                        state.isFull ||
                        (!state.crMode && process.env.XOA_PLAN < 4)
                      }
                      handler={effects.toggleMode}
                      icon='continuous-replication'
                    >
                      {_('continuousReplication')}
                    </ActionButton>{' '}
                    {process.env.XOA_PLAN < 4 && (
                      <Tooltip content={_('crRequiresPremiumPlan')}>
                        <Icon icon='info' />
                      </Tooltip>
                    )}
                    <br />
                    <a
                      className='text-muted'
                      href={BACKUP_NG_DOC_LINK}
                      rel='noopener noreferrer'
                      target='_blank'
                    >
                      <Icon icon='info' />{' '}
                      {_('backupNgLinkToDocumentationMessage')}
                    </a>
                  </div>
                </CardBlock>
              </FormFeedback>
              <br />
              {(state.backupMode || state.deltaMode) && (
                <Card>
                  <CardHeader>
                    {_(state.backupMode ? 'backup' : 'deltaBackup')}
                    <Link
                      className='btn btn-primary pull-right'
                      target='_blank'
                      to='/settings/remotes'
                    >
                      <Icon icon='settings' />{' '}
                      <strong>{_('remotesSettings')}</strong>
                    </Link>
                  </CardHeader>
                  <CardBlock>
                    {isEmpty(remotes) ? (
                      <span className='text-warning'>
                        <Icon icon='alarm' /> {_('createRemoteMessage')}
                      </span>
                    ) : (
                      <FormGroup>
                        <label>
                          <strong>{_('backupTargetRemotes')}</strong>
                        </label>
                        <FormFeedback
                          component={SelectRemote}
                          message={_('missingRemotes')}
                          onChange={effects.addRemote}
                          predicate={state.remotePredicate}
                          error={missingRemotes}
                          value={null}
                        />
                        <br />
                        <Ul>
                          {map(state.remotes, (id, key) => (
                            <Li key={id}>
                              <Remote id={id} />
                              <div className='pull-right'>
                                <DeleteOldBackupsFirst
                                  handler={effects.setTargetDeleteFirst}
                                  handlerParam={id}
                                  value={get(
                                    () => state.settings[id].deleteFirst
                                  )}
                                />{' '}
                                <ActionButton
                                  btnStyle='danger'
                                  handler={effects.deleteRemote}
                                  handlerParam={key}
                                  icon='delete'
                                  size='small'
                                />
                              </div>
                            </Li>
                          ))}
                        </Ul>
                      </FormGroup>
                    )}
                  </CardBlock>
                </Card>
              )}
              {(state.drMode || state.crMode) && (
                <Card>
                  <CardHeader>
                    {_(
                      state.drMode
                        ? 'disasterRecovery'
                        : 'continuousReplication'
                    )}
                  </CardHeader>
                  <CardBlock>
                    <FormGroup>
                      <label>
                        <strong>{_('backupTargetSrs')}</strong>
                      </label>
                      <FormFeedback
                        component={SelectSr}
                        message={_('missingSrs')}
                        onChange={effects.addSr}
                        predicate={state.srPredicate}
                        error={missingSrs}
                        value={null}
                      />
                      <br />
                      <Ul>
                        {map(state.srs, (id, key) => (
                          <Li key={id}>
                            {renderXoItemFromId(id)}{' '}
                            {!isEmpty(srsById) &&
                              state.crMode &&
                              get(() => srsById[id].SR_type) === 'lvm' && (
                                <ThinProvisionedTip label='crOnThickProvisionedSrWarning' />
                              )}
                            <div className='pull-right'>
                              <DeleteOldBackupsFirst
                                handler={effects.setTargetDeleteFirst}
                                handlerParam={id}
                                value={get(
                                  () => state.settings[id].deleteFirst
                                )}
                              />{' '}
                              <ActionButton
                                btnStyle='danger'
                                icon='delete'
                                size='small'
                                handler={effects.deleteSr}
                                handlerParam={key}
                              />
                            </div>
                          </Li>
                        ))}
                      </Ul>
                    </FormGroup>
                  </CardBlock>
                </Card>
              )}
              <Card>
                <CardHeader>
                  {_('newBackupSettings')}
                  <ActionButton
                    className='pull-right'
                    data-mode='_displayAdvancedSettings'
                    handler={effects.toggleDisplayAdvancedSettings}
                    icon={
                      state.displayAdvancedSettings ? 'toggle-on' : 'toggle-off'
                    }
                    iconColor={
                      state.displayAdvancedSettings ? 'text-success' : undefined
                    }
                    size='small'
                  >
                    {_('newBackupAdvancedSettings')}
                  </ActionButton>
                </CardHeader>
                <CardBlock>
                  <FormGroup>
                    <label htmlFor={state.inputReportWhenId}>
                      <strong>{_('reportWhen')}</strong>
                    </label>{' '}
                    <Tooltip content={_('pluginsWarning')}>
                      <Link
                        className='btn btn-primary btn-sm'
                        target='_blank'
                        to='/settings/plugins'
                      >
                        <Icon icon='menu-settings-plugins' />{' '}
                        <strong>{_('pluginsSettings')}</strong>
                      </Link>
                    </Tooltip>
                    <Select
                      id={state.inputReportWhenId}
                      labelKey='label'
                      onChange={effects.setReportWhen}
                      optionRenderer={getOptionRenderer}
                      options={REPORT_WHEN_FILTER_OPTIONS}
                      required
                      value={reportWhen}
                      valueKey='value'
                    />
                  </FormGroup>
                  {state.displayAdvancedSettings && (
                    <div>
                      <FormGroup>
                        <label htmlFor={state.inputConcurrencyId}>
                          <strong>{_('concurrency')}</strong>
                        </label>
                        <Number
                          id={state.inputConcurrencyId}
                          onChange={effects.setConcurrency}
                          value={concurrency}
                        />
                      </FormGroup>
                      <FormGroup>
                        <label htmlFor={state.inputTimeoutId}>
                          <strong>{_('timeout')}</strong>
                        </label>{' '}
                        <Tooltip content={_('timeoutInfo')}>
                          <Icon icon='info' />
                        </Tooltip>
                        <Number
                          id={state.inputTimeoutId}
                          onChange={effects.setTimeout}
                          value={timeout && timeout / 3600e3}
                          placeholder={formatMessage(messages.timeoutUnit)}
                        />
                      </FormGroup>
                      {state.isDelta && (
                        <FormGroup>
                          <label htmlFor={state.inputFullIntervalId}>
                            <strong>{_('fullBackupInterval')}</strong>
                          </label>{' '}
                          <Number
                            id={state.inputFullIntervalId}
                            onChange={effects.setFullInterval}
                            value={fullInterval}
                          />
                        </FormGroup>
                      )}
                      {state.isFull && (
                        <FormGroup>
                          <label htmlFor={state.compressionId}>
                            <strong>{_('compression')}</strong>
                          </label>
                          <SelectCompression
                            id={state.compressionId}
                            onChange={effects.setCompression}
                            value={compression}
                          />
                        </FormGroup>
                      )}
                      <FormGroup>
                        <label>
                          <strong>{_('offlineSnapshot')}</strong>{' '}
                          <Tooltip content={_('offlineSnapshotInfo')}>
                            <Icon icon='info' />
                          </Tooltip>{' '}
                          <input
                            checked={offlineSnapshot}
                            onChange={effects.setOfflineSnapshot}
                            type='checkbox'
                          />
                        </label>
                      </FormGroup>
                    </div>
                  )}
                </CardBlock>
              </Card>
            </Col>
            <Col mediumSize={6}>
              <Card>
                <CardHeader>
                  {_('vmsToBackup')}*{' '}
                  <ThinProvisionedTip label='vmsOnThinProvisionedSrTip' />
                  <ActionButton
                    className='pull-right'
                    data-mode='smartMode'
                    handler={effects.toggleMode}
                    icon={state.smartMode ? 'toggle-on' : 'toggle-off'}
                    iconColor={state.smartMode ? 'text-success' : undefined}
                    size='small'
                  >
                    {_('smartBackupModeTitle')}
                  </ActionButton>
                </CardHeader>
                <CardBlock>
                  <span className='text-muted'>
                    <Icon icon='info' />{' '}
                    {_('deltaBackupOnOutdatedXenServerWarning')}
                  </span>

                  {state.smartMode ? (
                    <Upgrade place='newBackup' required={3}>
                      <SmartBackup
                        deltaMode={state.isDelta}
                        onChange={effects.onVmsPatternChange}
                        pattern={state.vmsPattern}
                      />
                    </Upgrade>
                  ) : (
                    <FormFeedback
                      component={SelectVm}
                      message={_('missingVms')}
                      multi
                      onChange={effects.setVms}
                      error={missingVms}
                      value={state.vms}
                      predicate={state.vmPredicate}
                    />
                  )}
                </CardBlock>
              </Card>
              <Schedules
                handlerSchedules={effects.setSchedules}
                handlerSettings={effects.setSettings}
                missingRetentions={
                  missingExportRetention ||
                  missingCopyRetention ||
                  missingSnapshotRetention
                }
                missingSchedules={missingSchedules}
                retentions={state.retentions}
                schedules={state.schedules}
                settings={state.settings}
              />
            </Col>
          </Row>
          <Row>
            <Card>
              <CardBlock>
                {state.paramsUpdated ? (
                  <ActionButton
                    btnStyle='primary'
                    form={state.formId}
                    handler={effects.editJob}
                    icon='save'
                    redirectOnSuccess={
                      state.isJobInvalid ? undefined : '/backup-ng'
                    }
                    size='large'
                  >
                    {_('formSave')}
                  </ActionButton>
                ) : (
                  <ActionButton
                    btnStyle='primary'
                    form={state.formId}
                    handler={effects.createJob}
                    icon='save'
                    redirectOnSuccess={
                      state.isJobInvalid ? undefined : '/backup-ng'
                    }
                    size='large'
                  >
                    {_('formCreate')}
                  </ActionButton>
                )}
                <ActionButton
                  handler={effects.resetJob}
                  icon='undo'
                  className='pull-right'
                  size='large'
                >
                  {_('formReset')}
                </ActionButton>
              </CardBlock>
            </Card>
          </Row>
        </Container>
      </form>
    )
  },
])
