export default function(context, payload) {
    const boards = JSON.parse(JSON.stringify(context.state.boards));

    // Deletes the entire column if it's marked for deletion
    if (payload.deletedColumns.length > 0) {
        payload.deletedColumns.forEach((deletedColumnName) => {
            for (let i = 0; i < boards.length; i++) {
                if (boards[i].name === payload.boardNameDetails.originalBoardName) {
                    for (let y = 0; y < boards[i].columns.length; y++) {
                        if (boards[i].columns[y].name === deletedColumnName) {
                            boards[i].columns.splice(y, 1);
                        }
                    }
                }
            }
        });
    }

    payload.columnDetails.forEach((item) => {
        // Updates the column name if a change is the column names take place
        if (item.originalColumnStatus === "CHANGED") {
            for (let i = 0; i < boards.length; i++) {
                if (boards[i].name === payload.boardNameDetails.originalBoardName) {
                    for (let y = 0; y < boards[i].columns.length; y++) {
                        if (boards[i].columns[y].name === item.originalColumnName) {
                            boards[i].columns[y].name = item.newName;
                            boards[i].columns[y].tasks.forEach((task) => {
                                task.status = item.newName;
                            });
                        }
                    }
                }
            }
        }

        // Appends the new column if a new column has been marked
        if (item.originalColumnStatus === "NEW") {
            for (let i = 0; i < boards.length; i++) {
                if (boards[i].name === payload.boardNameDetails.originalBoardName) {
                    const newColumn = {
                        name: item.newName,
                        tasks: []
                    };

                    boards[i].columns[boards[i].columns.length] = newColumn;
                }
            }
        }
    });

    // Updates the board name if market for change
    // This should be the last operations out of all the changes.
    // Else, it can cause an issue with the searching for the other operations.
    if (payload.boardNameDetails.originalBoardNameStatus === "CHANGED") {
        for (let i = 0; i < boards.length; i++) {
            if (boards[i].name === payload.boardNameDetails.originalBoardName) {
                boards[i].name = payload.boardNameDetails.newBoardName
            }
        }
    }

    context.commit({type: 'EDIT_BOARD', payload: boards});
}