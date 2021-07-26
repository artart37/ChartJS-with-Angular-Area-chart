import { animate, style, transition, trigger } from "@angular/animations";

export const smoothappearance = trigger("smoothappearance",[
    transition(':enter',[
        style({opacity:"0"}),
        animate("0.5s ease", style({opacity:"1"}))
    ]),
]);

export const materrorhintanime = trigger("materrorhint",[
    transition(':enter',[
        style({
            opacity:0,
            transform: "translateY(-7px)"
        }),
        animate("300ms ease-out", style({
            opacity:1,
            transform: "translateY(0)"
        }),)
    ]),
])