export default function(context, payload) {
    const boards = JSON.parse(JSON.stringify(context.state.boards))

    for (let i = 0; i < boards.length; i++) {
        if (boards[i].name === payload.board) {
            boards.splice(i, 1);
        }
    }

    context.commit({type: 'DELETE_BOARD', payload: boards});
}