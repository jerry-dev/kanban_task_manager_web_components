export default function(state, payload) {
    const { ...newState } = state;
    newState.theme = payload;
    sessionStorage.setItem('appState', JSON.stringify(newState));
    return newState;
}