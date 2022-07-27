export default function(context, payload) {
    const boards = JSON.parse(JSON.stringify(context.state.boards));

    boards.forEach((board) => {
        if (board.name === payload.board) {

        }
    });

    for (let i = 0; i < boards.length; i++) {
        if (boards[i].name === payload.board) {
            for (let j = 0; j < boards[i].columns.length; j++) {
                if (boards[i].columns[j].name === payload.column) {

                    const newtask = {
                        title: payload.title,
                        description: payload.description,
                        status: payload.column,
                        subtasks: payload.subtasks
                    };

                    boards[i].columns[j].tasks.push(newtask);
                }
            }
        }
    }

    context.commit({type: 'ADD_NEW_TASK', payload: boards});
}