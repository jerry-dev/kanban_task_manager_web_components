//Injects the data into the state
export default function(context, payload) {
    console.info('Loading the application data into the data store');
    context.commit({type: 'LOAD_APPLICATION_DATA', payload});
}