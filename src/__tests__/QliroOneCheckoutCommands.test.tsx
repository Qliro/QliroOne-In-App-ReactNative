import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import {
  Dimensions,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  View,
} from 'react-native';
import { QliroOneCheckout, type QliroOneCheckoutRef } from '../index';
import { Commands } from '../QliroOneCheckoutNativeComponent';

jest.mock('../QliroOneCheckoutNativeComponent');

const MEASURED_PAGE_Y = 120;

function renderCheckout(
  props: React.ComponentProps<typeof QliroOneCheckout> = {}
) {
  const ref = React.createRef<QliroOneCheckoutRef>();
  const utils = render(<QliroOneCheckout ref={ref} {...props} />);
  return { ref, ...utils };
}

// The View mock from the react-native jest preset accepts a measure() callback and never calls
// it, so onScroll would never reach the native command. Swap in a measure that reports a known
// pageY on the outer View instance the component holds a ref to.
function stubMeasure(utils: ReturnType<typeof renderCheckout>) {
  // biome-ignore lint/suspicious/noExplicitAny: reaching into the RN View mock instance
  const outerView = utils.UNSAFE_getAllByType(View)[0]?.instance as any;
  outerView.measure = (
    callback: (
      x: number,
      y: number,
      width: number,
      height: number,
      pageX: number,
      pageY: number
    ) => void
  ) => callback(0, 0, 0, 0, 0, MEASURED_PAGE_Y);
}

// onScroll ignores the event itself and only reads Dimensions + measure(), so a minimal scroll
// payload is enough here.
function scrollEvent() {
  return {
    nativeEvent: {
      contentOffset: { x: 0, y: 0 },
      contentSize: { height: 1000, width: 400 },
      layoutMeasurement: { height: 800, width: 400 },
    },
  } as unknown as NativeSyntheticEvent<NativeScrollEvent>;
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('QliroOneCheckoutRef', () => {
  it('forwards lock to the native command', () => {
    const { ref } = renderCheckout();

    ref.current?.lock();

    expect(Commands.lock).toHaveBeenCalledTimes(1);
    expect(Commands.lock).toHaveBeenCalledWith(expect.anything());
  });

  it('forwards unlock to the native command', () => {
    const { ref } = renderCheckout();

    ref.current?.unlock();

    expect(Commands.unlock).toHaveBeenCalledTimes(1);
  });

  it('forwards addOrderUpdateCallback to the native command', () => {
    const { ref } = renderCheckout();

    ref.current?.addOrderUpdateCallback();

    expect(Commands.addOrderUpdateCallback).toHaveBeenCalledTimes(1);
  });

  it('forwards removeOrderUpdateCallback to the native command', () => {
    const { ref } = renderCheckout();

    ref.current?.removeOrderUpdateCallback();

    expect(Commands.removeOrderUpdateCallback).toHaveBeenCalledTimes(1);
  });

  it('forwards loadOrderHtml with the html payload', () => {
    const { ref } = renderCheckout();

    ref.current?.loadOrderHtml('<div>checkout</div>');

    expect(Commands.loadOrderHtml).toHaveBeenCalledWith(
      expect.anything(),
      '<div>checkout</div>'
    );
  });

  it('forwards enableCheckoutScrolling with the flag', () => {
    const { ref } = renderCheckout();

    ref.current?.enableCheckoutScrolling(true);

    expect(Commands.enableCheckoutScrolling).toHaveBeenCalledWith(
      expect.anything(),
      true
    );
  });

  it('forwards excludeResultModules with the module list', () => {
    const { ref } = renderCheckout();

    ref.current?.excludeResultModules(['upsell', 'newsletter']);

    expect(Commands.excludeResultModules).toHaveBeenCalledWith(
      expect.anything(),
      ['upsell', 'newsletter']
    );
  });
});

describe('onScroll', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('sends the screen height and the measured page offset', () => {
    const utils = renderCheckout();
    stubMeasure(utils);

    utils.ref.current?.onScroll(scrollEvent());

    expect(Commands.onScrollWithContainerHeight).toHaveBeenCalledTimes(1);
    expect(Commands.onScrollWithContainerHeight).toHaveBeenCalledWith(
      expect.anything(),
      Dimensions.get('screen').height,
      MEASURED_PAGE_Y
    );
  });

  it('throttles bursts of scroll events to one command per 250ms', () => {
    const utils = renderCheckout();
    stubMeasure(utils);

    utils.ref.current?.onScroll(scrollEvent());
    utils.ref.current?.onScroll(scrollEvent());
    utils.ref.current?.onScroll(scrollEvent());

    expect(Commands.onScrollWithContainerHeight).toHaveBeenCalledTimes(1);

    jest.advanceTimersByTime(250);
    utils.ref.current?.onScroll(scrollEvent());

    expect(Commands.onScrollWithContainerHeight).toHaveBeenCalledTimes(2);
  });

  it('stays throttled until the full window has elapsed', () => {
    const utils = renderCheckout();
    stubMeasure(utils);

    utils.ref.current?.onScroll(scrollEvent());
    jest.advanceTimersByTime(249);
    utils.ref.current?.onScroll(scrollEvent());

    expect(Commands.onScrollWithContainerHeight).toHaveBeenCalledTimes(1);
  });
});

