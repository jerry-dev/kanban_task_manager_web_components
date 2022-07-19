export default function(context, payload) {
    const boards = JSON.parse(JSON.stringify(context.state.boards))

    for (let i = 0; i < boards.length; i++) {
        if (boards[i].name === payload.board) {
            for (let j = 0; j < boards[i].columns.length; j++) {
                if (boards[i].columns[j].name === payload.column) {
                    for (let y = 0; y < boards[i].columns[j].tasks.length; y++) {
                        if (boards[i].columns[j].tasks[y].title === payload.title) {
                            boards[i].columns[j].tasks.splice(y, 1);
                        }
                    }
                }
            }
        }
    }

    context.commit({type: 'DELETE_TASK', payload: boards});
}