import {
  act,
  fireEvent,
  render,
  renderHook,
} from '@testing-library/react-native';
import React from 'react';
import { QliroOneCheckout, useQliroOneCheckout } from '../index';
import { Commands } from '../QliroOneCheckoutNativeComponent';

jest.mock('../QliroOneCheckoutNativeComponent');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('useQliroOneCheckout', () => {
  it('starts idle with no error', () => {
    const { result } = renderHook(() => useQliroOneCheckout());

    expect(result.current.state).toBe('idle');
    expect(result.current.lastError).toBeNull();
    expect(result.current.ref.current).toBeNull();
  });

  it('records the latest state from onStateChanged', () => {
    const { result } = renderHook(() => useQliroOneCheckout());

    act(() => result.current.checkoutProps.onStateChanged('loading', 'idle'));
    expect(result.current.state).toBe('loading');

    act(() => result.current.checkoutProps.onStateChanged('ready', 'loading'));
    expect(result.current.state).toBe('ready');
  });

  it('records the latest error from onError', () => {
    const { result } = renderHook(() => useQliroOneCheckout());

    act(() => result.current.checkoutProps.onError('http_error', 'boom'));

    expect(result.current.lastError).toEqual({
      code: 'http_error',
      message: 'boom',
    });
  });

  // Documented: an error state is recoverable, and a host that reloads still wants the code that
  // caused it for reporting, so lastError survives a return to a healthy state.
  it('keeps lastError after the checkout recovers', () => {
    const { result } = renderHook(() => useQliroOneCheckout());

    act(() =>
      result.current.checkoutProps.onError('load_failed', 'network down')
    );
    act(() => result.current.checkoutProps.onStateChanged('ready', 'loading'));

    expect(result.current.state).toBe('ready');
    expect(result.current.lastError).toEqual({
      code: 'load_failed',
      message: 'network down',
    });
  });

  it('forwards to the caller-supplied handlers after recording', () => {
    const onStateChanged = jest.fn();
    const onError = jest.fn();
    const { result } = renderHook(() =>
      useQliroOneCheckout({ onStateChanged, onError })
    );

    act(() => result.current.checkoutProps.onStateChanged('ready', 'loading'));
    act(() =>
      result.current.checkoutProps.onError('parse_error', 'bad payload')
    );

    expect(onStateChanged).toHaveBeenCalledWith('ready', 'loading');
    expect(onError).toHaveBeenCalledWith('parse_error', 'bad payload');
  });

  // The handlers are held in a ref precisely so an inline arrow prop does not churn checkoutProps
  // every render — the component's effects key off prop identity.
  it('keeps checkoutProps stable across renders with inline handlers', () => {
    const { result, rerender } = renderHook(() =>
      useQliroOneCheckout({ onError: () => undefined })
    );
    const first = result.current.checkoutProps;

    rerender({});

    expect(result.current.checkoutProps).toBe(first);
  });

  it('calls the latest handler after a re-render', () => {
    const first = jest.fn();
    const second = jest.fn();
    const { result, rerender } = renderHook<
      ReturnType<typeof useQliroOneCheckout>,
      { onError: jest.Mock }
    >(({ onError }) => useQliroOneCheckout({ onError }), {
      initialProps: { onError: first },
    });

    rerender({ onError: second });
    act(() => result.current.checkoutProps.onError('load_failed', 'boom'));

    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledWith('load_failed', 'boom');
  });

  it('lock and unlock are no-ops before the component mounts', () => {
    const { result } = renderHook(() => useQliroOneCheckout());

    expect(() => {
      result.current.lock();
      result.current.unlock();
    }).not.toThrow();
    expect(Commands.lock).not.toHaveBeenCalled();
    expect(Commands.unlock).not.toHaveBeenCalled();
  });

  it('drives the native commands once wired to the component', () => {
    function Host() {
      const checkout = useQliroOneCheckout();
      hook = checkout;
      return <QliroOneCheckout {...checkout.checkoutProps} />;
    }
    let hook!: ReturnType<typeof useQliroOneCheckout>;

    render(<Host />);

    hook.lock();
    expect(Commands.lock).toHaveBeenCalledTimes(1);

    hook.unlock();
    expect(Commands.unlock).toHaveBeenCalledTimes(1);
  });

  it('tracks state and errors emitted by the component it is wired to', () => {
    function Host() {
      const checkout = useQliroOneCheckout();
      hook = checkout;
      return <QliroOneCheckout {...checkout.checkoutProps} />;
    }
    let hook!: ReturnType<typeof useQliroOneCheckout>;

    const { getByTestId } = render(<Host />);
    const native = getByTestId('native-checkout');

    fireEvent(native, 'onStateChanged', {
      nativeEvent: { state: 'loading', previousState: 'idle' },
    });
    expect(hook.state).toBe('loading');

    fireEvent(native, 'onError', {
      nativeEvent: { code: 'checkout_load_timeout', message: 'too slow' },
    });
    expect(hook.lastError).toEqual({
      code: 'checkout_load_timeout',
      message: 'too slow',
    });
  });
});
