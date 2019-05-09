import _ from 'intl'
import Component from 'base-component'
import contractStats from 'contract-stats'
import Icon from 'icon'
import React from 'react'
import SelectGranularity, { LAST_DAY, LAST_WEEK } from 'select-granularity'
import Tooltip from 'tooltip'
import { connectStore } from 'utils'
import { Container, Row, Col } from 'grid'
import { createGetObjectsOfType, createSelector } from 'selectors'
import { fetchHostStats } from 'xo'
import { map } from 'lodash'
import { Toggle } from 'form'
import {
  PoolCpuLineChart,
  PoolMemoryLineChart,
  PoolPifLineChart,
  PoolLoadLineChart,
} from 'xo-line-chart'

@connectStore({
  hosts: createGetObjectsOfType('host').filter(
    createSelector(
      (state, props) => props.pool.id,
      poolId => host => host.power_state === 'Running' && host.$pool === poolId
    )
  ),
})
export default class PoolStats extends Component {
  state = {
    granularity: 'seconds',
    useCombinedValues: false,
  }

  _loop = () => {
    if (this.cancel) {
      this.cancel()
    }

    let cancelled = false
    this.cancel = () => {
      cancelled = true
    }

    const { granularity } = this.state
    const isLastDayGranularity = granularity === LAST_DAY
    Promise.all(
      map(this.props.hosts, host =>
        fetchHostStats(
          host,
          isLastDayGranularity ? LAST_WEEK : granularity
        ).then(hostStats => {
          if (isLastDayGranularity) {
            contractStats(hostStats.stats, 24)
          }
          return {
            host: host.name_label,
            ...hostStats,
          }
        })
      )
    ).then(stats => {
      if (cancelled || !stats[0]) {
        return
      }
      this.cancel = null

      clearTimeout(this.timeout)
      this.setState(
        {
          stats,
          selectStatsLoading: false,
        },
        () => {
          this.timeout = setTimeout(this._loop, stats[0].interval * 1000)
        }
      )
    })
  }

  componentDidMount() {
    this._loop()
  }

  componentWillUnmount() {
    clearTimeout(this.timeout)
  }

  _handleSelectStats = granularity => {
    clearTimeout(this.timeout)
    this.setState(
      {
        granularity,
        selectStatsLoading: true,
      },
      this._loop
    )
  }

  render() {
    const {
      granularity,
      selectStatsLoading,
      stats,
      useCombinedValues,
    } = this.state

    return stats ? (
      <Container>
        <Row>
          <Col mediumSize={5}>
            <div className='form-group'>
              <Tooltip content={_('useStackedValuesOnStats')}>
                <Toggle
                  value={useCombinedValues}
                  onChange={this.linkState('useCombinedValues')}
                />
              </Tooltip>
            </div>
          </Col>
          <Col mediumSize={1}>
            {selectStatsLoading && (
              <div className='text-xs-right'>
                <Icon icon='loading' size={2} />
              </div>
            )}
          </Col>
          <Col mediumSize={6}>
            <SelectGranularity
              onChange={this._handleSelectStats}
              value={granularity}
            />
          </Col>
        </Row>
        <Row>
          <Col mediumSize={6}>
            <h5 className='text-xs-center'>
              <Icon icon='cpu' /> {_('statsCpu')}
            </h5>
            <PoolCpuLineChart addSumSeries={useCombinedValues} data={stats} />
          </Col>
          <Col mediumSize={6}>
            <h5 className='text-xs-center'>
              <Icon icon='memory' /> {_('statsMemory')}
            </h5>
            <PoolMemoryLineChart
              addSumSeries={useCombinedValues}
              data={stats}
            />
          </Col>
        </Row>
        <br />
        <hr />
        <Row>
          <Col mediumSize={6}>
            <h5 className='text-xs-center'>
              <Icon icon='network' /> {_('statsNetwork')}
            </h5>
            {/* key: workaround that unmounts and re-mounts the chart to make sure the legend updates when toggling "stacked values"
              FIXME: remove key prop once this issue is fixed: https://github.com/CodeYellowBV/chartist-plugin-legend/issues/5 */}
            <PoolPifLineChart
              key={useCombinedValues ? 'stacked' : 'unstacked'}
              addSumSeries={useCombinedValues}
              data={stats}
            />
          </Col>
          <Col mediumSize={6}>
            <h5 className='text-xs-center'>
              <Icon icon='disk' /> {_('statLoad')}
            </h5>
            <PoolLoadLineChart addSumSeries={useCombinedValues} data={stats} />
          </Col>
        </Row>
      </Container>
    ) : (
      <p>{_('poolNoStats')}</p>
    )
  }
}
