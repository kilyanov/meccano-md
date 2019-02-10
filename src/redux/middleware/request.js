const middleware = store => next => action => {
    if (action.type !== 'REQUEST') {
        return next(action);
    }

    const [startAction, successAction, failureAction] = action.actions;

    store.dispatch({type: startAction});

    action.promise.then(
        (response) => store.dispatch({type: successAction, data: response.data}),
        (error) => store.dispatch({type: failureAction, error})
    );
};

export default middleware;
