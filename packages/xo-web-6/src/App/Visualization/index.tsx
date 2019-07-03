import React, { Component } from 'react'
import {
  XAxis,
  YAxis,
  AreaChart,
  //Area,
  Tooltip,
  Legend,
} from 'recharts'
import moment from 'moment'

import { Area, Brush, CartesianGrid } from 'recharts'
import dataJson from './dump.json'
import { any } from 'prop-types'
import { statement } from '@babel/template'

import Xo from 'xo-lib'
import { removeProperties } from '@babel/types';
import { setTimeout } from 'timers';
import { start } from 'repl';

interface AreaColor {
  key: string;
  value: string;
}

const NB_VALUES = 118

const xo = new Xo({ url: '/' })
xo.open().then(() => xo.signIn({ email: 'admin@admin.net', password: 'admin' }))
const signedIn = new Promise(resolve => xo.once('authenticated', resolve))
const xoCall = (method, params) => signedIn.then(() => xo.call(method, params))

export default class Visualization extends Component<any, any> {
  state: any = {
    //VM
    data: [],
    dataMemory: [],
    dataXvds: [],
    dataVifs: [],

    propertiesCpus: [],
    propertiesXvds: [],
    propertiesXvdsR: [],
    propertiesVifs: [],
    propertiesVifsR: [],

    //Host
    dataHostCpu: [],
    propertiesHostCpus: []
  }

  colors: AreaColor[] = [];

  componentDidMount() {
    console.log('here')
    console.log('did mount', this.state.propertiesHostCpus)
    setInterval(this.fetchVmStats.bind(this), 5e3);
    setInterval(this.fetchHostStats.bind(this), 5e3);
  }

  fetchVmStats = () => {
    xoCall('vm.stats', { id: '28851ef6-951c-08bc-a5be-8898e2a31b7a' }).then(
      ({ endTimestamp, stats: { cpus }, interval, stats: { memory },
        stats: { xvds }, stats: { vifs } }) => {

        let start = endTimestamp - NB_VALUES * interval
        this.state.propertiesCpus = Object.getOwnPropertyNames(cpus).filter(value => value !== 'length');
        this.state.propertiesXvds = Object.getOwnPropertyNames(xvds.w).filter(value => value !== 'length');
        this.state.propertiesXvdsR = Object.getOwnPropertyNames(xvds.r).filter(value => value !== 'length');
        this.state.propertiesVifs = Object.getOwnPropertyNames(vifs.tx).filter(value => value !== 'length');
        this.state.propertiesVifsR = Object.getOwnPropertyNames(vifs.rx).filter(value => value !== 'length');

        const data: any[] = [];
        const dataMemory: any[] = [];
        const dataXvds: any[] = [];
        const dataVifs: any[] = [];

        for (var i = 0; i < NB_VALUES; i++) {

          const tmpValue: any = {};
          const tmpValueMemory: any = {}
          const tmpValueW: any = {}
          const tmpValueTx: any = {}
          tmpValue.time = moment(start += interval).format('LTS')

          this.state.propertiesCpus.forEach((property: string | number) => {
            tmpValue[`cpu${property}`] = cpus[property][i];
          })

          this.state.propertiesXvds.forEach((property: string | number) => {
            tmpValueW[`xvds_w_${property}`] = xvds.w[property][i];

          })

          this.state.propertiesXvdsR.forEach((property: string | number) => {
            tmpValueW[`xvds_R_${property}`] = xvds.r[property][i];

          })

          this.state.propertiesVifs.forEach((property: string | number) => {
            tmpValueTx[`vifs_tx_${property}`] = vifs.tx[property][i];

          })

          this.state.propertiesVifsR.forEach((property: string | number) => {
            tmpValueTx[`vifs_rx_${property}`] = vifs.rx[property][i];

          })

          tmpValueMemory.time = tmpValue.time;
          tmpValueMemory.memory = memory[i]
          tmpValueW.time = tmpValue.time;
          tmpValueTx.time = tmpValue.time;
          dataMemory.push(tmpValueMemory);
          data.push(tmpValue);
          dataXvds.push(tmpValueW);
          dataVifs.push(tmpValueTx);
        }
        this.setState({ data, dataMemory, dataXvds, dataVifs })
      }
    )
  }


  fetchHostStats = () => {
    // const propertiesHostCpus = this.state.propertiesHostCpus
    xoCall('host.stats', { host: 'b54bf91f-51d7-4af5-b1b3-f14dcf1146ee' }).then(
      ({ endTimestamp, stats: { cpus }, interval }) => {

        let start = endTimestamp - NB_VALUES * interval
        // this.state.propertiesHostCpu = Object.keys(cpus).filter(value => value !== 'length');
        this.setState({ propertiesHostCpus: Object.keys(cpus) })

        const dataHostCpu: any[] = [];

        for (var i = 0; i < NB_VALUES; i++) {

          const tmpValueHost: any = {};

          tmpValueHost.time = moment(start += interval).format('LTS')

          this.state.propertiesHostCpus.forEach((property: string | number) => {
            tmpValueHost[`cpu${property}`] = cpus[property][i];
          })

          dataHostCpu.push(tmpValueHost);
        }
        this.setState({ dataHostCpu });
      }
    )
  }

