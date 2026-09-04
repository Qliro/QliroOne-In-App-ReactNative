import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import { StyleSheet } from 'react-native';
import { QliroOneCheckout, type QliroOneCheckoutProps } from '../index';

jest.mock('../QliroOneCheckoutNativeComponent');

type Emit = (event: string, payload?: Record<string, unknown>) => void;

function renderCheckout(props: QliroOneCheckoutProps = {}) {
  const utils = render(<QliroOneCheckout {...props} />);
  const emit: Emit = (event, payload) =>
    fireEvent(utils.getByTestId('native-checkout'), event, payload);
  return { ...utils, emit };
}

describe('lifecycle events without a payload', () => {
  const cases: Array<[keyof QliroOneCheckoutProps, string]> = [
    ['onCheckoutLoaded', 'onCheckoutLoaded'],
    ['onPaymentProcessStart', 'onPaymentProcessStart'],
    ['onPaymentProcessEnd', 'onPaymentProcessEnd'],
    ['onSessionExpired', 'onSessionExpired'],
    ['onCustomerDeauthenticating', 'onCustomerDeauthenticating'],
    ['onClosePopup', 'onClosePopup'],
  ];

  it.each(cases)('forwards %s', (prop, event) => {
    const callback = jest.fn();
    const { emit } = renderCheckout({ [prop]: callback });

    emit(event, { nativeEvent: {} });

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it.each(cases)('does not throw when %s is not provided', (_prop, event) => {
    const { emit } = renderCheckout();

    expect(() => emit(event, { nativeEvent: {} })).not.toThrow();
  });
});

describe('onCustomerInfoChanged', () => {
  it('forwards the customer', () => {
    const onCustomerInfoChanged = jest.fn();
    const { emit } = renderCheckout({ onCustomerInfoChanged });
    const customer = {
      email: 'customer@example.com',
      mobileNumber: '+46700000000',
      address: { firstName: 'Ada', lastName: 'Lovelace', isMasked: true },
    };

    emit('onCustomerInfoChanged', { nativeEvent: { customer } });

    expect(onCustomerInfoChanged).toHaveBeenCalledWith(customer);
  });

  it('drops the event when the customer is missing', () => {
    const onCustomerInfoChanged = jest.fn();
    const { emit } = renderCheckout({ onCustomerInfoChanged });

    emit('onCustomerInfoChanged', { nativeEvent: {} });

    expect(onCustomerInfoChanged).not.toHaveBeenCalled();
  });
});

describe('onPaymentDeclined', () => {
  it('splits the reason object into code and message arguments', () => {
    const onPaymentDeclined = jest.fn();
    const { emit } = renderCheckout({ onPaymentDeclined });

    emit('onPaymentDeclined', {
      nativeEvent: {
        reason: {
          declineReason: 'MerchantDeclined',
          declineReasonMessage: 'Out of stock',
        },
      },
    });

    expect(onPaymentDeclined).toHaveBeenCalledWith(
      'MerchantDeclined',
      'Out of stock'
    );
  });

  it('drops the event when the reason is missing', () => {
    const onPaymentDeclined = jest.fn();
    const { emit } = renderCheckout({ onPaymentDeclined });

    emit('onPaymentDeclined', { nativeEvent: {} });

    expect(onPaymentDeclined).not.toHaveBeenCalled();
  });
});

describe('onPaymentMethodChanged', () => {
  it('forwards the payment method', () => {
    const onPaymentMethodChanged = jest.fn();
    const { emit } = renderCheckout({ onPaymentMethodChanged });
    const paymentMethod = {
      method: 'QliroInvoice',
      subtype: 'Standard',
      price: 29,
      priceExVat: 23.2,
    };

    emit('onPaymentMethodChanged', { nativeEvent: { paymentMethod } });

    expect(onPaymentMethodChanged).toHaveBeenCalledWith(paymentMethod);
  });

  it('drops the event when the payment method is missing', () => {
    const onPaymentMethodChanged = jest.fn();
    const { emit } = renderCheckout({ onPaymentMethodChanged });

    emit('onPaymentMethodChanged', { nativeEvent: {} });

    expect(onPaymentMethodChanged).not.toHaveBeenCalled();
  });
});

describe('onShippingPriceChanged', () => {
  it('splits the price object into shipping and total arguments', () => {
    const onShippingPriceChanged = jest.fn();
    const { emit } = renderCheckout({ onShippingPriceChanged });

    emit('onShippingPriceChanged', {
      nativeEvent: {
        shippingPrice: { newShippingPrice: 49, newTotalShippingPrice: 79 },
      },
    });

    expect(onShippingPriceChanged).toHaveBeenCalledWith(49, 79);
  });

  it('drops the event when the price is missing', () => {
    const onShippingPriceChanged = jest.fn();
    const { emit } = renderCheckout({ onShippingPriceChanged });

    emit('onShippingPriceChanged', { nativeEvent: {} });

    expect(onShippingPriceChanged).not.toHaveBeenCalled();
  });
});

describe('onCheckoutHeightChanged', () => {
  it('forwards the height and sizes the container to it', () => {
    const onCheckoutHeightChanged = jest.fn();
    const utils = renderCheckout({ onCheckoutHeightChanged });

    utils.emit('onCheckoutHeightChanged', { nativeEvent: { height: 640 } });

    expect(onCheckoutHeightChanged).toHaveBeenCalledWith(640);
    // biome-ignore lint/suspicious/noExplicitAny: the rendered JSON tree is untyped
    const root = utils.toJSON() as any;
    expect(StyleSheet.flatten(root.props.style).height).toBe(640);
  });

  it('sizes the container even without a consumer callback', () => {
    const utils = renderCheckout();

    utils.emit('onCheckoutHeightChanged', { nativeEvent: { height: 320 } });

    // biome-ignore lint/suspicious/noExplicitAny: the rendered JSON tree is untyped
    const root = utils.toJSON() as any;
    expect(StyleSheet.flatten(root.props.style).height).toBe(320);
  });
});

describe('onCompletePurchaseRedirect', () => {
  it('forwards the redirect options', () => {
    const onCompletePurchaseRedirect = jest.fn();
    const { emit } = renderCheckout({ onCompletePurchaseRedirect });

    emit('onCompletePurchaseRedirect', {
      nativeEvent: {
        options: { merchantConfirmationUrl: 'https://shop.example/thanks' },
      },
    });

    expect(onCompletePurchaseRedirect).toHaveBeenCalledWith({
      merchantConfirmationUrl: 'https://shop.example/thanks',
    });
  });

  it('drops the event when the options are missing', () => {
    const onCompletePurchaseRedirect = jest.fn();
    const { emit } = renderCheckout({ onCompletePurchaseRedirect });

    emit('onCompletePurchaseRedirect', { nativeEvent: {} });

    expect(onCompletePurchaseRedirect).not.toHaveBeenCalled();
  });
});

describe('onError', () => {
  it('splits the event into code and message arguments', () => {
    const onError = jest.fn();
    const { emit } = renderCheckout({ onError });

    emit('onError', {
      nativeEvent: {
        code: 'checkout_load_timeout',
        message: 'Checkout did not load within 30000ms',
      },
    });

    expect(onError).toHaveBeenCalledWith(
      'checkout_load_timeout',
      'Checkout did not load within 30000ms'
    );
  });

  it('drops the event when there is no payload', () => {
    const onError = jest.fn();
    const { emit } = renderCheckout({ onError });

    emit('onError', {});

    expect(onError).not.toHaveBeenCalled();
  });
});

describe('onLog', () => {
  it('splits the event into level and message arguments', () => {
    const onLog = jest.fn();
    const { emit } = renderCheckout({ onLog });

    emit('onLog', {
      nativeEvent: { level: 'debug', message: 'loading order html' },
    });

    expect(onLog).toHaveBeenCalledWith('debug', 'loading order html');
  });

  it('drops the event when there is no payload', () => {
    const onLog = jest.fn();
    const { emit } = renderCheckout({ onLog });

    emit('onLog', {});

    expect(onLog).not.toHaveBeenCalled();
  });
});

describe('onStateChanged', () => {
  it('forwards the new and previous state', () => {
    const onStateChanged = jest.fn();
    const { emit } = renderCheckout({ onStateChanged });

    emit('onStateChanged', {
      nativeEvent: { state: 'Completed', previousState: 'InProcess' },
    });

    expect(onStateChanged).toHaveBeenCalledWith('Completed', 'InProcess');
  });

  it('drops the event when there is no payload', () => {
    const onStateChanged = jest.fn();
    const { emit } = renderCheckout({ onStateChanged });

    emit('onStateChanged', {});

    expect(onStateChanged).not.toHaveBeenCalled();
  });
});

describe('onTelemetryEvent', () => {
  it('parses the JSON-encoded metadata map', () => {
    const onTelemetryEvent = jest.fn();
    const { emit } = renderCheckout({ onTelemetryEvent });

    emit('onTelemetryEvent', {
      nativeEvent: {
        name: 'checkout_loaded',
        durationMs: 812,
        metadata: JSON.stringify({ orderId: '1234', reused: 'false' }),
      },
    });

    expect(onTelemetryEvent).toHaveBeenCalledWith({
      name: 'checkout_loaded',
      durationMs: 812,
      metadata: { orderId: '1234', reused: 'false' },
    });
  });

  it('reports the event with undefined metadata when it is absent', () => {
    const onTelemetryEvent = jest.fn();
    const { emit } = renderCheckout({ onTelemetryEvent });

    emit('onTelemetryEvent', {
      nativeEvent: { name: 'checkout_loaded', durationMs: 10 },
    });

    expect(onTelemetryEvent).toHaveBeenCalledWith({
      name: 'checkout_loaded',
      durationMs: 10,
      metadata: undefined,
    });
  });

  it('keeps the event but drops metadata on invalid JSON', () => {
    const onTelemetryEvent = jest.fn();
    const { emit } = renderCheckout({ onTelemetryEvent });

    emit('onTelemetryEvent', {
      nativeEvent: { name: 'checkout_loaded', metadata: 'not-json{{{' },
    });

    expect(onTelemetryEvent).toHaveBeenCalledTimes(1);
    expect(onTelemetryEvent.mock.calls[0][0].metadata).toBeUndefined();
  });

  it('drops the event when there is no payload', () => {
    const onTelemetryEvent = jest.fn();
    const { emit } = renderCheckout({ onTelemetryEvent });

    emit('onTelemetryEvent', {});

    expect(onTelemetryEvent).not.toHaveBeenCalled();
  });
});

describe('onApplePayPaymentRequest', () => {
  it('parses the JSON-encoded payment data', () => {
    const onApplePayPaymentRequest = jest.fn();
    const { emit } = renderCheckout({ onApplePayPaymentRequest });

    emit('onApplePayPaymentRequest', {
      nativeEvent: {
        paymentData: JSON.stringify({ amount: 199, currency: 'SEK' }),
      },
    });

    expect(onApplePayPaymentRequest).toHaveBeenCalledWith({
      amount: 199,
      currency: 'SEK',
    });
  });

  it('drops the event on malformed payment data instead of throwing', () => {
    const onApplePayPaymentRequest = jest.fn();
    const { emit } = renderCheckout({ onApplePayPaymentRequest });

    expect(() =>
      emit('onApplePayPaymentRequest', {
        nativeEvent: { paymentData: '{not json' },
      })
    ).not.toThrow();

    expect(onApplePayPaymentRequest).not.toHaveBeenCalled();
  });

  it('drops the event when there is no payment data', () => {
    const onApplePayPaymentRequest = jest.fn();
    const { emit } = renderCheckout({ onApplePayPaymentRequest });

    emit('onApplePayPaymentRequest', { nativeEvent: {} });

    expect(onApplePayPaymentRequest).not.toHaveBeenCalled();
  });
});
