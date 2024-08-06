export const config = {
    debug: !!localStorage.getItem('DEBUG') || import.meta.env.VITE_DEBUG === 'true',
}

export const log = (...args: unknown[]) => {
    if (config.debug) {
        console.log(...args)
    }
}
