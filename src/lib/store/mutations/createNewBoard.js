export default function(state, payload) {
    const { ...newState } = state;
    newState.boards = payload;
    sessionStorage.setItem('appState', JSON.stringify(newState));
    return newState;
}