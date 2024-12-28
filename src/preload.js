// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  fetchSongs: () => ipcRenderer.invoke('fetch-songs'),
  showSaveDialog: async (defaultPath) => {
    return ipcRenderer.invoke('show-save-dialog', defaultPath);
  },
  selectDownloadFolder: () => ipcRenderer.invoke('select-download-folder'),
  downloadSong: (songDetails) => ipcRenderer.invoke('download-song', songDetails),
  deleteSong: (songDetails) => ipcRenderer.invoke('delete-song', songDetails)
});