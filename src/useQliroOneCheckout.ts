import { useCallback, useMemo, useRef, useState } from 'react';
import type {
  QliroOneCheckoutRef,
  QliroOneCheckoutState,
  QliroOneError,
  QliroOneErrorCode,
} from './types';

export interface UseQliroOneCheckoutOptions {
  /**
   * Called after the hook records the transition, with the same arguments as the component prop.
   */
  onStateChanged?: (
    state: QliroOneCheckoutState,
    previousState: QliroOneCheckoutState
  ) => void;
  /**
   * Called after the hook records the error, with the same arguments as the component prop.
   */
  onError?: (code: QliroOneErrorCode, message: string) => void;
}

export interface UseQliroOneCheckoutResult {
  /** Pass to the component as `ref`, or read `.current` for the imperative methods. */
  ref: React.RefObject<QliroOneCheckoutRef | null>;
  /** The latest lifecycle state. `'idle'` until the checkout reports otherwise. */
  state: QliroOneCheckoutState;
  /** The most recent error, or `null` if none has been reported yet. */
  lastError: QliroOneError | null;
  /** Lock the checkout frontend. A no-op before the component has mounted. */
  lock: () => void;
  /** Unlock the checkout frontend. A no-op before the component has mounted. */
  unlock: () => void;
  /**
   * The props the hook needs wired up. Spread onto `<QliroOneCheckout>` — it carries `ref`,
   * `onStateChanged` and `onError`, so spread it *before* any of those you also pass by hand.
   */
  checkoutProps: {
    ref: React.RefObject<QliroOneCheckoutRef | null>;
    onStateChanged: (
      state: QliroOneCheckoutState,
      previousState: QliroOneCheckoutState
    ) => void;
    onError: (code: QliroOneErrorCode, message: string) => void;
  };
}

/**
 * Tracks the checkout's lifecycle state and last error, and hands back the ref plus the two
 * imperative methods hosts reach for most.
 *
 * It is a convenience over the existing surface, not a second one: `state` is whatever
 * `onStateChanged` last reported and `lastError` whatever `onError` last reported, so anything the
 * hook exposes can still be done by wiring those props directly. Options passed in are invoked
 * after the hook updates its own state, which keeps a host's existing handlers working unchanged.
 *
 * `lastError` is not cleared on recovery — an `error` state is recoverable, and a host that reloads
 * still wants the code that caused it for reporting. Use `state` to decide whether the checkout is
 * currently broken, and {@link isFatalError} on `lastError.code` to decide whether it was
 * recoverable at all.
 *
 * @example
 * ```tsx
 * const checkout = useQliroOneCheckout();
 *
 * return (
 *   <QliroOneCheckout {...checkout.checkoutProps} orderHtml={orderHtml} />
 * );
 * ```
 */
export function useQliroOneCheckout(
  options: UseQliroOneCheckoutOptions = {}
): UseQliroOneCheckoutResult {
  const ref = useRef<QliroOneCheckoutRef>(null);
  const [state, setState] = useState<QliroOneCheckoutState>('idle');
  const [lastError, setLastError] = useState<QliroOneError | null>(null);

  // The caller's handlers are held in a ref so the callbacks below keep a stable identity across
  // renders. Without it an inline `onError={...}` would change `checkoutProps` every render, and
  // the component's effects key off prop identity.
  const handlers = useRef(options);
  handlers.current = options;

  const onStateChanged = useCallback(
    (next: QliroOneCheckoutState, previous: QliroOneCheckoutState) => {
      setState(next);
      handlers.current.onStateChanged?.(next, previous);
    },
    []
  );

  const onError = useCallback((code: QliroOneErrorCode, message: string) => {
    setLastError({ code, message });
    handlers.current.onError?.(code, message);
  }, []);

  const lock = useCallback(() => {
    ref.current?.lock();
  }, []);

  const unlock = useCallback(() => {
    ref.current?.unlock();
  }, []);

  const checkoutProps = useMemo(
    () => ({ ref, onStateChanged, onError }),
    [onStateChanged, onError]
  );

  return { ref, state, lastError, lock, unlock, checkoutProps };
}
