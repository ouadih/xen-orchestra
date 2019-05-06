import _ from 'intl'
import defined from '@xen-orchestra/defined'
import Icon from 'icon'
import PropTypes from 'prop-types'
import React from 'react'
import { provideState, injectState } from 'reaclette'

import decorate from './apply-decorators'
import Select from './form/select'

const SelectCoresPerSocket = decorate([
  provideState({
    computed: {
      coresPerSocketPossibilities: (state, { maxCores, maxVCpus, vCpus }) => {
        if (defined(maxCores, maxVCpus, vCpus) === undefined) {
          return
        }

        const ratio = vCpus / maxVCpus
        const options = []
        for (
          let coresPerSocket = maxCores;
          coresPerSocket >= ratio;
          coresPerSocket--
        ) {
          if (vCpus % coresPerSocket === 0) {
            options.push(coresPerSocket)
          }
        }

        return options
      },
      invalidValue: ({ coresPerSocketPossibilities = [] }, { value = '' }) =>
        value !== '' && coresPerSocketPossibilities.indexOf(value) === -1,
      options: (
        { coresPerSocketPossibilities = [], invalidValue },
        { vCpus, value }
      ) => [
        {
          label: _('vmChooseCoresPerSocket'),
          value: '',
        },
        ...(invalidValue
          ? [value, ...coresPerSocketPossibilities]
          : coresPerSocketPossibilities
        ).map(coresPerSocket => ({
          label: _('vmCoresPerSocket', {
            nSockets: vCpus / coresPerSocket,
            nCores: coresPerSocket,
          }),
          value: coresPerSocket,
        })),
      ],
    },
  }),
  injectState,
  ({ state, onChange, value = '', ...props }) => (
    <span>
      <Select
        {...props}
        options={state.options}
        onChange={onChange}
        required
        simpleValue
        value={value}
      />
      {state.invalidValue && (
        <span className='text-danger'>
          <Icon icon='error' /> {_('vmCoresPerSocketIncorrectValue')}
        </span>
      )}
    </span>
  ),
])

SelectCoresPerSocket.propTypes = {
  maxCores: PropTypes.number,
  maxVCpus: PropTypes.number,
  onChange: PropTypes.func.isRequired,
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  vCpus: PropTypes.number,
}

export { SelectCoresPerSocket as default }
