export default {
	isApplicationDataReady: JSON.parse(sessionStorage.getItem('appState'))?.isApplicationDataReady ?? false,
	boards: JSON.parse(sessionStorage.getItem('appState'))?.boards ?? [],
	theme: JSON.parse(sessionStorage.getItem('appState'))?.theme ?? 'light'
};