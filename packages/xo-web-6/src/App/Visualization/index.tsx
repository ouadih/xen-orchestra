import React, { Component } from 'react'
import {
  XAxis,
  YAxis,
  AreaChart,
  Area,Tooltip,Legend
} from 'recharts'

// import dataJson from './dump.json'
import { any } from 'prop-types'
import { statement } from '@babel/template'

import Xo from 'xo-lib'

const NB_VALUES = 118

const xo = new Xo({ url: '/' })
console.log(xo)
xo.open().then(() => xo.signIn({ email: 'admin@admin.net', password: 'admin' }))
const signedIn = new Promise(resolve => xo.once('authenticated', resolve))
const xoCall = (method, params) => signedIn.then(() => xo.call(method, params))

// xoCall('vm.stats', { id: '402b4559-217c-e9df-53b8-b548c2616e92' }).then(
//   stats => console.log(stats)
// )

export default class Visualization extends Component<any, any> {
  state: any = {
    data: [],
  }

  componentDidMount() {
    setInterval(this.fetchStats, 5e3)
  }

  fetchStats = () => {
    xoCall('vm.stats', { id: 'fa199710-8857-e0db-13d0-47aac98595cc' }).then(
      ({ endTimestamp, stats: { cpus }, interval }) => {
        let start = endTimestamp - NB_VALUES * interval
        const cpus0 = cpus[0]
        const cpus1= cpus[1]
        //const cpus1 = cpus[1]
        const data = cpus0.map(value => ({ cpu0: value, time: start += interval }))
        //const data = cpus1.map(value => ({cpu1:value,time:start +=interval}))
        //const data = cpus1.map(value => ({cpu1:value, time:start += interval}))
        this.setState({ data })
      }
    )
  }

  render() {
    return (
      <div>
        <AreaChart
          width={720}
          height={300}
          data={this.state.data}
        >
          <XAxis dataKey='time' />
          <YAxis />
          <Tooltip />
          <Legend />
          <Area
            isAnimationActive={false}
            type='monotone'
            dataKey='cpu1'
            stroke='#8884d8'
            fillOpacity={1}
            fill='#8884d8'
          />
        </AreaChart>
      </div>
    )
  }
}
