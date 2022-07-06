export default function(state, payload) {
    const { ...newState } = state;
    newState.isApplicationDataReady = payload;
    return newState;
}