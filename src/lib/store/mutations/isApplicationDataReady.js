export default function(state, payload) {
    const { ...newState } = state;
    newState.isApplicationDataReady = payload;
    sessionStorage.setItem('appState', JSON.stringify(newState));
    return newState;
}