
import React, { Component } from 'react';
import moment from 'moment';
import { LineChart, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import { Line, Label, ReferenceArea,PieChart, Pie, Sector, Legend,AreaChart, Area } from 'recharts';
import dataJson from './dump.json';


export default class Visualization extends Component<any, any> {

  constructor(props: any) {
    super(props);
  }

  render() {

    //Je recupere les 10 premiers données de cpu0 dans le tableau datay
    var datay: any = [];
    for (var i = 0; i < 10; i++) {
      datay[i] = dataJson.stats.cpus[0][i];
    }

    //Je recupere les 10 premieres date dans datax
    let som = 3600;
    let datax: any = [];
    for (var j = 0; j < 10; j++) {
      var d4= moment(som);
      var result = d4.format('LTS');
      datax[j]=result;
      som = som + 3600;
    }

    //Je recupere les 10 premieres données de cpu1
    var datacpu1: any = [];
    for (var i = 0; i < 10; i++) {
    datacpu1[i] = dataJson.stats.cpus[1][i];
    }

    //Je recupere les 10 premieres données de cpu2
    var datacpu2: any = [];
    for (var i = 0; i < 10; i++) {
      datacpu2[i] = dataJson.stats.cpus[2][i];
    }

    //Je recupere les 10 premieres données de cpu3
    var datacpu3: any = [];
    for (var i = 0; i < 10; i++) {
      datacpu3[i] = dataJson.stats.cpus[3][i];
    }

//je recupere les 10 premiere valeurs de load
    var dataLoad: any = [];
    for (var i = 0; i < 10; i++) {
       dataLoad[i] = dataJson.stats.load[i];
}

//Je recupere les 10 premières valeurs de pifs: pifs:rx:0
var dataPif0rx: any = [];
for (var i = 0; i < 10; i++) {
  dataPif0rx[i] = dataJson.stats.pifs.rx[0][i];
}

//Je recupere les 10 premières valeurs de pifs: pifs:rx:1
var dataPif1rx: any = [];
for (var i = 0; i < 10; i++) {
  dataPif1rx[i] = dataJson.stats.pifs.rx[1][i];
}

//Je recupere les 10 premières valeurs de pifs: pifs:rx:2
var dataPif2rx: any = [];
for (var i = 0; i < 10; i++) {
  dataPif2rx[i] = dataJson.stats.pifs.rx[2][i];
}

//Je recupere les 10 premières valeurs de pifs: pifs:tx:0
var dataPif0tx: any = [];
for (var i = 0; i < 10; i++) {
  dataPif0tx[i] = dataJson.stats.pifs.tx[0][i];
}

//Je recupere les 10 premières valeurs de pifs: pifs:tx:1
var dataPif1tx: any = [];
for (var i = 0; i < 10; i++) {
  dataPif1tx[i] = dataJson.stats.pifs.tx[1][i];
}

//Je recupere les 10 premières valeurs de pifs: pifs:tx:2
var dataPif2tx: any = [];
for (var i = 0; i < 10; i++) {
  dataPif2tx[i] = dataJson.stats.pifs.tx[2][i]; 
  console.log(dataPif2tx);
}

//Je recupere les 10 premieres valeurs de iowait:a889b334
var dataIowait_host1: any = [];
for (var i = 0; i < 10; i++) {
  dataIowait_host1[i] = dataJson.stats.iowait["a889b334"][i];
  
}

//Je recupere les 10 premieres valeurs de iowait:660c182f
var dataIowait_host2: any = [];
for (var i = 0; i < 10; i++) {
  dataIowait_host2[i] = dataJson.stats.iowait["660c182f"][i];
}

//Je recupere les 10 premieres valeurs de iowait:7cd1bf8b
var dataIowait_host3: any = [];
for (var i = 0; i < 10; i++) {
  dataIowait_host3[i] = dataJson.stats.iowait["7cd1bf8b"][i];
}

//Je recupere les 10 premieres valeurs de iowait:1e91e92d
var dataIowait_host4: any = [];
for (var i = 0; i < 10; i++) {
  dataIowait_host4[i] = dataJson.stats.iowait["1e91e92d"][i];
}

//Je recupere les 10 premieres valeurs de iowait:9a208896
var dataIowait_host5: any = [];
for (var i = 0; i < 10; i++) {
  dataIowait_host5[i] = dataJson.stats.iowait["9a208896"][i];
}
//Iops_w_host1

 //Je recupere les 10 premieres valeurs de iops:w:a889b334
  var dataIops_w_host1: any = [];
for (var i = 0; i < 10; i++) {
  dataIops_w_host1[i] = dataJson.stats.iops.w["a889b334"][i];
}   

//Je recupere les 10 premieres valeurs de iops:r:a889b334
var dataIops_r_host1: any = [];
for (var i = 0; i < 10; i++) {
  dataIops_r_host1[i] = dataJson.stats.iops.r["a889b334"][i];
}   

//Je recupere les 10 premieres valeurs de ioTroughput:w:a889b334
var dataIoTrought_w_host1: any = [];
for (var i = 0; i < 10; i++) {
  dataIoTrought_w_host1[i] = dataJson.stats.ioThroughput.w["a889b334"][i];
}   

//Je recupere les 10 premieres valeurs de ioTroughput:r:a889b334
var dataIoTrought_r_host1: any = [];
for (var i = 0; i < 10; i++) {
  dataIoTrought_r_host1[i] = dataJson.stats.ioThroughput.r["a889b334"][i];
} 

//Je recupere les 10 premieres valeurs de Latency:w:a889b334
var dataLatency_w_host1: any = [];
for (var i = 0; i < 10; i++) {
  dataLatency_w_host1[i] = dataJson.stats.latency.w["a889b334"][i];
} 


//Je recupere les 10 premieres valeurs de Latency:r:a889b334
var dataLatency_r_host1: any = [];
for (var i = 0; i < 10; i++) {
  dataLatency_r_host1[i] = dataJson.stats.latency.r["a889b334"][i];
} 

    //Je rempli mon tableau data
    var data: any = [];
    for (var i = 0; i < 10; i++) {
      data.push({ x: datax[i], cpu0: datay[i], cpu1: datacpu1[i], cpu2: datacpu2[i],
      cpu3: datacpu3[i],dataLoad: dataLoad[i],Pif0_rx:dataPif0rx[i],
       Pif1_rx:dataPif1rx[i], Pif2_rx:dataPif1rx[i],Pif0_tx:dataPif0tx[i], 
       Pif1_tx:dataPif1tx[i], Pif2_tx:dataPif2tx[i], Iowait_host1:dataIowait_host1[i],
       Iowait_host2:dataIowait_host2[i],Iowait_host3:dataIowait_host3[i],
       Iowait_host4:dataIowait_host4[i],Iowait_host5:dataIowait_host5[i],
       Iops_w_host1:dataIops_w_host1[i], Iops_r_host1:dataIops_r_host1[i],
       IoTroughput_w_host1:dataIoTrought_w_host1[i],
       IoTroughput_r_host1:dataIoTrought_r_host1[i],
       Latency_w: dataLatency_w_host1[i],
       Latency_r: dataLatency_r_host1[i]
      });
    }


    return (
      <div>
      <div>
        <div>
                  Usage CPU
     </div>
        <AreaChart
          width={680}
          height={300}
          // data={global} 
          data={data}
          margin={{
            top: 5, right: 30, left: 20, bottom: 5,
          }}

        >
          <CartesianGrid strokeDasharray="5 5" />

          <XAxis dataKey="x" />
          <YAxis label="%" />
          <Tooltip />
          <Legend />
          <Area type="monotone" dataKey="cpu0" stroke="#82ca9d" fill="#82ca9d" activeDot={{ r: 10 }} />
          <Area type="monotone" dataKey="cpu1" stroke="#000000" fill="#000000"/>
          <Area type="monotone" dataKey="cpu2" stroke="red" fill="red"/>
          <Area type="monotone" dataKey="cpu3" stroke="pink" fill="pink"/>
        </AreaChart>
      </div>
<br></br>
<br></br>
<div>
        <div>
                 Load average
     </div>
        <AreaChart
          width={680}
          height={300}
          // data={global} 
          data={data}
          margin={{
            top: 5, right: 30, left: 20, bottom: 5,
          }}

        >
          <CartesianGrid strokeDasharray="5 5" />

          <XAxis dataKey="x" />
          <YAxis label="?" />
          <Tooltip />
          <Legend />
          <Area type="monotone" dataKey="dataLoad" stroke="#82ca9d" fill="#82ca9d" activeDot={{ r: 8 }} />
        </AreaChart>
      </div>
<br></br>
<br></br>
      <div>
        <div>
                  Network throughtput
     </div>
        <AreaChart
          width={680}
          height={300}
          // data={global} 
          data={data}
          margin={{
            top: 5, right: 30, left: 20, bottom: 5,
          }}

        >
          <CartesianGrid strokeDasharray="5 5" />

          <XAxis dataKey="x" />
          <YAxis label=" " />
          <Tooltip />
          <Legend />
          <Area type="monotone" dataKey="Pif0_rx" stroke="#82ca9d" fill="#82ca9d" activeDot={{ r: 8 }} />
          <Area type="monotone" dataKey="Pif1_rx" stroke="#000000" fill="#000000" />
          <Area type="monotone" dataKey="Pif2_rx" stroke="red" fill="red"/>
          <Area type="monotone" dataKey="Pif0_tx" stroke="red" fill="red"/>
          <Area type="monotone" dataKey="Pif1_tx" stroke="blue" fill="blue"/>
          <Area type="monotone" dataKey="Pif2_tx" stroke="blue" fill="blue"/>
        </AreaChart>
      </div>
      <br></br>
      <br></br>
      <div>
        <div>
                 Iowait
     </div>
        <AreaChart
          width={680}
          height={300}
          // data={global} 
          data={data}
          margin={{
            top: 5, right: 30, left: 20, bottom: 5,
          }}

        >
          <CartesianGrid strokeDasharray="5 5" />

          <XAxis dataKey="x" />
          <YAxis label=" " />
          <Tooltip />
          <Legend />
          <Area type="monotone" dataKey="Iowait_host1" stroke="#000000" fill="#000000" activeDot={{ r: 8 }} />
          <Area type="monotone" dataKey="Iowait_host2" stroke="#000000" fill="#000000"/>
          <Area type="monotone" dataKey="Iowait_host3" stroke="blue" fill="blue"/>
          <Area type="monotone" dataKey="Iowait_host4" stroke="green" fill="green"/>
          <Area type="monotone" dataKey="Iowait_host5" stroke="red" fill="red"/>
        </AreaChart>
      </div>

<br></br>
<br></br>
      <div>
        <div>
                 Iops
     </div>
        <AreaChart
          width={680}
          height={300}
          // data={global} 
          data={data}
          margin={{
            top: 5, right: 30, left: 20, bottom: 5,
          }}

        >
          <CartesianGrid strokeDasharray="5 5" />

          <XAxis dataKey="x" />
          <YAxis label=" " />
          <Tooltip />
          <Legend />
          <Area type="monotone" dataKey="Iops_w_host1" stroke="#000000" fill="#000000" activeDot={{ r: 8 }} />
          <Area type="monotone" dataKey="Iops_r_host1" stroke="red" fill="red" />
          
        </AreaChart>
      </div>

<br></br>
<br></br>
      <div>
        <div>
                 IoTroughput
     </div>
        <AreaChart
          width={680}
          height={300}
          // data={global} 
          data={data}
          margin={{
            top: 5, right: 30, left: 20, bottom: 5,
          }}

        >
          <CartesianGrid strokeDasharray="5 5" />

          <XAxis dataKey="x" />
          <YAxis label=" " />
          <Tooltip />
          <Legend />
          <Area type="monotone" dataKey="IoTroughput_w_host1" stroke="#000000" fill="#000000" activeDot={{ r: 8 }} />
          <Area type="monotone" dataKey="IoTroughput_r_host1" stroke="blue" fill="blue" />
          
        </AreaChart>
      </div>

      <div>
        <div>
                Latency
     </div>
        <AreaChart
          width={680}
          height={300}
          // data={global} 
          data={data}
          margin={{
            top: 5, right: 30, left: 20, bottom: 5,
          }}

        >
          <CartesianGrid strokeDasharray="5 5" />

          <XAxis dataKey="x" />
          <YAxis label=" " />
          <Tooltip />
          <Legend />        
          <Area type="monotone" dataKey="Latency_w" stroke="red" fill="red" activeDot={{ r: 8 }} />
          <Area type="monotone" dataKey="Latency_r" stroke="#000000" fill="#000000" />        
        </AreaChart>
      </div>

</div>

    );
  }

}