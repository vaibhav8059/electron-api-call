"use strict";
const path = require("path");
const { app, BrowserWindow, Menu, ipcMain } = require("electron");
const { is } = require("electron-util");
const unhandled = require("electron-unhandled");
const debug = require("electron-debug");
const contextMenu = require("electron-context-menu");
const config = require("./config.js");
const menu = require("./menu.js");

unhandled();
debug();
contextMenu();

// Note: Must match `build.appId` in package.json
app.setAppUserModelId("com.company.AppName");

app.setLoginItemSettings({
    openAtLogin: true    
})

let tabCount = 0;

// Uncomment this before publishing your first version.
// It's commented out as it throws an error if there are no published versions.
// if (!is.development) {
// 	const FOUR_HOURS = 1000 * 60 * 60 * 4;
// 	setInterval(() => {
// 		autoUpdater.checkForUpdates();
// 	}, FOUR_HOURS);
//
// 	autoUpdater.checkForUpdates();
// }

// Prevent window from being garbage collected
let mainWindow;

const createMainWindow = async () => {
	const window_ = new BrowserWindow({
		title: app.name,
		show: false,
		width: 600,
		height: 400,
		webPreferences: {
            nodeIntegration: true,
			contextIsolation: false
        },
		modal:true
	});

	window_.on("ready-to-show", () => {
		window_.show();
	});

	window_.on("close", (event) =>{
		event.preventDefault()
		window_.hide()
	})

	await window_.loadFile(path.join(__dirname, "index.html"));
	return window_;
};

// Prevent multiple instances of the app
if (!app.requestSingleInstanceLock()) {
	app.quit();
}

app.on("second-instance", () => {
	if (mainWindow) {
		if (mainWindow.isMinimized()) {
			mainWindow.restore();
		}
		mainWindow.show();
	}
});

app.on('before-quit', () => {
    mainWindow = undefined;
});

app.on("window-all-closed", () => {
	if (!is.macos) {
		app.quit();
	}
});

(async () => {
	await app.whenReady();
	Menu.setApplicationMenu(menu);
	if(!mainWindow){
		mainWindow = await createMainWindow();
	}
})();






