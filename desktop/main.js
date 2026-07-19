const {app,BrowserWindow,Menu,dialog}=require('electron');
const path=require('path');
const {autoUpdater}=require('electron-updater');

let mainWindow;

autoUpdater.autoDownload=false;
autoUpdater.autoInstallOnAppQuit=true;

autoUpdater.on('update-available',(info)=>{
  dialog.showMessageBox(mainWindow,{
    type:'info',
    title:'Actualización disponible',
    message:`Nueva versión ${info.version} disponible`,
    detail:'¿Descargar e instalar la actualización?',
    buttons:['Sí','No'],
    defaultId:0,
    cancelId:1
  }).then(({response})=>{
    if(response===0){
      autoUpdater.downloadUpdate();
      if(mainWindow)mainWindow.webContents.send('update-status','Descargando actualización...');
    }
  });
});

autoUpdater.on('update-not-available',()=>{
  if(mainWindow)mainWindow.webContents.send('update-status','Versión actualizada');
});

autoUpdater.on('download-progress',(p)=>{
  if(mainWindow)mainWindow.webContents.send('update-status',`Descargando: ${Math.round(p.percent)}%`);
});

autoUpdater.on('update-downloaded',()=>{
  dialog.showMessageBox(mainWindow,{
    type:'info',
    title:'Actualización lista',
    message:'La actualización se descargó. ¿Reiniciar ahora?',
    buttons:['Ahora','Después'],
    defaultId:0,
    cancelId:1
  }).then(({response})=>{
    if(response===0)autoUpdater.quitAndInstall();
  });
});

autoUpdater.on('error',(e)=>{
  if(mainWindow)mainWindow.webContents.send('update-status','Error al buscar actualización');
});

function crearVentana(){
  mainWindow=new BrowserWindow({
    width:1200,
    height:800,
    minWidth:900,
    minHeight:600,
    title:'MemeCraft Code',
    webPreferences:{
      preload:path.join(__dirname,'preload.js'),
      nodeIntegration:false,
      contextIsolation:true
    }
  });

  Menu.setApplicationMenu(null);
  mainWindow.loadFile(path.join(__dirname,'index.html'));
  mainWindow.on('closed',()=>{mainWindow=null});
}

app.whenReady().then(()=>{
  crearVentana();
  if(!app.isPackaged)return;
  setTimeout(()=>autoUpdater.checkForUpdates(),3000);
});
app.on('window-all-closed',()=>app.quit());
app.on('activate',()=>{if(!mainWindow)crearVentana()});
