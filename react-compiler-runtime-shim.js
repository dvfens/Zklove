// React 19 compiler runtime shim
// This file provides a fallback for React compiler runtime imports

module.exports = {
  // Mock React compiler runtime functions
  useMemo: (fn, deps) => fn(),
  useCallback: (fn, deps) => fn(),
  useRef: (initialValue) => ({ current: initialValue }),
  useState: (initialState) => [initialState, () => {}],
  useEffect: () => {},
  useLayoutEffect: () => {},
  useReducer: (reducer, initialState) => [initialState, () => {}],
  useContext: (context) => context._currentValue,
  useImperativeHandle: () => {},
  useDebugValue: () => {},
  useDeferredValue: (value) => value,
  useTransition: () => [false, () => {}],
  useId: () => 'mock-id',
  useSyncExternalStore: (subscribe, getSnapshot) => getSnapshot(),
  useInsertionEffect: () => {},
  use: (promise) => promise,
  __esModule: true
};