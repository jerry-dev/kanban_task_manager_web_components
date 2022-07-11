export default function(context, payload) {
    let currentBoard = payload.boardName.split("");
    currentBoard[0] = currentBoard[0].toUpperCase();

    currentBoard.forEach((item, index) => {
        if (item === "-") {
            currentBoard[index + 1] = currentBoard[index + 1].toUpperCase();
        }
    });

    currentBoard = currentBoard.join("").replace(/-/g, " ");

    let state = JSON.parse(JSON.stringify(context.state));

    for (let i = 0; i < state.boards.length; i++) {
        if (state.boards[i].name === currentBoard) {
            for (let j = 0; j < state.boards[i].columns.length; j++) {
                if (state.boards[i].columns[j].name === payload.columnName) {
                    
                    for (let y = 0; y < state.boards[i].columns[j].tasks.length; y++) {
                        if (state.boards[i].columns[j].tasks[y].title === payload.taskTitle) {
                            state.boards[i].columns[j].tasks[y].status = payload.newStatus
                            state.boards[i].columns[j].tasks[y].subtasks = payload.subtasks
                        }
                    }
                }
            }
        }
    }

    context.commit({ type: 'UPDATE_TASK', payload: state });
}