describe('prop-driven commands', () => {
  it('loads orderHtml on mount', () => {
    renderCheckout({ orderHtml: '<div>first</div>' });

    expect(Commands.loadOrderHtml).toHaveBeenCalledTimes(1);
    expect(Commands.loadOrderHtml).toHaveBeenCalledWith(
      expect.anything(),
      '<div>first</div>'
    );
  });

  it('reloads when orderHtml changes and not when it is unchanged', () => {
    const ref = React.createRef<QliroOneCheckoutRef>();
    const { rerender } = render(
      <QliroOneCheckout ref={ref} orderHtml="<div>first</div>" />
    );

    rerender(<QliroOneCheckout ref={ref} orderHtml="<div>first</div>" />);
    expect(Commands.loadOrderHtml).toHaveBeenCalledTimes(1);

    rerender(<QliroOneCheckout ref={ref} orderHtml="<div>second</div>" />);
    expect(Commands.loadOrderHtml).toHaveBeenCalledTimes(2);
    expect(Commands.loadOrderHtml).toHaveBeenLastCalledWith(
      expect.anything(),
      '<div>second</div>'
    );
  });

  // The checkout ignores these commands until it has loaded, so the component defers them
  // until onCheckoutLoaded rather than firing them on mount.
  it('defers isCheckoutScrollEnabled until the checkout has loaded', () => {
    const { getByTestId } = renderCheckout({ isCheckoutScrollEnabled: true });

    expect(Commands.enableCheckoutScrolling).not.toHaveBeenCalled();

    fireEvent(getByTestId('native-checkout'), 'onCheckoutLoaded', {
      nativeEvent: {},
    });

    expect(Commands.enableCheckoutScrolling).toHaveBeenCalledWith(
      expect.anything(),
      true
    );
  });

  it('sends isCheckoutScrollEnabled=false explicitly', () => {
    const { getByTestId } = renderCheckout({ isCheckoutScrollEnabled: false });

    fireEvent(getByTestId('native-checkout'), 'onCheckoutLoaded', {
      nativeEvent: {},
    });

    expect(Commands.enableCheckoutScrolling).toHaveBeenCalledWith(
      expect.anything(),
      false
    );
  });

  it('does not touch scrolling when isCheckoutScrollEnabled is omitted', () => {
    const { getByTestId } = renderCheckout();

    fireEvent(getByTestId('native-checkout'), 'onCheckoutLoaded', {
      nativeEvent: {},
    });

    expect(Commands.enableCheckoutScrolling).not.toHaveBeenCalled();
  });

  it('defers excludedResultModules until the checkout has loaded', () => {
    const { getByTestId } = renderCheckout({
      excludedResultModules: ['upsell'],
    });

    expect(Commands.excludeResultModules).not.toHaveBeenCalled();

    fireEvent(getByTestId('native-checkout'), 'onCheckoutLoaded', {
      nativeEvent: {},
    });

    expect(Commands.excludeResultModules).toHaveBeenCalledWith(
      expect.anything(),
      ['upsell']
    );
  });

  it('registers the session expired callback when the prop is set', () => {
    const { getByTestId } = renderCheckout({ onSessionExpired: jest.fn() });

    fireEvent(getByTestId('native-checkout'), 'onCheckoutLoaded', {
      nativeEvent: {},
    });

    expect(Commands.addSessionExpiredCallback).toHaveBeenCalledTimes(1);
  });

  it('unregisters the session expired callback when the prop is dropped', () => {
    const ref = React.createRef<QliroOneCheckoutRef>();
    const { getByTestId, rerender } = render(
      <QliroOneCheckout ref={ref} onSessionExpired={jest.fn()} />
    );
    fireEvent(getByTestId('native-checkout'), 'onCheckoutLoaded', {
      nativeEvent: {},
    });
    expect(Commands.addSessionExpiredCallback).toHaveBeenCalledTimes(1);

    rerender(<QliroOneCheckout ref={ref} />);

    expect(Commands.removeSessionExpiredCallback).toHaveBeenCalled();
    expect(Commands.addSessionExpiredCallback).toHaveBeenCalledTimes(1);
  });

  it('removes the session expired callback when the prop is absent', () => {
    const { getByTestId } = renderCheckout();

    fireEvent(getByTestId('native-checkout'), 'onCheckoutLoaded', {
      nativeEvent: {},
    });

    expect(Commands.addSessionExpiredCallback).not.toHaveBeenCalled();
    expect(Commands.removeSessionExpiredCallback).toHaveBeenCalled();
  });
});

describe('unmount cleanup', () => {
  it('clears the scroll throttle timer', () => {
    jest.useFakeTimers();
    try {
      const utils = renderCheckout();
      stubMeasure(utils);

      utils.ref.current?.onScroll(scrollEvent());
      expect(jest.getTimerCount()).toBe(1);

      utils.unmount();

      expect(jest.getTimerCount()).toBe(0);
    } finally {
      jest.useRealTimers();
    }
  });

  // The callback add/remove commands are JavaScript evaluated inside the checkout's own web view,
  // which each native view owns, so unmounting the view is the teardown — the component
  // deliberately dispatches no commands on the way out. (React has also already detached nativeRef
  // by the time the cleanup runs, so any command from there would reach a detached view.)
  it('does not dispatch native commands on unmount', () => {
    const { getByTestId, unmount } = renderCheckout({
      onSessionExpired: jest.fn(),
    });
    fireEvent(getByTestId('native-checkout'), 'onCheckoutLoaded', {
      nativeEvent: {},
    });
    expect(Commands.addSessionExpiredCallback).toHaveBeenCalledTimes(1);
    (Commands.removeSessionExpiredCallback as jest.Mock).mockClear();

    expect(() => unmount()).not.toThrow();

    expect(Commands.removeOrderUpdateCallback).not.toHaveBeenCalled();
    expect(Commands.removeSessionExpiredCallback).not.toHaveBeenCalled();
  });
});
