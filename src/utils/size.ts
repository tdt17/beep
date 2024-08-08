import { action, makeAutoObservable } from "mobx";

export const size = makeAutoObservable({
    width: window.innerWidth,
    height: window.innerHeight,
})

window.addEventListener('resize', action(() => {
    size.width = window.innerWidth
    size.height = window.innerHeight
}))