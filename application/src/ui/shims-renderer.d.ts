
/** Tells typescript what properties are available on the global "window" object. Useful for preloads. */
interface Window {
    versions: {
        node: any,
        chrome: any,
        electron: any,
        ping: any,
    }
}