import React, { Component } from 'react';
import moment from 'moment';
import { LineChart, CartesianGrid, XAxis, YAxis, ZAxis, Tooltip } from 'recharts';
import {
  Line, Label, ReferenceArea, PieChart, ReferenceLine,
  Brush, Pie, Sector, Legend, AreaChart, Area, ScatterChart, Scatter
} from 'recharts';
import dataJson from './dump.json';
import { any } from 'prop-types';
import { statement } from '@babel/template';


export default class Visualization extends Component<any, any> {
datax:any=[];
datay:any=[];

   state:any ={

    line1:{
        x:[],
        y:[],
        name:'Line 1'
    },
     line2:{
       x:[],
       y:[],
       name:'Line 2'
    }, 
    line3:{
      x:[],
      y:[],
      name:'Line 3'
    },
    revision:0,
  } 
 
  componentDidMount(){
    setInterval( this.increaseGraphic , 2000);
  } 
  rand = () => parseInt(Math.random() * 10 + this.state.revision, 10);
  
  increaseGraphic = () => {
    const { line1, line2,line3} = this.state;
   /*  var t = new Date();
    var data00 =[];
      for(var i=10; i>=0; i--){
      var x = new Date(t.getTime()-i*3600);
      data00.push([x]);      
      } */
        
    line1.x.push(this.rand());
    //line1.x.push(line1.x[0]+this.rand());
    line1.y.push(this.rand());
    line2.x.push(line1.x[line1.length-1]+this.rand());
    line2.y.push(this.rand());
    line3.x.push(line3.x[line3.length-1]+this.rand());
    line3.y.push(this.rand());
    this.setState({ line1,line2,line3})
    
  }

  constructor(props: any) {
    super(props);
  }

  render() {
    console.log(this.state.line1);
    //Je recupere les 40 premiers données de cpu0 dans le tableau datay
    var datay: any = [];
     for (var i = 0; i < 40; i++) {
      datay[i] = dataJson.stats.cpus[0][i];
    } 
  
    //je cree mon tableau datax, qui contient mes dates
    let datax: any =[];
    let interval = dataJson.interval;
    console.log(interval);
    let res;
    let datefin = dataJson.endTimestamp;
    let step= dataJson.interval;
    console.log(datefin);
       for(var j=0; j<40;j++){
      
       res= datefin+interval;
       var d4 = moment(res);
       var result = d4.format('LTS')
       datax[j] = result;
       interval = interval+step;
     }   
     //datax = [1558962000,1558965600,1558967200];
      var t = new Date();
      for (var i = 10; i >= 0; i--) {     
         var x = new Date(t.getTime() - i * 1000);
         datax.push([x]);
      }  

     this.state.line1.x = datax;
     this.state.line2.x = datax;
     this.state.line3.x=datax;
    var data: any = [];
    for (var i = 0; i < 100; i++) {
    data.push({
      x: this.state.line1.x[i], cpu0: this.state.line1.y[i],cpu1:this.state.line2.y[i]
    });
  }
    return (
      <div>
        <div>
          <button onClick={() => {        
                
          }
          }

          >/10minutes</button>
          <button>/jour</button>
          <button>/10secondes</button>
          <button>/hour</button>
          <div>
            Usage CPU (%)
          </div>
          <br></br>
          <AreaChart
            width={720}
            height={300}
        
            data ={[
              this.state.line1,
              this.state.line2,
              this.state.line3,
            ]}
            margin={{
              top: 5, right: 30, left: 20, bottom: 5,
            }}

          >
            <CartesianGrid strokeDasharray="5 5" />
            <XAxis dataKey="x"/>
            <YAxis />
            <Tooltip />
            <Legend />
            <Brush dataKey="name" height={30} stroke="#8884d8" />
            <Area type="monotone" dataKey="y" stroke="red" fill="red" activeDot={{ r:10}} />
           
         
          </AreaChart>
        </div>
        <br></br>
        <br></br>
        
      </div>

    );
  }

}