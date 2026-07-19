const {contextBridge,ipcRenderer}=require('electron');
contextBridge.exposeInMainWorld('electronAPI',{
  onUpdateStatus:(cb)=>ipcRenderer.on('update-status',(_e,msg)=>cb(msg))
});