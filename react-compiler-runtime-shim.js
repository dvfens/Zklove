// React 19 Compiler Runtime Shim
// This file provides a compatibility layer for react/compiler-runtime

// For React 19, the compiler runtime is built-in but not properly exported
// This shim provides the necessary exports

module.exports = {
  // Basic compiler runtime functions
  c: (fn, deps) => fn,
  use: (value) => value,
  useMemo: (fn, deps) => fn(),
  useCallback: (fn, deps) => fn,
  
  // Additional compiler utilities
  useRef: (initialValue) => ({ current: initialValue }),
  useState: (initialState) => [initialState, () => {}],
  useEffect: () => {},
  useLayoutEffect: () => {},
  
  // Compiler-specific functions
  useOptimistic: (state, updateFn) => state,
  useActionState: (reducer, initialState) => [initialState, () => {}],
  useFormState: (action, initialState) => [initialState, () => {}],
  useFormStatus: () => ({ pending: false, data: null, method: null, action: null }),
};
