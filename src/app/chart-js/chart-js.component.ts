import { Component, OnDestroy, ViewChild } from '@angular/core';
import { NgModel } from '@angular/forms';
import {
  Chart,
  ArcElement,
  LineElement,
  BarElement,
  PointElement,
  BarController,
  BubbleController,
  DoughnutController,
  LineController,
  PieController,
  PolarAreaController,
  RadarController,
  ScatterController,
  CategoryScale,
  LinearScale,
  LogarithmicScale,
  RadialLinearScale,
  TimeScale,
  TimeSeriesScale,
  Decimation,
  Filler,
  Legend,
  Title,
  Tooltip,
  LayoutPosition,
  TooltipModel,
  TooltipItem,
} from 'chart.js';
import { Observable, of, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { materrorhintanime, smoothappearance } from './animations/basicanime';
Chart.register(
  ArcElement,
  LineElement,
  BarElement,
  PointElement,
  BarController,
  BubbleController,
  DoughnutController,
  LineController,
  PieController,
  PolarAreaController,
  RadarController,
  ScatterController,
  CategoryScale,
  LinearScale,
  LogarithmicScale,
  RadialLinearScale,
  TimeScale,
  TimeSeriesScale,
  Decimation,
  Filler,
  Legend,
  Title,
  Tooltip,
);

@Component({
  selector: 'app-chart-js',
  templateUrl: './chart-js.component.html',
  styleUrls: ['./chart-js.component.css'],
  animations: [materrorhintanime,smoothappearance]
})
export class ChartJsComponent implements OnDestroy {
  myfile!: File | null;
  filevalue: any;
  @ViewChild('myinput') filecontrol!: NgModel;
  myob$!: Observable<any>;
  toggler:boolean=false;                                //A toggler for my canvas area. Binding the templates to the form validation statuses would be slightly more consuming in our case.
  mysubscription!: Subscription;
  jsondata!: JSON;
  chart!: Chart;
  canvaselement: any;
  canvascontext: any;
  innerwidth: number = window.innerWidth;
  legendposition: LayoutPosition = "right"
  adjustlegend(){                                         //Adjust legend positioning for small screen sizes. We are not adjusting the property on resize for performance reasons.
    this.innerwidth = window.innerWidth;
    if (this.innerwidth > 530) {
      this.legendposition = "right"
      } else {
        this.legendposition = "top"
      }
  }

  //Canvas initialisation
  initcanvas() {
    this.canvaselement = <HTMLCanvasElement>document.getElementById("canvasid");
    this.canvascontext = <CanvasRenderingContext2D>this.canvaselement.getContext("2d")
  }

  removefile() {
    this.myfile = null;
    this.filevalue = null;
    //Remove the chart
    this.chart?this.chart.destroy():null
    this.toggler=false;
  }
  trackfile(e: any) {
    this.filevalue = e.target.value
    //Initilizing the selected file
    const filelist: FileList = e.target.files;
    //The File interface provides information about files and allows JavaScript in a web page to access their content.
    //A File object is a specific kind of a Blob, and can be used in any context that a Blob can.
    const selectedfile: File = filelist[0]
    //A const storing the actual filesize
    const filesize: number = selectedfile.size;
    this.myfile = selectedfile;
    if (filesize <= 5000000) {
      //Checking if a file is of a normal size
      //Using the FileReader object to asynchronously read the contents of the selected json file
      const filereader: FileReader = new FileReader()
      //Because a File object is a specific kind of a Blob, and can be used in any context that a Blob can, we may teherefore, pass the selectedfile File object to the readastext function
      filereader.readAsText(selectedfile)
      //After the file is is successfully read
      filereader.onload = (e: ProgressEvent) => {
        try {
          this.jsondata = JSON.parse(filereader.result!.toString())
        } catch (error) {
          this.filecontrol.control.setErrors({ isdatastructureerror: true })
          return
        }
        //converting to JSON, in accordance with the requirement
        //Checking if a good data has been loaded
        Array.prototype.every.call(this.jsondata, (el) => {
          const datastrchecker: boolean = !!((Object.prototype.hasOwnProperty.call(el, "rating") && Object.prototype.hasOwnProperty.call(el, "ltvLift") && Object.prototype.hasOwnProperty.call(el, "prevOrders")))
          if (datastrchecker) {
            this.toggler = true;
            //Pause 50ms till the element is rendered back
            setTimeout(() => {
              this.configchart(this.jsondata)
            }, 0.01);
          } else {
            this.toggler = false;
            this.filecontrol.control.setErrors({ isdatastructureerror: true })
          }
        })
      }
    } else {
      this.toggler = false;
      //Assigning errors to my control
      this.filecontrol.control.setErrors({ issizeerror: true })
    }


  }

  constructor() {
    if (Chart) { Chart.defaults.color = "#03071e" };
  }
  //Preparing an appropriate data structure for our chart
  configchart(data: JSON) {
    //Create an observable from my JSON
    this.myob$ = of(data)
    this.mysubscription = this.myob$.pipe(
      map((el) => { el.map((ob: any) => ob.prevOrders += " Previous orders"); return el })
    ).subscribe((myfilearray: Array<any>) => {
      //Generate the good data structure for my chart
      let goodarray = myfilearray.reduce((total: any, current: any) => {
        //A reusable function for adding data for each unique prevorder
        function addnewitem() {
          total.push(
            {
              [current.prevOrders]: [
                { rating: current.rating, ltvLift: current.ltvLift },
              ]
            }
          )
        };
        //A reusable function for double checking that the prevorder to be added as a new item that doesn't already exist in my good array
        function checker(total: Array<any>, theguythatwantstogetin: string) {
          for (let index = 0; index < total.length; index++) {
            return total[index].hasOwnProperty(theguythatwantstogetin)
          }
        }
        //If the object hasn't yet been created, run the function to add some data
        if (total.length === 0) {
          addnewitem()
          //Else, check if our array has the prevorder pending to be added, and if so, simply add to the array of rating and ltvlift
        } else {
          total.forEach((element: any, index: number) => {
            if (Object.keys(element).includes(current.prevOrders)) {
              total[index][current.prevOrders].push({ rating: current.rating, ltvLift: current.ltvLift })
              //Else, if are at our last iteration over the good array, add the new prevorder doesn't exist in the goodarray
            } else if (index + 1 === total.length && checker(total, current.prevOrders) === false) {
              addnewitem()
            }
          });
        }
        return total
      }, [])
      //Passing down to my chart
      this.generatechart(goodarray)
    }
    )
  }

  generatechart(chartarray:Array<any>) {
  //Defining the variables for my chart
  let horizontallabels:Array<number> = [];
  let datasetlabel:Array<string> = [];
  let datasets:Array<any> =[];
  let titletext:string = "Lift by Score per Cohort";
  let ytext:string = "LTV Lift"
  let xtext:string = "Review Score"
  
  chartarray.forEach((element:any, index:number, arr:Array<any>)=>{
   //Initializing the array of data labels
   datasetlabel.push(...Object.keys(element))  
  //Initializing the datasets data, including the names
   datasets.push({
    label:datasetlabel[index],
    //It is important to sort, based on ratings, for a correct visual appearance
    data:element[datasetlabel[index]].sort((a:any,b:any)=>a.rating-b.rating),
    fill:true,
    tension:0.1,
    backgroundColor:datasetlabel[index].includes("1")?"#4285f4":datasetlabel[index].includes('2')? "#ea4335":datasetlabel[index].includes("3")?"#fbbc04":"#34a853",
    parsing: {
      xAxisKey: 'rating',
      yAxisKey: 'ltvLift'
  }
   }
  )
  //Initializing the array of unique rating figures
   element[datasetlabel[index]].reduce((total:Array<number>, current:any)=>{
      total.includes(current.rating)?total:total.push(<number>current.rating)
     return horizontallabels = total
   },[])
  })
 //End of foreach - data preparation for the chart
 //Passing the preprepared data to the chart
this.addchart(datasets, horizontallabels, titletext, ytext, xtext)
}
//Finally, there goes my beautiful chart
addchart(datasets: any, horizontallabels: number[], titletext:string, ytext:string, xtext:string){
  //Reversing the order of datasets for an ascending order
 datasets.reverse()
//Initializing my canvas
  this.initcanvas();
//Here comes the chart
//If we already have a chart, destroy to redraw it again
  this.chart ? this.chart.destroy() : null
  this.adjustlegend()
  this.chart = new Chart(this.canvascontext, {
    type: 'line',
    data: {
      //Numbers should be used for a correct indexation of cases when we have more than 5 rating
        labels: [...horizontallabels],
        datasets: datasets,
    },
    options: {
      responsive: true,                      // We need a responsive chart
      maintainAspectRatio: false,            //Disabling this to make sure our chart is not too tall
      hover: { mode: "dataset", intersect: true },
      spanGaps: true,
      elements: { point: { radius: 0 }},   //Making the points invisible  
      plugins: {
        tooltip: {
          mode: "nearest",
          intersect: false,
          displayColors: true,
          backgroundColor: "#EEEEEE",
          bodyColor: "#444444",
          titleColor: "#444444",
          callbacks: {
            title: function (this: TooltipModel<"line">, tooltipItems: TooltipItem<"line">[]) {
              return "";
            },
            label: function (this: TooltipModel<"line">, tooltipItem: TooltipItem<"line">) {
              let ordercount = "Order count: " + tooltipItem.dataIndex;
              let lift = "Lift: " + tooltipItem.parsed.y;
              let leftrating = "Left Rating: " + tooltipItem.label
              return Array.of(ordercount, lift, leftrating)
            },
          },
        },
        title: {                               //styling the title
          display: true,
          align: "center",
          position: "top",
          font: { size: 20, weight: "bold" },
          color: "#03071e",
          text: titletext,
        },
        legend: {
          reverse:true,                          //Reversing again, but only the legends
          display: true,
          position: this.legendposition,         //Aligning legends to the right
          labels: {                              //Styling the legend boxes
            boxWidth: 10,
            boxHeight: 10,
            padding: 10
          }
        },
      },
      scales: {
        y: {
          max:100,
          ticks:{
            stepSize:20,
            callback:(tickValue:any, index: number, ticks)=>{return tickValue + '.00%'},
          },
          stacked: false,
          beginAtZero: false,                 //We might also have negative y values
          type:"linear",
          grid: {
            display: true,
            borderColor: "#8f8f8f",
            borderWidth: 1.2,
            lineWidth: 1.1,
            color: "8f8f8f",
            drawOnChartArea: true,
            drawBorder: true
          },
          title: {
            display: true,
            text: ytext,
            font: { size: 16, weight: "bold" },
          },
        },
        x: {
          display:true,
          // position:{y:0},
          stacked: false,
          beginAtZero: false,                
          ticks: {
            font: { size: 14 },
            z: 1000,
          },
          grid: {
            display: true,
            borderWidth: 1.2,
            drawOnChartArea: false,
            drawBorder: false,
            drawTicks: true,
            tickColor: "#8f8f8f",
            tickLength: 6,
            tickWidth: 1,
          },
         title: {
            display: true,
            text: xtext,
            font: { size: 16, weight: "bold" },
          }, 
        },
      },
    }
  })

this.chart.update()

}

ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this.mysubscription.unsubscribe()
  }
}