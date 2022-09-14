const { app, BrowserWindow, ipcMain, ipcRenderer } = require('electron')
const path = require('path')
const axios = require('axios')
const fs = require('fs')

const jar = {
	cookies: ''
}

const createWindow = () => {
	const win = new BrowserWindow({
		width: 800,
		height: 600,
		webPreferences: {
			preload: path.join(__dirname, 'preload.js')
		}
	})

	win.loadFile('index.html')
}

app.whenReady().then(() => {
	createWindow()
	app.on('activate', () => {
		if (BrowserWindow.getAllWindows().length === 0) createWindow()
	})
})

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') app.quit()
})

ipcMain.handle('request-login', async (event, token) => {
	const params = new URLSearchParams();
	params.append('platform', 'WebGL');
	params.append('version', '3.0.0');
	params.append('access_token', token);

	const response = await axios.post('https://paninistickeralbum.fifa.com/mobile/session/login_via_access_token.json', params, { withCredentials: true })
	jar.cookies = response.headers['set-cookie']
	const { data } = response
	return data
})

ipcMain.handle('request-get-images', async (event) => {
	const { data } = await axios.get('https://paninistickeralbum.fifa.com/api/init.json', {
		headers: {
			cookie: jar.cookies
		}
	})

	return data[1].stacks.swap.map(s => fs.readFileSync(path.resolve('images', `${s}.png`)).toString('base64'));
})