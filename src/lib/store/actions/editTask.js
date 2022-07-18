export default function(context, payload) {
    let state = JSON.parse(JSON.stringify(context.state));

    console.log('Incoming payload:', payload)
    // console.log('The state:', state);

    if (!payload.identifier.columnChanged) {
        for (let i = 0; i < state.boards.length; i++) {
            if (state.boards[i].name === payload.identifier.board) {
                for (let j = 0; j < state.boards[i].columns.length; j++) {
                    if (state.boards[i].columns[j].name === payload.identifier.column) {
                        for (let y = 0; y < state.boards[i].columns[j].tasks.length; y++) {
                            if (state.boards[i].columns[j].tasks[y].title === payload.identifier.title) {
                                state.boards[i].columns[j].tasks[y].title = payload.newState.newTitle;
                                // state.boards[i].columns[j].tasks[y].status = payload.newState.newColumn;
                                state.boards[i].columns[j].tasks[y].description = payload.newState.newDescription;
                                state.boards[i].columns[j].tasks[y].subtasks = payload.newState.newSubtasks;
                            }                        
                        }
                    }
                }
            }
        }
    }

    if (payload.identifier.columnChanged) {
        for (let i = 0; i < state.boards.length; i++) {
            // Looking for the relevant board
            if (state.boards[i].name === payload.identifier.board) {
                for (let j = 0; j < state.boards[i].columns.length; j++) {
                    // Looking for the column of interest
                    if (state.boards[i].columns[j].name === payload.newState.newColumn) {
                        // Once we find the column of interest
                        // We creating a new task object made up of the payload data
                        const newTask = {
                            title: payload.newState.newTitle,
                            description: payload.newState.newDescription,
                            status: payload.newState.newColumn,
                            subtasks: payload.newState.newSubtasks
                        }

                        // Injecting the new task into the column's list of tasks
                        state.boards[i].columns[j].tasks.push(newTask);
                    }

                    // Now to delete the edited task instance from where it was previously since it now resides elsewhere
                    if (state.boards[i].columns[j].name === payload.identifier.column) {
                        for (let y = 0; y < state.boards[i].columns[j].tasks.length; y++) {
                            if (state.boards[i].columns[j].tasks[y].title === payload.identifier.title) {
                                state.boards[i].columns[j].tasks.splice(y, 1);
                            }                        
                        }
                    }
                }
            }
        }
    }

    context.commit({ type: 'EDIT_TASK', payload: state.boards });
}