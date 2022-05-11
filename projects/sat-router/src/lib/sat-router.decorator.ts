// import { Type } from "@angular/core";
// import { LoadChildrenCallback } from "@angular/router";
// import { BehaviorSubject } from "rxjs";
// import { routTypes } from "./static-data";

// /** Декоратор маршрутов для корневого модуля */
// export function SatRouterForRoot(...routs: { path: string, component?: Type<any>, loadChildren?: LoadChildrenCallback }[]): ClassDecorator
// {
//   return (target: any) =>
//   {
//     routs.forEach(element =>
//     {
//       routTypes.set(element.path, {
//         component: element.component,
//         loadChildren: element.loadChildren
//       });
//     });
//   };
// }

// /** Декоратор маршрутов для дочерних модулей */
// export function SatRouterForChildren(...routs: { path: string, component?: Type<any>, loadChildren?: LoadChildrenCallback }[]): ClassDecorator
// {
//   return (target: any) =>
//   {
//     target.ɵsat_rout = routs;
//   };
// }
