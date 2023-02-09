
import { contextBridge, ipcRenderer } from 'electron';

// NOTE: When adding new bridged items, make sure to update shims-renderer.d.ts with the new properties

contextBridge.exposeInMainWorld('versions', {
    node:     () => process.versions.node,
    chrome:   () => process.versions.chrome,
    electron: () => process.versions.electron,
    ping:     () => ipcRenderer.invoke('ping'),
});