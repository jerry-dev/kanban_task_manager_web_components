import mockData from '../data/mockdata.json' assert { type: 'json' };

// Might need to save the store's state.js data within session storage
const loadLocalData = (dispatch, isViewDataReady) => {
    if (!isViewDataReady) {
        dispatch({type: 'LOAD_APPLICATION_DATA', payload: mockData.boards});
        return dispatch({type: 'IS_APPLICATION_DATA_READY', payload: true});
    } else {
        return dispatch({type: 'IS_APPLICATION_DATA_READY', payload: true});
    }
};

export default loadLocalData;