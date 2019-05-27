
import React, { Component } from 'react';

//import data from './rrd_host_11.json';

import Dygraph from 'dygraphs';


/*  var globalData = [
  
   20070504,data.data[3].values[3],data.data[3].values[4],data.data[3].values[5],data.data[3].values[6]+
   20080504,70,80,26,78+
   20090504, 40,50,26,90+
   20100504, 45,49,26,48,
];  */



export default class Visualization extends Component<any, any> {


   constructor(props: Readonly<{}>) {

      super(props);
      console.log("constructor()");
      console.log(props);

   }

   componentDidMount = () => {
      //let localData = globalData;

      var g = new Dygraph(
         "testgraph",
         //localData,
         /*  "2007/05/04,75,70,26,78,79,80,60\n" +
          "2008/05/04,70,80,26,78,70,10,20\n" +
          "2009/05/04,40,50,26,90,79,80,60\n" +
          "2010/05/04,45,49,26,48,79,44,60\n" +
          "2011/05/04,70,60,40,63,79,44,60\n" +
          "2012/05/04,45,19,26,48,79,44,60\n" */
          "Date, cpu0,cpu1,cpu2,cpu3\n"+
         "2019/04/11,0.071,0.0704,0.0699,0.0701\n" +
         "2019/04/12,0.0789,0.0783,0.0779,0.0781\n" +
         "2019/04/13,0.0943,0.0934,0.0929,0.0933\n" +
         "2019/04/14,0.1002,0.0993,0.0991,0.0992\n",

         {

            labels: ['Date', 'cpu0','cpu1','cpu2','cpu3'],
            title: "Usage CPU",
            animatedZooms: true,
            //legend: 'always',
            hideOverlayOnMouseOut: true,
            labelsShowZeroValues: true,
            showLabelsOnHighlight: true,
            showInRangeSelector: true,

            //logscale: true,
            drawGapEdgePoints: true,
            //drawAxis:true,
            width: 680,
            height: 300,
            ylabel: 'pourcentage',
            axes: {
               y: {
                  axisLabelFormatter: function (v) { return v + ' %' },

               }
            },
            xlabel: 'date',// Nom des axes ,
            strokeWidth: 2,
            strokeBorderWidth: 2,
            includeZero: true,
            drawGrid: false,
            stackedGraph: false,
            rightGap: 100,
            connectSeparatedPoints: true,//if the series has a missing or null value
            //labelsUTC:true,
            highlightSeriesOpts: {
               strokeWidth: 3,
               strokeBorderWidth: 1,
               highlightCircleSize: 5
            },
            drawPoints: true, pointSize: 2, highlightCircleSize: 3 // Affiche les points, taille des points, taille des points quand mouseover
            //legend: 'always',labelsDivStyles: { 'textAl/gn': 'right' }, // Légende, positionnement (à droite)
            //gridLineColor: "#ff0000", // Couleur du grid (ici rouge)
            //drawXGrid: false,drawYGrid: false, // Affiche, Cache les grilles en arrière plan
            //dateWindow: [ Date.parse("2012/07/20"), Date.parse("2012/07/26") ], // Déclare intervalle de l'axe des abscisses
            //includeZero: true, ////Affiche le 0 de l'origine du graphique
         }
      );
      var g2 = new Dygraph(
         "testgraph2",
         "Date, d1,d2,d3,d4,d5,d6,d7,d8,d9,d10,d11,d12,d13\n"+
         "2019/04/01,10,50,19,44,10,50,1,0,10,71,12,20,0\n" +
         "2019/04/02,43,81,23,19,4,0.5,81,40,0.9,0.7,0.8,0.5,10\n" +
         "2019/04/03,48,37,19,49,40,50,2,0.8,0.1,40,20,0.4,10\n" +
         "2019/04/04,90,36,71,29,10,18,4,0,40,10,10,0.5,10\n" +
         "2019/04/05,13,49,18,50,4,20,40,10,5,40,04,0,10\n" +
         "2019/04/06,47,40,28,81,19,25,10,0,40,40,40,04,0\n" +
         "2019/04/07,47,50,10,8,4,23,40,0,40,10,5,10,20\n" +
         
         "2019/04/08,40,51,9,18,40,23,10,10,0.4,0.8,8,10,20\n",

         {

            labels: ['Date', 'd1','d2','d3','d4','d5','d6','d7','d8','d9','d10','d11','d12','d13'],
            //title: "testgraph2",
            animatedZooms: true,
            legend: 'always',
            hideOverlayOnMouseOut: true,
            labelsShowZeroValues: true,
            showLabelsOnHighlight: true,
            showInRangeSelector: true,

            //logscale: true,
            drawGapEdgePoints: true,
            //drawAxis:true,
            width: 680,
            height: 300,
            ylabel: 'pourcentage',
            axes: {
               y: {
                  axisLabelFormatter: function (v) { return v + ' %' },
               }
            },
            xlabel: 'date',// Nom des axes ,
            strokeWidth: 2,
            strokeBorderWidth: 2,
            includeZero: true,
            drawGrid: false,
            stackedGraph: false,
            rightGap: 100,

            connectSeparatedPoints: true,//if the series has a missing or null value
            //labelsUTC:true,
            highlightSeriesOpts: {
               strokeWidth: 3,
               strokeBorderWidth: 1,
               highlightCircleSize: 5
            }
            //drawPoints: true, pointSize: 2, highlightCircleSize: 3 // Affiche les points, taille des points, taille des points quand mouseover
            //legend: 'always',labelsDivStyles: { 'textAl/gn': 'right' }, // Légende, positionnement (à droite)
            //gridLineColor: "#ff0000", // Couleur du grid (ici rouge)
            //drawXGrid: false,drawYGrid: false, // Affiche, Cache les grilles en arrière plan
            //dateWindow: [ Date.parse("2012/07/20"), Date.parse("2012/07/26") ], // Déclare intervalle de l'axe des abscisses
            //includeZero: true, ////Affiche le 0 de l'origine du graphique
         }
      );
      var g3 = new Dygraph(
         "testgraph3",
         "Date, d1,d2,d3,d4\n"+

         "2012/04/11,-0.071,40,-39,50\n" +
         "2013/04/12,44,4,20,-20\n" +
         "2014/04/13,94,34,0.0929,0.0933\n" +
         "2015/04/14,44,4,20,-20\n" +
         "2016/04/15,94,34,0.0929,0.0933\n" +
         "2017/04/16,44,4,20,-20\n" +
         "2018/04/17,94,34,0.0929,0.0933\n" +
         "2019/04/18,0.1002,39,99,22\n",

         {

            labels: ['Date', 'd1','d2','d3','d4'],
            title: "testgraph3",
            animatedZooms: true,
            legend: 'always',
            hideOverlayOnMouseOut: true,
            labelsShowZeroValues: true,
            showLabelsOnHighlight: true,
            showInRangeSelector: true,

            //logscale: true,
            drawGapEdgePoints: true,
            //drawAxis:true,
            width: 680,
            height: 300,
            ylabel: 'pourcentage',
            axes: {
               y: {
                  axisLabelFormatter: function (v) { return v + ' %' },
               }
            },
            xlabel: 'date',// Nom des axes ,
            strokeWidth: 2,
            strokeBorderWidth: 2,
            includeZero: true,
            drawGrid: false,
            stackedGraph: false,
            rightGap: 100,
            connectSeparatedPoints: true,//if the series has a missing or null value
            //labelsUTC:true,
            highlightSeriesOpts: {
               strokeWidth: 3,
               strokeBorderWidth: 1,
               highlightCircleSize: 5
            },
            drawPoints: true, pointSize: 2, highlightCircleSize: 3 // Affiche les points, taille des points, taille des points quand mouseover
            //legend: 'always',labelsDivStyles: { 'textAl/gn': 'right' }, // Légende, positionnement (à droite)
            //gridLineColor: "#ff0000", // Couleur du grid (ici rouge)
            //drawXGrid: false,drawYGrid: false, // Affiche, Cache les grilles en arrière plan
            //dateWindow: [ Date.parse("2012/07/20"), Date.parse("2012/07/26") ], // Déclare intervalle de l'axe des abscisses
            //includeZero: true, ////Affiche le 0 de l'origine du graphique
         }
      );
      var g4 = new Dygraph(
         "testgraph4",
         //localData,
         "Date, load Average(IOPS)\n"+
         "2019/04/11 ,0.1066\n" +
         "2019/04/12 ,0.1129\n" +
         "2019/04/13 ,0.1032\n" +
         "2019/04/14 ,0.084\n" +
         "2019/04/15 ,0.137\n",

         {

            labels: ['Date', 'load Average'],
            title: "load Average",
            titleHeight: 20,
            animatedZooms: true,
            legend: 'always',
            hideOverlayOnMouseOut: true,
            labelsShowZeroValues: true,
            showLabelsOnHighlight: true,
            showInRangeSelector: true,
            drawGapEdgePoints: true,
            //drawAxis:true,
            width: 680,
            height: 300,
            ylabel: 'pourcentage',
            axes: {
               y: {
                  axisLabelFormatter: function (v) { return v + '' },
               }
            },
            xlabel: 'Date',// name x axis 
            strokeWidth: 2,
            strokeBorderWidth: 2,
            includeZero: true,
            drawGrid: false,
            stackedGraph: false,
            rightGap: 100,
            connectSeparatedPoints: true,//if the series has a missing or null value
            //labelsUTC:true,
            highlightSeriesOpts: {
               strokeWidth: 3,
               strokeBorderWidth: 1,
               highlightCircleSize: 5
            },
            //drawPoints: true, pointSize: 2, highlightCircleSize: 3 // Affiche les points, taille des points, taille des points quand mouseover
            //legend: 'always',labelsDivStyles: { 'textAl/gn': 'right' }, // Légende, positionnement (à droite)
            //gridLineColor: "#ff0000", // Couleur du grid (ici rouge)
            //drawXGrid: false,drawYGrid: false, // Affiche, Cache les grilles en arrière plan
            //dateWindow: [ Date.parse("2012/07/20"), Date.parse("2012/07/26") ], // Déclare intervalle de l'axe des abscisses
            //includeZero: true, ////Affiche le 0 de l'origine du graphique
         }
      );
      var g5 = new Dygraph(
         "testgraph5",
         //localData,
         "Date, Iops(r),Iops(w)\n"+
         "2019/04/11 ,0.1066,0.9\n" +
         "2019/04/12 ,19,200\n" +
         "2019/04/13 ,550,40\n" +
         "2019/04/14 ,39,420\n" +
         "2019/04/15 ,0.937,100\n",

         {

            labels: ['Date', 'Iops(r)','Iops(w)'],
            title: "IOPS",
            titleHeight: 20,
            animatedZooms: true,
            legend: 'always',
            hideOverlayOnMouseOut: true,
            labelsShowZeroValues: true,
            showLabelsOnHighlight: true,
            showInRangeSelector: true,
            drawGapEdgePoints: true,
            //drawAxis:true,
            width: 680,
            height: 300,
            ylabel: 'pourcentage',
            axes: {
               y: {
                  axisLabelFormatter: function (v) { return v + ' %' },
               }
            },
            xlabel: 'Date',// name x axis 
            strokeWidth: 2,
            strokeBorderWidth: 2,
            includeZero: true,
            drawGrid: false,
            stackedGraph: false,
            rightGap: 100,
            connectSeparatedPoints: true,//if the series has a missing or null value
            //labelsUTC:true,
            highlightSeriesOpts: {
               strokeWidth: 3,
               strokeBorderWidth: 1,
               highlightCircleSize: 5
            },
            //drawPoints: true, pointSize: 2, highlightCircleSize: 3 // Affiche les points, taille des points, taille des points quand mouseover
            //legend: 'always',labelsDivStyles: { 'textAl/gn': 'right' }, // Légende, positionnement (à droite)
            //gridLineColor: "#ff0000", // Couleur du grid (ici rouge)
            //drawXGrid: false,drawYGrid: false, // Affiche, Cache les grilles en arrière plan
            //dateWindow: [ Date.parse("2012/07/20"), Date.parse("2012/07/26") ], // Déclare intervalle de l'axe des abscisses
            //includeZero: true, ////Affiche le 0 de l'origine du graphique
         }
      );

   }


   render() {
      //je recupere le dernier mot des legend
      //J'affiche ici les cpu (average)
      /*  for (var i = 3; i <= 6; i++) {
        var result = data.meta.legend[i];
        var mot = result.substring(result.lastIndexOf(":") + 1, result.length);
        console.log(mot);
     } */

      //j affiche les dates au format timestamp 
      /* for (var i = 3; i <= 6; i++) {      
          console.log(data.data[i].t)
      }
 */
      //je recupere les valeurs de 3 a 6 correspondant aux cpu disponibles
      /*  for (var i = 3; i <= 6; i++) {
         for (var j = 3; j <= 6; j++) {
            console.log(data.data[i].values[j]);
         }
      }  */
  

      return (
         //<pre>{JSON.stringify(data, null, 2)}</pre>  <div id="testgraph"></div>
         <div>
            <div id="testgraph"></div>
            <br />
            <br />
            <div id="testgraph2"></div>
            <br />
            <br />
            <div id="testgraph3"></div>
            <br />
            <br />
            <div id="testgraph4"></div>
            <br />
            <br />
            <div id="testgraph5"></div>
         </div>
      )
   }


}