  render() {

    console.log(this.state.propertiesHostCpu)

    const colors = ['#ADD83B', '#D83BB7'];

    const allColors = ['#493BD8', '#ADD83B', '#D83BB7', '#3BC1D8', '#3BD8AB', '#667772', '#FA8072', '#800080']

    return (
      <div>
        <div>
          <h2>VMs stats </h2>
        </div>
        <div>
          CPU usage (%)
      </div>
        <br></br>
        <div>
          <AreaChart
            width={720}
            height={300}
            data={this.state.data}
            margin={{
              top: 5, right: 20, left: 90, bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey='time' />
            <YAxis />
            <Tooltip />
            <Brush />
            <Legend />
            {
              (this.state.propertiesCpus
                .map((currProperty: any) => `cpu${currProperty}`).map((property: any, index: any) => <Area connectNulls isAnimationActive={false} type="monotone" dataKey={property} stroke={allColors[index]} fill={allColors[index]} />))
            }
          </AreaChart>
        </div>
        <br></br>
        <br></br>
        <div>
          Memory  (MiB)
      </div>
        <br></br>
        <div>
          <AreaChart
            width={720}
            height={300}
            data={this.state.dataMemory}
            margin={{
              top: 5, right: 20, left: 90, bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey='time' />
            <YAxis />
            <Tooltip />
            <Brush />
            <Legend />
            <Area type="monotone" dataKey="memory" stroke="#493BD8" fill="#493BD8" />
          </AreaChart>
        </div>
        <br></br>
        <br></br>
        <div>
          Disk throughput (KiB)
      </div>
        <br></br>
        <div>
          <AreaChart
            width={720}
            height={300}
            data={this.state.dataXvds}
            margin={{
              top: 5, right: 20, left: 90, bottom: 5,
            }}

          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey='time' />
            <YAxis />
            <Tooltip />
            <Brush />
            <Legend />
            {
              (this.state.propertiesXvds
                .map((currProperty: any) => `xvds_w_${currProperty}`).map((property: any, index: any) => <Area connectNulls isAnimationActive={false} type="monotone" dataKey={property} stroke={allColors[index]} fill={allColors[index]} />))

            }
            {
              (this.state.propertiesXvdsR
                .map((currProperty: any) => `xvds_R_${currProperty}`).map((property: any, index: any) => <Area connectNulls isAnimationActive={false} type="monotone" dataKey={property} stroke={colors[index]} fill={colors[index]} />))

            }

          </AreaChart>
        </div>
        <br></br>
        <br></br>
        <div>
          Network throughput (KiB)
      </div>
        <br></br>
        <div>
          <AreaChart
            width={720}
            height={300}
            data={this.state.dataVifs}
            margin={{
              top: 5, right: 20, left: 90, bottom: 5,
            }}

          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey='time' />
            <YAxis />
            <Tooltip />
            <Brush />
            <Legend />
            {
              (this.state.propertiesVifs
                .map((currProperty: any) => `vifs_tx_${currProperty}`).map((property: any, index: any) => <Area connectNulls isAnimationActive={false}
                  type="monotone" dataKey={property} stroke={allColors[index]} fill={allColors[index]} />))
            }
            {
              (this.state.propertiesVifsR.map((currProperty: any) =>
                `vifs_rx_${currProperty}`).map((property: any, index: any) => <Area connectNulls isAnimationActive={false}
                  type="monotone" dataKey={property} stroke={colors[index]} fill={colors[index]} />))
            }
          </AreaChart>
        </div>
        <br></br>
        <div>
          <h2>Host stats </h2>
        </div>
        <br></br>
        <div>CPU usage (%)</div>

        <div>
          <AreaChart
            width={720}
            height={300}
            data={this.state.dataHostCpu}
            margin={{
              top: 5, right: 20, left: 90, bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey='time' />
            <YAxis />
            <Tooltip />
            <Brush />
            <Legend />
            {
              (this.state.propertiesHostCpus
                .map((currProperty: any) => `cpu${currProperty}`).map((property: any, index: any) => <Area connectNulls isAnimationActive={false} type="monotone" dataKey={property} stroke={allColors[index]} fill={allColors[index]} />))
            }
          </AreaChart>
        </div>

        <div>Network throughput (KiB)</div>
        <div>Memory usage (GiB)</div>
        <div>Load average (KiB)</div>
        <br></br>
        <div>
          <h2>SR stats </h2>
        </div>
        <br></br>
        <div>IOPS (IOPS)</div>
        <div>Latency (ms)</div>
        <div>IO throughput (MiB/s)</div>
        <div>IOwait (%) </div>
      </div>

    )
  }
}