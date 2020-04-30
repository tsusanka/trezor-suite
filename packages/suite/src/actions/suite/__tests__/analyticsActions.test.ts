import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import analyticsReducer from '@suite-reducers/analyticsReducer';
import * as analyticsActions from '@suite-actions/analyticsActions';

type AnalyticsState = ReturnType<typeof analyticsReducer>;

interface InitialState {
    analytics?: Partial<AnalyticsState>;
}

export const getInitialState = (state: InitialState | undefined) => {
    const analytics = state ? state.analytics : undefined;
    return {
        analytics: {
            ...analyticsReducer(undefined, { type: 'foo' } as any),
            ...analytics,
        },
    };
};

type State = ReturnType<typeof getInitialState>;
const mockStore = configureStore<State, any>([thunk]);

const initStore = (state: State) => {
    const store = mockStore(state);
    store.subscribe(() => {
        const action = store.getActions().pop();
        const { analytics } = store.getState();
        store.getState().analytics = analyticsReducer(analytics, action);
        // add action back to stack
        store.getActions().push(action);
    });
    return store;
};

describe('Analytics Actions', () => {
    beforeEach(() => {
        const mockSuccessResponse = {};
        const mockJsonPromise = Promise.resolve(mockSuccessResponse);
        const mockFetchPromise = Promise.resolve({
            json: () => mockJsonPromise,
        });
        // @ts-ignore
        global.fetch = jest.fn().mockImplementation(() => mockFetchPromise);
        // @ts-ignore
        jest.spyOn(global, 'fetch').mockImplementation(() => mockFetchPromise);
    });

    it('analyticsActions.report() - should report if enabled', () => {
        const state = getInitialState({ analytics: { enabled: true } });
        const store = initStore(state);
        store.dispatch(analyticsActions.report({ type: 'ui', payload: 'wrrr' }));
        // @ts-ignore
        expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('analyticsActions.report() - should not report if not enabled', () => {
        const state = getInitialState({ analytics: { enabled: false } });
        const store = initStore(state);
        store.dispatch(analyticsActions.report({ type: 'ui', payload: 'wrrr' }));
        // @ts-ignore
        expect(global.fetch).toHaveBeenCalledTimes(0);
    });
});