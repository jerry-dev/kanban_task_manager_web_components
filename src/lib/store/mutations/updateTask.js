export default function(state, payload) {
    const { ...newState } = state;
    newState.boards = payload.boards;
    sessionStorage.setItem('appState', JSON.stringify(newState));
    return newState;
}