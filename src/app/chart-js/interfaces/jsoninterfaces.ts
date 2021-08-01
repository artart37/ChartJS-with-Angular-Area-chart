export interface Chartob {
    prevOrders:string,
    ltvLift:number,
    rating:number,
  }
export interface RatingandLtv{
  rating:number,
  ltvLift:number
}
  
//Because typescript interface doesn't exist at runtime, we will implement a type guard
export function isChartob(ob:any): ob is Chartob{ 
  return typeof ob.prevOrders === "string" && typeof ob.ltvLift === "number" && typeof ob.rating === "number"
}