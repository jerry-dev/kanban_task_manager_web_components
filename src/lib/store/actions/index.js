import addNewTask from './addNewTask.js';
import createNewBoard from './createNewBoard.js';
import loadApplicationData from './loadApplicationData.js';
import isApplicationDataReady from './isApplicationDataReady.js';
import updateTask from './updateTask.js';
import editTask from './editTask.js';
import deleteTask from './deleteTask.js';
import editBoard from './editBoard.js';

export default {
    ADD_NEW_TASK: addNewTask,
	CREATE_NEW_BOARD: createNewBoard,
    LOAD_APPLICATION_DATA: loadApplicationData,
    IS_APPLICATION_DATA_READY: isApplicationDataReady,
    UPDATE_TASK: updateTask,
    EDIT_TASK: editTask,
    EDIT_BOARD: editBoard,
}