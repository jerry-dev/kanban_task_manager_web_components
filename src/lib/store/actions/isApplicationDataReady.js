//Signifies if the application data has been loaded into the data store
export default function(context, payload) {
    context.commit({type: 'IS_APPLICATION_DATA_READY', payload});
}