import { makeAutoObservable } from "mobx"

export const config = makeAutoObservable({
    debug: !!localStorage.getItem('DEBUG') || import.meta.env.VITE_DEBUG === 'true',
})

export const log = (...args: any[]) => {
    if (config.debug) {
        console.log(...args)
    }
}
