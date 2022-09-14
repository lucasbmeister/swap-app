let inputToken;
let loginButton;
let saveButton;
let refreshButton;
let logoutButton;
let loginContainer;
let stickerContainer;
let isLogged = false
let stickers = []
let savingStickers = false;

window.addEventListener('DOMContentLoaded', () => {
	inputToken = document.getElementById('token')
	loginButton = document.getElementById('login-button')
	loginContainer = document.getElementById('login-container')
	stickerContainer = document.getElementById('stickers')
	saveButton = document.getElementById('save-button')
	refreshButton = document.getElementById('refresh-button')
	logoutButton = document.getElementById('logout-button')
	saveButton.hidden = true
	refreshButton.hidden = true
	logoutButton.hidden = true
	loginButton.addEventListener('click', login)
	saveButton.addEventListener('click', saveStickers)
	refreshButton.addEventListener('click', getImages)
	logoutButton.addEventListener('click', logout)

	const token = localStorage.getItem('token')

	if (token) {
		inputToken.value = token;
		login()
	}
})

const logout = () => {
	isLogged = false;
	localStorage.setItem('token', '')
	stickerContainer.textContent = '';
	loginContainer.style = 'display: inherited;'
	saveButton.hidden = true
	refreshButton.hidden = true
	logoutButton.hidden = true

}

const login = () => {
	window.electron.ipcRenderer.invoke('request-login', inputToken.value)
		.then((data) => {
			isLogged = !!data
			if (isLogged) {
				localStorage.setItem('token', inputToken.value)
				loginContainer.style = 'display: none;'
				saveButton.hidden = false
				refreshButton.hidden = false
				logoutButton.hidden = false
				getImages()
			}
		})
}
const getImages = () => {
	window.electron.ipcRenderer.invoke('request-get-images', inputToken.value)
		.then((images) => {
			stickers = images
			stickerContainer.textContent = '';
			stickers.forEach(i => {
				const img = document.createElement('img')
				img.src = `data:image/png;base64,${i}`;
				stickerContainer.appendChild(img)
			})
		})
}

const saveStickers = () => {
	if (!savingStickers) {
		savingStickers = true;
		html2canvas(stickerContainer).then((canvas) => {

			const base64image = canvas.toDataURL("image/png");
			const a = document.createElement("a");

			a.href = base64image;
			a.download = "swap.png";
			a.click();
			savingStickers = false;
		});
	}
}