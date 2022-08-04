export default function(context, payload) {
    const themeValue = payload;
    context.commit({type: 'SET_THEME', payload: themeValue});
}