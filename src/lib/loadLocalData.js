import mockData from '../data/mockdata.json' assert { type: 'json' };

const loadLocalData = (dispatch, isViewDataReady) => {
    if (!isViewDataReady) {
        dispatch({type: 'LOAD_APPLICATION_DATA', payload: JSON.parse(mockData.boards)});
        return dispatch({type: 'IS_APPLICATION_DATA_READY', payload: true});
    } else {
        return dispatch({type: 'IS_APPLICATION_DATA_READY', payload: true});
    }
};

export default loadLocalData;