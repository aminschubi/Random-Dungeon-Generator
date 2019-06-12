import { app, BrowserWindow } from 'electron'
import * as path from 'path'
import * as url from 'url'

let win: BrowserWindow;

app.on('ready', createWindow)

app.on('activate', () => {
    if (win === null) {
        createWindow()
    }
})

function createWindow() {
    win = new BrowserWindow({ width: 1056, height: 830 });

    win.loadURL(
        url.format({
            pathname: path.join(__dirname, `/../../dist/angular-electron/index.html`),
            protocol: 'file:',
            slashes: true,
        })
    );

    win.setResizable(false);

    //win.webContents.openDevTools()

    win.on('closed', () => {
        win = null;
    })
}