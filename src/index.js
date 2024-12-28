const { app, BrowserWindow, ipcMain, dialog  } = require('electron');
const path = require('path');
const started = require('electron-squirrel-startup')
const axios = require('axios');
const { exec } = require('child_process');

let mainWindow;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();

  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
// IPC handlers
ipcMain.handle('fetch-songs', async () => {
  try {
    const response = await axios.get('http://localhost:3000/api/song-requests'); // Replace with your API URL
    return response.data;
  } catch (error) {
    console.error('Error fetching songs:', error);
    return { error: 'Failed to fetch songs' };
  }
});

ipcMain.handle('select-download-folder', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory'],
  });

  if (result.canceled) {
    return null; // User canceled the folder selection
  }

  return result.filePaths[0]; // Return the selected folder path
});

ipcMain.handle('download-song', async (_, { title, artist, folder }) => {
  const searchQuery = `${title} ${artist}`;
  const outputFilePath = path.join(folder, `${title}-${artist}.mp3`);

  return new Promise((resolve, reject) => {
    const command = `cd C:/ & yt-dlp -x --audio-format mp3 -o "${outputFilePath}" "ytsearch1:${searchQuery}-official-audio"`;

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error: ${stderr}`);
        reject(`Failed to download ${title} by ${artist}`);
      } else {
        console.log(`Downloaded: ${stdout}`);
        resolve(`Downloaded ${title} by ${artist} to ${folder}`);
      }
    });
  });
});

ipcMain.handle('delete-song', async (_, {id}) => {
  const response = await fetch("http://localhost:3000/api/song-requests", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({id}),
  });
  if (!response.ok) throw new Error("Failed to delete song");
  return response.json();
});
