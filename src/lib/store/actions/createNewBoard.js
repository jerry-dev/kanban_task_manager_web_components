export default function(context, payload) {
    const boards = JSON.parse(JSON.stringify(context.state.boards));
    const newBoard = {
        name: payload.name,
        columns: []
    };

    payload.columns.forEach((columnName) => {
        newBoard.columns[newBoard.columns.length] = { name: columnName, tasks: [] };
    });

    context.commit({type: 'CREATE_NEW_BOARD', payload: newBoard});
}