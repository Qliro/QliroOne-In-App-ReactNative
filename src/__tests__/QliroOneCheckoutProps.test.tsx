import { render } from '@testing-library/react-native';
import React from 'react';
import { QliroOneCheckout } from '../index';

jest.mock('../QliroOneCheckoutNativeComponent');

function nativeProps(
  getByTestId: (id: string) => { props: Record<string, unknown> }
) {
  return getByTestId('native-checkout').props;
}

describe('loadTimeoutMs', () => {
  // Documented as 30000 in README.md and docs/order-lifecycle.md. Applied here rather than left to
  // each native SDK's own default, so the documented value cannot drift out from under one platform.
  it('forwards the documented default when the prop is omitted', () => {
    const { getByTestId } = render(<QliroOneCheckout />);

    expect(nativeProps(getByTestId).loadTimeoutMs).toBe(30000);
  });

  it('forwards an explicit value unchanged', () => {
    const { getByTestId } = render(<QliroOneCheckout loadTimeoutMs={5000} />);

    expect(nativeProps(getByTestId).loadTimeoutMs).toBe(5000);
  });

  // 0 disables the watchdog, so it must survive the default rather than be treated as "unset".
  it('forwards 0 rather than substituting the default', () => {
    const { getByTestId } = render(<QliroOneCheckout loadTimeoutMs={0} />);

    expect(nativeProps(getByTestId).loadTimeoutMs).toBe(0);
  });
});

describe('isScrollEnabled', () => {
  it('defaults to true', () => {
    const { getByTestId } = render(<QliroOneCheckout />);

    expect(nativeProps(getByTestId).isScrollEnabled).toBe(true);
  });

  it('forwards false', () => {
    const { getByTestId } = render(
      <QliroOneCheckout isScrollEnabled={false} />
    );

    expect(nativeProps(getByTestId).isScrollEnabled).toBe(false);
  });
});

// iOS-only prop, but the wrapper must still forward it verbatim: it widens the native SDK's URL
// scheme allowlist, so a merchant whose payment flow returns through a custom scheme has no other
// way to get past the hardening. Silently dropping it would look identical to the scheme being
// blocked by design.
describe('additionalAllowedUrlSchemes', () => {
  it('is undefined when the prop is omitted rather than defaulted here', () => {
    const { getByTestId } = render(<QliroOneCheckout />);

    // The default ([] — nothing added to the allowlist) belongs to the native SDK. Substituting one
    // here would mean this wrapper had to track a security default it does not own.
    expect(
      nativeProps(getByTestId).additionalAllowedUrlSchemes
    ).toBeUndefined();
  });

  it('forwards the schemes unchanged', () => {
    const { getByTestId } = render(
      <QliroOneCheckout
        additionalAllowedUrlSchemes={['myshop', 'myshop-alt']}
      />
    );

    expect(nativeProps(getByTestId).additionalAllowedUrlSchemes).toEqual([
      'myshop',
      'myshop-alt',
    ]);
  });

  it('does not leak onto the wrapper view', () => {
    const { getByTestId } = render(
      <QliroOneCheckout
        testID="checkout"
        additionalAllowedUrlSchemes={['myshop']}
      />
    );

    expect(
      getByTestId('checkout').props.additionalAllowedUrlSchemes
    ).toBeUndefined();
  });
});

// The component renders a wrapper View around the native one. Before it extended ViewProps, that
// wrapper consumed only `style` and silently dropped everything else — which meant a Detox or
// Maestro suite had no way to target the merchant's own checkout screen.
describe('ViewProps pass-through', () => {
  it('applies testID to the wrapper so host test suites can target it', () => {
    const { getByTestId } = render(<QliroOneCheckout testID="checkout" />);

    expect(getByTestId('checkout')).toBeTruthy();
  });

  it('passes accessibility and identity props through to the wrapper', () => {
    const { getByTestId } = render(
      <QliroOneCheckout
        testID="checkout"
        accessibilityLabel="Qliro checkout"
        nativeID="qliro-checkout"
        pointerEvents="box-none"
      />
    );

    const wrapper = getByTestId('checkout');
    expect(wrapper.props.accessibilityLabel).toBe('Qliro checkout');
    expect(wrapper.props.nativeID).toBe('qliro-checkout');
    expect(wrapper.props.pointerEvents).toBe('box-none');
  });

  it('does not leak checkout-specific props onto the wrapper', () => {
    const { getByTestId } = render(
      <QliroOneCheckout
        testID="checkout"
        orderHtml="<div/>"
        applePayMerchantId="merchant.com.example.app"
      />
    );

    const wrapper = getByTestId('checkout');
    expect(wrapper.props.orderHtml).toBeUndefined();
    expect(wrapper.props.applePayMerchantId).toBeUndefined();
  });

  it('still applies the style prop to the wrapper', () => {
    const { getByTestId } = render(
      <QliroOneCheckout testID="checkout" style={{ backgroundColor: 'red' }} />
    );

    expect(getByTestId('checkout').props.style).toEqual([
      { backgroundColor: 'red' },
      undefined,
    ]);
  });
});

describe('component metadata', () => {
  // Without this the component shows up as "ForwardRef" in React DevTools and in RN error stacks.
  it('has a displayName', () => {
    expect(QliroOneCheckout.displayName).toBe('QliroOneCheckout');
  });
});
