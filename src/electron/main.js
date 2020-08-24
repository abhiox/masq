const { app, BrowserWindow } = require('electron');
const path = require('path');
 
let mainWindow;
 
function createWindow() {
    mainWindow = new BrowserWindow({
        width:800,
        height:600,
        show: false,
        webPreferences: { nodeIntegration: true }
    });
    // const startURL = `file://${path.join(__dirname, '../../build/index.html')}`;
    const startURL = 'http://localhost:3000';
 
    mainWindow.loadURL(startURL);
 
    mainWindow.once('ready-to-show', () => mainWindow.show());
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}
app.on('ready', createWindow);
