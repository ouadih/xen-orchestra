import PropTypes from 'prop-types'
import React from 'react'

import _ from './intl'
import Select from './form/select'

export const LAST_DAY = 'lastDay'
export const LAST_WEEK = 'hours'

const OPTIONS = [
  {
    label: _('statLastTenMinutes'),
    value: 'seconds',
  },
  {
    label: _('statLastTwoHours'),
    value: 'minutes',
  },
  {
    label: _('statLastDay'),
    value: LAST_DAY,
  },
  {
    label: _('statLastWeek'),
    value: LAST_WEEK,
  },
  {
    label: _('statLastYear'),
    value: 'days',
  },
]

const SelectGranularity = ({ onChange, value, ...props }) => (
  <Select
    {...props}
    onChange={onChange}
    options={OPTIONS}
    required
    simpleValue
    value={value}
  />
)

SelectGranularity.propTypes = {
  onChange: PropTypes.func.isRequired,
  value: PropTypes.array.isRequired,
}

export { SelectGranularity as default }
