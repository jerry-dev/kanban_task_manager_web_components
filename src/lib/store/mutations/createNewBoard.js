export default function(state, payload) {
    const { ...newState } = state;
    newState.boards[newState.boards.length] = payload;
    sessionStorage.setItem('appState', JSON.stringify(newState));
    return newState;
}