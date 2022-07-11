export default function(state, payload) {
    const { ...newState } = state;
    newState.boards = payload.boards;
    return newState;
}