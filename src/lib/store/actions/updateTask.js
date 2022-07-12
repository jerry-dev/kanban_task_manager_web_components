export default function(context, payload) {
    let statusChange = false;
    const oldColumnPositionDetails = {
        board: null,
        oldColumnPosition: null,
        oldTaskPosition: null,
        newColumn: null
    };

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
                            //Checking if the status has changes
                            if (state.boards[i].columns[j].tasks[y].status !== payload.newStatus) {
                                // If the column
                                statusChange = !statusChange;
                                // Capturing the old position of the task to later cut and paste it
                                // to the new position.
                                oldColumnPositionDetails.board = i;
                                oldColumnPositionDetails.oldColumnPosition = j;
                                oldColumnPositionDetails.oldTaskPosition = y;
                                oldColumnPositionDetails.newColumn = payload.newStatus;
                            }
                            state.boards[i].columns[j].tasks[y].status = payload.newStatus;
                            state.boards[i].columns[j].tasks[y].subtasks = payload.subtasks;
                        }
                    }
                }
            }
        }
    }

    if (statusChange) {
        const boardPos = oldColumnPositionDetails.board;
        const colPos = oldColumnPositionDetails.oldColumnPosition;
        const taskPos = oldColumnPositionDetails.oldTaskPosition;

        for (let i = 0; i < state.boards[boardPos].columns.length; i++) {
            if (state.boards[boardPos].columns[i].name === oldColumnPositionDetails.newColumn) {
                state.boards[boardPos].columns[i].tasks.push(JSON.parse(JSON.stringify(state.boards[boardPos].columns[colPos].tasks[taskPos])));
                state.boards[boardPos].columns[colPos].tasks.splice(taskPos, 1);
            }
        }
    }    

    context.commit({ type: 'UPDATE_TASK', payload: state });
}