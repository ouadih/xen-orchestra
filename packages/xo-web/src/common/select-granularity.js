import PropTypes from 'prop-types'
import React from 'react'

import _ from './intl'
import Select from './form/select'

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
    label: _('statLastWeek'),
    value: 'hours',
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
