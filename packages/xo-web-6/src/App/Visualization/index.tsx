import React, { Component } from 'react'
import {
  XAxis,
  YAxis,
  AreaChart,
  //Area,
  Tooltip,
  Legend,
  ReferenceLine,ResponsiveContainer
} from 'recharts'
import moment from 'moment'

import { Area, Brush, CartesianGrid } from 'recharts'
//import dataJson from './dump.json'
import { any, string } from 'prop-types'
import { statement } from '@babel/template'

import Xo from 'xo-lib'
import { removeProperties } from '@babel/types';
import { setTimeout } from 'timers';
import { start } from 'repl';
import { getMaxListeners } from 'cluster';
import { stackOffsetNone, stackOffsetSilhouette, stack } from 'd3-shape';

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

    propCpus: [],
    propXvds: [],
    propXvdsR: [],
    propVifs: [],
    propVifsR: [],

    //Host
    dataHostCpu: [],
    dataLoad: [],
    dataHostMemory: [],
    dataHostPifs: [],

    propHostCpus: [],
    propHostLoad: [],
    propHostpifs: [],
    propHostpifsTx: [],

    //SR
    dataSrIops: [],
    propertiesSrIops: [],

    dataSrLatency: [],
    propertiesSrLatency: [],

    dataSrIowait: [],
    propertiesSrIowait: [],


    dataSrThro: [],
    propertiesSrThro: [],

    interval: 50,
    format: 'LTS',


    //startIndex  && endIndex
    startIndexCpuVm: 0,
    endIndexCpuVm: 0,

    startIndexMemoryVm: 0,
    endIndexMemoryVm: 0,

    startIndexDiskVm: 0,
    endIndexDiskVm: 0,

    startIndexNetworkVm: 0,
    endIndexNetworkVm: 0,

    startIndexCpuHost: 0,
    endIndexCpuHost: 0,

    startIndexNetworkHost: 0,
    endIndexNetworkHost: 0,

    startIndexMemoryHost: 0,
    endIndexMemoryHost: 0,

    startIndexLoadHost: 0,
    endIndexLoadHost: 0,

    startIndexIopsSR: 0,
    endIndexIopsSR: 0,

    startIndexLatencySR: 0,
    endIndexLatencySR: 0,

    startIndexIOSR: 0,
    endIndexIOSR: 0,

    startIndexIOwaitSR: 0,
    endIndexIOwaitSR: 0
  }



  colors: AreaColor[] = [];


  handleChangeCpuVm = (res: any) => {
    this.state.startIndexCpuVm = res['startIndex'];
    this.state.endIndexCpuVm = res['endIndex']
   
  };

  handleChangeMemoryVm = (res: any) => {
    this.state.startIndexMemoryVm = res['startIndex'];
    this.state.endIndexMemoryVm = res['endIndex']
    
  };


  handleChangeDiskVm = (res: any) => {
    this.state.startIndexDiskVm = res['startIndex'];
    this.state.endIndexDiskVm = res['endIndex']
  
  };

  handleChangeNetworkVm = (res: any) => {
    this.state.startIndexNetworkVm = res['startIndex'];
    this.state.endIndexNetworkVm = res['endIndex']
  
  };

  handleChangeCpuHost  = (res: any) => {
    this.state.startIndexCpuHost = res['startIndex'];
    this.state.endIndexCpuHost = res['endIndex']
    
  };

  handleChangeNetworkHost = (res: any) => {
    this.state.startIndexNetworkHost = res['startIndex'];
    this.state.endIndexNetworkHost = res['endIndex']
    
  };

  handleChangeMemoryHost = (res: any) => {
    this.state.startIndexMemoryHost = res['startIndex'];
    this.state.endIndexMemoryHost = res['endIndex']
    
  };
  handleChangeLoadHost = (res: any) => {
    this.state.startIndexLoadHost = res['startIndex'];
    this.state.endIndexLoadHost = res['endIndex']
    
  };

  handleChangeIopsSR = (res: any) => {
    this.state.startIndexIopsSR = res['startIndex'];
    this.state.endIndexIopsSR = res['endIndex']
    
  };
  handleChangeLatencySR = (res: any) => {
    this.state.startIndexLatencySR = res['startIndex'];
    this.state.endIndexLatencySR = res['endIndex']
    
  };
  handleChangeIOSR = (res: any) => {
    this.state.startIndexIOSR = res['startIndex'];
    this.state.endIndexIOSR = res['endIndex']  
  };
  handleChangeIOwaitSR = (res: any) => {
    this.state.startIndexIOwaitSR = res['startIndex'];
    this.state.endIndexIOwaitSR = res['endIndex']
    
  };


  getPercent = (value: any, total: any) => {
    const ratio = total > 0 ? value / total : 0;

    return this.toPercent(ratio, 2);
  };
  toPercent = (decimal: any, fixed = 0) => `${(decimal * 100).toFixed(fixed)}%`;
  renderTooltipContent = (o: any) => {
    const { payload, label } = o;
    const total = payload.reduce((result: any, entry: any) => (result + entry.value), 0);

    return (
      <div className="customized-tooltip-content">
        <p className="total">{`${label} (Total: ${total})`}</p>
        <ul className="list">
          {
            payload.map((entry: any, index: any) => (
              <li key={`item-${index}`} style={{ color: entry.color }}>
                {`${entry.name}: ${entry.value}(${this.getPercent(entry.value, total)})`}
              </li>
            ))
          }
        </ul>
      </div>
    );
  };
  componentDidMount() {

    setInterval(this.fetchVmStats.bind(this), 5e3);
    setInterval(this.fetchHostStats.bind(this), 5e3);
    setInterval(this.fetchSrStats.bind(this), 5e3);

  }
  setTime(value: number, format: string) {
    this.setState({ interval: value, format })
  }


  fetchSrStats = () => {
    xoCall('sr.stats', { id: 'a5954951-3dfa-42b8-803f-4bc270b22a0b' }).then(
      ({ endTimestamp, stats: { iops }, stats: { latency }, stats: { iowait }, stats: { ioThroughput } }) => {
        //interval = this.getWeek
        //let interval =this.getMinutes()
        //interval = this.getHours
        //interval = this.getMinutes
        //interval = this.getWeek

        let start = endTimestamp - NB_VALUES * this.state.interval * 1000
        //let start = endTimestamp-NB_VALUES*this.getHours.arguments
        this.setState({ propertiesSrIops: Object.keys(iops) })
        this.setState({ propertiesSrLatency: Object.keys(latency) })
        this.setState({ propertiesSrIowait: Object.keys(iowait) })
        this.setState({ propertiesSrThro: Object.keys(ioThroughput) })

        const dataSrIops: any[] = [];
        const dataSrLatency: any[] = [];
        const dataSrIowait: any[] = [];
        const dataSrThro: any[] = [];

        for (var i = 0; i < NB_VALUES; i++) {

          const tmpValueSrIops: any = {};
          const tmpValueSrLatency: any = {};
          const tmpValueSrIowait: any = {};
          const tmpValueSrThro: any = {};

          tmpValueSrIops.time = moment(start += this.state.interval).format(this.state.format)

          this.state.propertiesSrIops.forEach((property: string | number) => {
            tmpValueSrIops[`iops_${property}`] = iops[property][i];
          })
          this.state.propertiesSrLatency.forEach((property: string | number) => {
            tmpValueSrLatency[`latency_${property}`] = latency[property][i];
          })
          this.state.propertiesSrIowait.forEach((property: string | number) => {
            tmpValueSrIowait[`iowait_${property}`] = iowait[property][i];
          })

          this.state.propertiesSrThro.forEach((property: string | number) => {
            tmpValueSrThro[`throughput_${property}`] = ioThroughput[property][i];
          })

          tmpValueSrLatency.time = tmpValueSrIops.time
          tmpValueSrIowait.time = tmpValueSrIops.time
          tmpValueSrThro.time = tmpValueSrIops.time


          dataSrIops.push(tmpValueSrIops);
          dataSrLatency.push(tmpValueSrLatency);
          dataSrIowait.push(tmpValueSrIowait);
          dataSrThro.push(tmpValueSrThro)
        }
        this.setState({ dataSrIops, dataSrLatency, dataSrIowait, dataSrThro })
      })

  }
  fetchVmStats = () => {
    xoCall('vm.stats', { id: '28851ef6-951c-08bc-a5be-8898e2a31b7a' }).then(
      ({ endTimestamp, stats: { cpus }, interval, stats: { memory },
        stats: { xvds }, stats: { vifs } }) => {

        //let interval =this.getHours()
        let start = endTimestamp - NB_VALUES * this.state.interval * 1000
        this.setState({ propCpus: Object.keys(cpus) })
        this.setState({ propXvds: Object.keys(xvds.w) })
        this.setState({ propXvdsR: Object.keys(xvds.r) })
        this.setState({ propVifs: Object.keys(vifs.tx) })
        this.setState({ propVifsR: Object.keys(vifs.rx) })

        const data: any[] = [];
        const dataMemory: any[] = [];
        const dataXvds: any[] = [];
        const dataVifs: any[] = [];

        for (var i = 0; i < NB_VALUES; i++) {

          const tmpValue: any = {};
          const tmpValueMemory: any = {}
          const tmpValueW: any = {}
          const tmpValueTx: any = {}
          // tmpValue.time = start += interval
          tmpValue.time = moment(start += this.state.interval).format(this.state.format)

          this.state.propCpus.forEach((property: string | number) => {
            tmpValue[`cpu${property}`] = cpus[property][i];
          })

          this.state.propXvds.forEach((property: string | number) => {
            tmpValueW[`xvds_w_${property}`] = xvds.w[property][i];

          })

          this.state.propXvdsR.forEach((property: string | number) => {
            tmpValueW[`xvds_R_${property}`] = xvds.r[property][i];

          })

          this.state.propVifs.forEach((property: string | number) => {
            tmpValueTx[`vifs_tx_${property}`] = vifs.tx[property][i];

          })

          this.state.propVifsR.forEach((property: string | number) => {
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

    xoCall('host.stats', { host: 'b54bf91f-51d7-4af5-b1b3-f14dcf1146ee' }).then(
      ({ endTimestamp, stats: { cpus }, interval, stats: { load }, stats: { memory }, stats: { pifs } }) => {

        //let interval = this.getWeek()

        let start = endTimestamp - NB_VALUES * this.state.interval * 1000

        this.setState({ propHostCpus: Object.keys(cpus) })
        this.setState({ propHostpifs: Object.keys(pifs.rx) })
        this.setState({ propHostpifsTx: Object.keys(pifs.tx) })

        const dataHostCpu: any[] = [];
        const dataLoad: any[] = [];
        const dataHostMemory: any[] = [];
        const dataHostPifs: any[] = [];

        for (var i = 0; i < NB_VALUES; i++) {

          const tmpValueHost: any = {};
          const tmpValueLoad: any = {};
          const tmpValueHostMemory: any = {};
          const tmpValueHostPifs: any = {};

          tmpValueHost.time = moment(start += this.state.interval).format(this.state.format)

          this.state.propHostCpus.forEach((property: string | number) => {
            tmpValueHost[`cpu${property}`] = cpus[property][i];
          })

          this.state.propHostpifs.forEach((property: string | number) => {
            tmpValueHostPifs[`pifs_rx_${property}`] = pifs.rx[property][i];
          })

          this.state.propHostpifsTx.forEach((property: string | number) => {
            tmpValueHostPifs[`pifs_tx_${property}`] = pifs.tx[property][i];
          })

          tmpValueLoad.time = tmpValueHost.time;
          tmpValueLoad.load = load[i]

          tmpValueHostMemory.time = tmpValueHost.time;
          tmpValueHostMemory.memory = memory[i];
          tmpValueHostPifs.time = tmpValueHost.time;

          dataHostCpu.push(tmpValueHost);
          dataLoad.push(tmpValueLoad);
          dataHostMemory.push(tmpValueHostMemory);
          dataHostPifs.push(tmpValueHostPifs);

        }
        this.setState({ dataHostCpu, dataLoad, dataHostMemory, dataHostPifs });
      }
    )
  }



  render() {

    const colors = ['#cee866', '#6f9393', '#bb97cd', '#8778db', '#2f760b', '#a9578a', '#C0C0C0', '#000080', '#000000', '#800000'];

    const allColors = ['#493BD8', '#ADD83B', '#D83BB7', '#3BC1D8', '#aabd8a', '#667772', '#FA8072', '#800080', '#00FF00', '#8abda7'];
    //const {startIndex, endIndex} = this.state
    return (
      <div>
        <div>
          <form>
            <select >
              <option></option>
              <option onClick={() => { this.setTime(50, 'LTS') }} >Last 5 secondes </option>
              <option onClick={() => { this.setTime(4800, 'LTS') }}>Last 10 minutes</option>
              <option onClick={() => { this.setTime(64800, 'LTS') }}>Last 2 hours </option>
              <option onClick={() => { this.setTime(5603200, 'l') }}>Last week </option>

            </select>
          </form>

        </div>
        <div>
          <h2>VMs stats </h2>
        </div>
        <div>
          CPU usage (%)
 </div>
        <br></br>
        <div>
        
          <AreaChart
            width={830}
            height={300}
            data={this.state.data}
            margin={{
              top: 5, right: 20, left: 90, bottom: 5,
            }}
          
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey='time' />
            {/* <YAxis tickFormatter={this.toPercent} /> */}
            <YAxis />
            <Tooltip />
            <Brush  onChange={this.handleChangeCpuVm} startIndex={this.state.startIndexCpuVm}
              endIndex={this.state.endIndexCpuVm}>
              <AreaChart
                width={830}
                height={300}
                data={this.state.data}
                
                margin={{
                  top: 5, right: 20, left: 90, bottom: 5,
                }}
              >
                {
                  (this.state.propCpus
                    .map((currProperty: any) => `cpu${currProperty}`).map((property: any, index: any) => <Area stackId="3" connectNulls isAnimationActive={false} type="monotone" dataKey={property} stroke={allColors[index]} fill={allColors[index]}/>))
                }
              </AreaChart>

            </Brush>
            <Legend iconType='rect' iconSize={18} />
            {
              (this.state.propCpus
                .map((currProperty: any) => `cpu${currProperty}`).map((property: any, index: any) => <Area stackId="3" connectNulls isAnimationActive={false} type="monotone" dataKey={property} stroke={allColors[index]} fill={allColors[index]} />))
            }
          </AreaChart>
        </div>
        <br></br>
        <br></br>
        <div>
          Memory (MiB)
 </div>
        <br></br>
        <div>
          <AreaChart
            width={830}
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
            <Brush  onChange={this.handleChangeMemoryVm} startIndex={this.state.startIndexMemoryVm}
              endIndex={this.state.endIndexMemoryVm}>
              <AreaChart width={830}
                height={300}
                data={this.state.dataMemory}
                margin={{
                  top: 5, right: 20, left: 90, bottom: 5,
                }}>
                <Area type="monotone" dataKey="memory" stroke="#493BD8" fill="#493BD8" />
              </AreaChart>
            </Brush>
            <Legend iconType='rect' iconSize={18} />
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
            width={830}
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
            <Brush  onChange={this.handleChangeDiskVm} startIndex={this.state.startIndexDiskVm}
              endIndex={this.state.endIndexDiskVm}>
              <AreaChart
                width={830}
                height={300}
                data={this.state.dataXvds}
                margin={{
                  top: 5, right: 20, left: 90, bottom: 5,
                }}
              >
                {
                  (this.state.propXvds
                    .map((currProperty: any) => `xvds_w_${currProperty}`).map((property: any, index: any) => <Area connectNulls isAnimationActive={false} type="monotone" dataKey={property} stroke={allColors[index]} fill={allColors[index]} />))

                }
                {
                  (this.state.propXvdsR
                    .map((currProperty: any) => `xvds_R_${currProperty}`).map((property: any, index: any) => <Area connectNulls isAnimationActive={false} type="monotone" dataKey={property} stroke={colors[index]} fill={colors[index]} />))

                }
              </AreaChart>

            </Brush>
            <Legend iconType='rect' iconSize={18} />
            {
              (this.state.propXvds
                .map((currProperty: any) => `xvds_w_${currProperty}`).map((property: any, index: any) => <Area connectNulls isAnimationActive={false} type="monotone" dataKey={property} stroke={allColors[index]} fill={allColors[index]} />))

            }
            {
              (this.state.propXvdsR
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
            width={830}
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
            <Brush  onChange={this.handleChangeNetworkVm} startIndex={this.state.startIndexNetworkVm}
              endIndex={this.state.endIndexNetworkVm}>
              <AreaChart
                width={830}
                height={300}
                data={this.state.dataVifs}
                margin={{
                  top: 5, right: 20, left: 90, bottom: 5,
                }}

              >
                {
                  (this.state.propVifs
                    .map((currProperty: any) => `vifs_tx_${currProperty}`).map((property: any, index: any) => <Area connectNulls isAnimationActive={false}
                      type="monotone" dataKey={property} stroke={allColors[index]} fill={allColors[index]} />))
                }
                {
                  (this.state.propVifsR.map((currProperty: any) =>
                    `vifs_rx_${currProperty}`).map((property: any, index: any) => <Area connectNulls isAnimationActive={false}
                      type="monotone" dataKey={property} stroke={colors[index]} fill={colors[index]} />))
                }
              </AreaChart>
            </Brush>
            <Legend iconType='rect' iconSize={18} />
            {
              (this.state.propVifs
                .map((currProperty: any) => `vifs_tx_${currProperty}`).map((property: any, index: any) => <Area connectNulls isAnimationActive={false}
                  type="monotone" dataKey={property} stroke={allColors[index]} fill={allColors[index]} />))
            }
            {
              (this.state.propVifsR.map((currProperty: any) =>
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
            width={830}
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
            <Brush  onChange={this.handleChangeCpuHost} startIndex={this.state.startIndexCpuHost}
              endIndex={this.state.endIndexCpuHost}>
              <AreaChart
                width={830}
                height={300}
                data={this.state.dataHostCpu}
                margin={{
                  top: 5, right: 20, left: 90, bottom: 5,
                }}
              >
                {
                  (this.state.propHostCpus
                    .map((currProperty: any) => `cpu${currProperty}`).map((property: any, index: any) => <Area stackId="3" connectNulls isAnimationActive={false} type="monotone" dataKey={property} stroke={allColors[index]} fill={allColors[index]} />))
                }
              </AreaChart>
            </Brush>
            <Legend iconType='rect' iconSize={18} />
            {
              (this.state.propHostCpus
                .map((currProperty: any) => `cpu${currProperty}`).map((property: any, index: any) => <Area stackId="3" connectNulls isAnimationActive={false} type="monotone" dataKey={property} stroke={allColors[index]} fill={allColors[index]} />))
            }
          </AreaChart>
        </div>

        <div>Network throughput (KiB)</div>
        <div>
          <AreaChart
            width={830}
            height={300}
            data={this.state.dataHostPifs}
            margin={{
              top: 5, right: 20, left: 90, bottom: 5,
            }}

          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey='time' />
            <YAxis />
            <Tooltip />
            <Brush  onChange={this.handleChangeNetworkHost} startIndex={this.state.startIndexNetworkHost}
              endIndex={this.state.endIndexNetworkHost}>
              <AreaChart
                width={830}
                height={300}
                data={this.state.dataHostPifs}
                margin={{
                  top: 5, right: 20, left: 90, bottom: 5,
                }}

              >
                {
                  (this.state.propHostpifs
                    .map((currProperty: any) => `pifs_rx_${currProperty}`).map((property: any, index: any) => <Area stackId="3" connectNulls isAnimationActive={false}
                      type="monotone" dataKey={property} stroke={allColors[index]} fill={allColors[index]} />))
                }
                {
                  (this.state.propHostpifsTx
                    .map((currProperty: any) => `pifs_tx_${currProperty}`).map((property: any, index: any) => <Area stackId="3" connectNulls isAnimationActive={false}
                      type="monotone" dataKey={property} stroke={colors[index]} fill={colors[index]} />))
                }
              </AreaChart>
            </Brush>
            <Legend iconType='rect' iconSize={18} />
            {
              (this.state.propHostpifs
                .map((currProperty: any) => `pifs_rx_${currProperty}`).map((property: any, index: any) => <Area stackId="3" connectNulls isAnimationActive={false}
                  type="monotone" dataKey={property} stroke={allColors[index]} fill={allColors[index]} />))
            }
            {
              (this.state.propHostpifsTx
                .map((currProperty: any) => `pifs_tx_${currProperty}`).map((property: any, index: any) => <Area stackId="3" connectNulls isAnimationActive={false}
                  type="monotone" dataKey={property} stroke={colors[index]} fill={colors[index]} />))
            }
          </AreaChart>
        </div>
        <div>Memory usage (GiB)</div>
        <div>
          <AreaChart
            width={830}
            height={300}
            data={this.state.dataHostMemory}
            margin={{
              top: 5, right: 20, left: 90, bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey='time' />
            <YAxis />
            <Tooltip />
            <Brush  onChange={this.handleChangeMemoryHost} startIndex={this.state.startIndexMemoryHost}
              endIndex={this.state.endIndexMemoryHost}>
              <AreaChart
                width={830}
                height={300}
                data={this.state.dataHostMemory}
                margin={{
                  top: 5, right: 20, left: 90, bottom: 5,
                }}
              >
                <Area type="monotone" dataKey="memory" stroke="#493BD8" fill="#493BD8" />
              </AreaChart>
            </Brush>
            <Legend iconType='rect' iconSize={18} />
            <Area type="monotone" dataKey="memory" stroke="#493BD8" fill="#493BD8" />
          </AreaChart>
        </div>
        <div>Load average (KiB)</div>
        <div>
          <AreaChart
            width={830}
            height={300}
            data={this.state.dataLoad}
            margin={{
              top: 5, right: 20, left: 90, bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey='time' />
            <YAxis />
            <Tooltip />
            <Brush  onChange={this.handleChangeLoadHost} startIndex={this.state.startIndexLoadHost}
              endIndex={this.state.endIndexLoadHost}>
              <AreaChart
                width={830}
                height={300}
                data={this.state.dataLoad}
                margin={{
                  top: 5, right: 20, left: 90, bottom: 5,
                }}
              >
                <Area type="monotone" dataKey="load" stroke="#3BC1D8" fill="#3BC1D8" />
              </AreaChart>
            </Brush>
            <Legend iconType='rect' iconSize={18} />
            <Area type="monotone" dataKey="load" stroke="#3BC1D8" fill="#3BC1D8" />
          </AreaChart>
        </div>
        <br></br>
        <div>
          <h2>SR stats </h2>
        </div>
        <br></br>
        <div>IOPS (IOPS)</div>

        <div>
          <AreaChart
            width={830}
            height={300}
            data={this.state.dataSrIops}
            margin={{
              top: 5, right: 20, left: 90, bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey='time' />
            <YAxis />
            <Tooltip />
            <Brush  onChange={this.handleChangeIopsSR} startIndex={this.state.startIndexIopsSR}
              endIndex={this.state.endIndexIopsSR}>
              <AreaChart
                width={830}
                height={300}
                data={this.state.dataSrIops}
                margin={{
                  top: 5, right: 20, left: 90, bottom: 5,
                }}
              >
                {
                  (this.state.propertiesSrIops
                    .map((currProperty: any) => `iops_${currProperty}`).map((property: any, index: any) => <Area connectNulls isAnimationActive={false} type="monotone" dataKey={property} stroke={allColors[index]} fill={allColors[index]} />))
                }
              </AreaChart>

            </Brush>
            <Legend iconType='rect' iconSize={18} />
            {
              (this.state.propertiesSrIops
                .map((currProperty: any) => `iops_${currProperty}`).map((property: any, index: any) => <Area connectNulls isAnimationActive={false} type="monotone" dataKey={property} stroke={allColors[index]} fill={allColors[index]} />))
            }
          </AreaChart>
        </div>
        <br></br>

        <div>Latency (ms)</div>
        <div>
          <AreaChart
            width={830}
            height={300}
            data={this.state.dataSrLatency}
            margin={{
              top: 5, right: 20, left: 90, bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey='time' />
            <YAxis />
            <Tooltip />
            <Brush  onChange={this.handleChangeLatencySR} startIndex={this.state.startIndexLatencySR}
              endIndex={this.state.endIndexLatencySR}>
              <AreaChart
                width={830}
                height={300}
                data={this.state.dataSrLatency}
                margin={{
                  top: 5, right: 20, left: 90, bottom: 5,
                }}
              >
                {
                  (this.state.propertiesSrLatency
                    .map((currProperty: any) => `latency_${currProperty}`).map((property: any, index: any) => <Area connectNulls isAnimationActive={false} type="monotone" dataKey={property} stroke={allColors[index]} fill={allColors[index]} />))
                }
              </AreaChart>
            </Brush>
            <Legend iconType='rect' iconSize={18} />
            {
              (this.state.propertiesSrLatency
                .map((currProperty: any) => `latency_${currProperty}`).map((property: any, index: any) => <Area connectNulls isAnimationActive={false} type="monotone" dataKey={property} stroke={allColors[index]} fill={allColors[index]} />))
            }
          </AreaChart>
        </div>
        <div>IO throughput (MiB/s)</div>
        <div>
          <AreaChart
            width={830}
            height={300}
            data={this.state.dataSrThro}
            margin={{
              top: 5, right: 20, left: 90, bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey='time' />
            <YAxis />
            <Tooltip />
            <Brush  onChange={this.handleChangeIOSR} startIndex={this.state.startIndexIOSR}
              endIndex={this.state.endIndexIOSR}>
              <AreaChart
                width={830}
                height={300}
                data={this.state.dataSrThro}
                margin={{
                  top: 5, right: 20, left: 90, bottom: 5,
                }}
              >
                {
                  (this.state.propertiesSrThro
                    .map((currProperty: any) => `throughput_${currProperty}`).map((property: any, index: any) => <Area connectNulls isAnimationActive={false} type="monotone" dataKey={property} stroke={allColors[index]} fill={allColors[index]} />))
                }
              </AreaChart>

            </Brush>
            <Legend iconType='rect' iconSize={18} />
            {
              (this.state.propertiesSrThro
                .map((currProperty: any) => `throughput_${currProperty}`).map((property: any, index: any) => <Area connectNulls isAnimationActive={false} type="monotone" dataKey={property} stroke={allColors[index]} fill={allColors[index]} />))
            }
          </AreaChart>
        </div>
        <div>IOwait (%) </div>

        <div>
          <AreaChart
            width={830}
            height={300}
            data={this.state.dataSrIowait}
            margin={{
              top: 5, right: 20, left: 90, bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey='time' />
            <YAxis />
            <Tooltip />
            <Brush  onChange={this.handleChangeIOwaitSR} startIndex={this.state.startIndexIOwaitSR}
              endIndex={this.state.endIndexIOwaitSR}>

              <AreaChart
                width={830}
                height={300}
                data={this.state.dataSrIowait}
                margin={{
                  top: 5, right: 20, left: 90, bottom: 5,
                }}
              >
                {
                  (this.state.propertiesSrIowait
                    .map((currProperty: any) => `iowait_${currProperty}`).map((property: any, index: any) => <Area connectNulls isAnimationActive={false} type="monotone" dataKey={property} stroke={allColors[index]} fill={allColors[index]} />))
                }
              </AreaChart>
            </Brush>
            <Legend iconType='rect' iconSize={18} />
            {
              (this.state.propertiesSrIowait
                .map((currProperty: any) => `iowait_${currProperty}`).map((property: any, index: any) => <Area connectNulls isAnimationActive={false} type="monotone" dataKey={property} stroke={allColors[index]} fill={allColors[index]} />))
            }
          </AreaChart>
        </div>

      </div>

    )
  }
}