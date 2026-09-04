import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import { QliroOneCheckout } from '../index';

jest.mock('../QliroOneCheckoutNativeComponent');

function getNativeComponent(getByTestId: any) {
  return getByTestId('native-checkout');
}

describe('QliroOneCheckout', () => {
  describe('onShippingMethodChanged', () => {
    it('parses additionalShippingServices JSON string into an array', () => {
      const onShippingMethodChanged = jest.fn();
      const { getByTestId } = render(
        <QliroOneCheckout onShippingMethodChanged={onShippingMethodChanged} />
      );

      const nativeComponent = getNativeComponent(getByTestId);
      fireEvent(nativeComponent, 'onShippingMethodChanged', {
        nativeEvent: {
          shipping: {
            method: 'pickup',
            secondaryOption: 'option1',
            additionalShippingServices: JSON.stringify([
              'service1',
              'service2',
            ]),
            price: 100,
            priceExVat: 80,
            totalShippingPrice: 100,
            totalShippingPriceExVat: 80,
            accessCode: 'ABC123',
          },
        },
      });

      expect(onShippingMethodChanged).toHaveBeenCalledTimes(1);
      expect(onShippingMethodChanged).toHaveBeenCalledWith({
        method: 'pickup',
        secondaryOption: 'option1',
        additionalShippingServices: ['service1', 'service2'],
        price: 100,
        priceExVat: 80,
        totalShippingPrice: 100,
        totalShippingPriceExVat: 80,
        accessCode: 'ABC123',
      });
    });

    it('sets additionalShippingServices to undefined when not present', () => {
      const onShippingMethodChanged = jest.fn();
      const { getByTestId } = render(
        <QliroOneCheckout onShippingMethodChanged={onShippingMethodChanged} />
      );

      const nativeComponent = getNativeComponent(getByTestId);
      fireEvent(nativeComponent, 'onShippingMethodChanged', {
        nativeEvent: {
          shipping: {
            method: 'delivery',
          },
        },
      });

      expect(onShippingMethodChanged).toHaveBeenCalledTimes(1);
      expect(onShippingMethodChanged).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'delivery',
        })
      );
      const callArg = onShippingMethodChanged.mock.calls[0][0];
      expect(callArg.additionalShippingServices).toBeUndefined();
    });

    it('sets additionalShippingServices to undefined on invalid JSON', () => {
      const onShippingMethodChanged = jest.fn();
      const { getByTestId } = render(
        <QliroOneCheckout onShippingMethodChanged={onShippingMethodChanged} />
      );

      const nativeComponent = getNativeComponent(getByTestId);
      fireEvent(nativeComponent, 'onShippingMethodChanged', {
        nativeEvent: {
          shipping: {
            method: 'delivery',
            additionalShippingServices: 'not-valid-json{{{',
          },
        },
      });

      expect(onShippingMethodChanged).toHaveBeenCalledTimes(1);
      const callArg = onShippingMethodChanged.mock.calls[0][0];
      expect(callArg.additionalShippingServices).toBeUndefined();
    });

    // Regression: the Android bridge used to emit a raw list here instead of a JSON
    // string, which JSON.parse silently turned into undefined (PLIN-279).
    it('drops additionalShippingServices when sent as a raw array', () => {
      const onShippingMethodChanged = jest.fn();
      const { getByTestId } = render(
        <QliroOneCheckout onShippingMethodChanged={onShippingMethodChanged} />
      );

      const nativeComponent = getNativeComponent(getByTestId);
      fireEvent(nativeComponent, 'onShippingMethodChanged', {
        nativeEvent: {
          shipping: {
            method: 'pickup',
            additionalShippingServices: ['service1', 'service2'],
            price: 100,
            priceExVat: 80,
            totalShippingPrice: 100,
            totalShippingPriceExVat: 80,
          },
        },
      });

      expect(onShippingMethodChanged).toHaveBeenCalledTimes(1);
      const callArg = onShippingMethodChanged.mock.calls[0][0];
      expect(callArg.additionalShippingServices).toBeUndefined();
    });
  });

  describe('onOrderUpdated', () => {
    it('parses orderItems JSON string into an array', () => {
      const onOrderUpdated = jest.fn();
      const { getByTestId } = render(
        <QliroOneCheckout onOrderUpdated={onOrderUpdated} />
      );

      const orderItems = [
        { merchantReference: 'ref1', pricePerItemIncVat: 200, quantity: 2 },
        { merchantReference: 'ref2', pricePerItemIncVat: 50, quantity: 1 },
      ];

      const nativeComponent = getNativeComponent(getByTestId);
      fireEvent(nativeComponent, 'onOrderUpdated', {
        nativeEvent: {
          order: {
            merchantUpdateVersion: 'v1',
            totalPrice: 450,
            orderItems: JSON.stringify(orderItems),
          },
        },
      });

      expect(onOrderUpdated).toHaveBeenCalledTimes(1);
      expect(onOrderUpdated).toHaveBeenCalledWith({
        merchantUpdateVersion: 'v1',
        totalPrice: 450,
        orderItems,
      });
    });

    it('sets orderItems to undefined when not present', () => {
      const onOrderUpdated = jest.fn();
      const { getByTestId } = render(
        <QliroOneCheckout onOrderUpdated={onOrderUpdated} />
      );

      const nativeComponent = getNativeComponent(getByTestId);
      fireEvent(nativeComponent, 'onOrderUpdated', {
        nativeEvent: {
          order: {
            merchantUpdateVersion: 'v1',
            totalPrice: 0,
          },
        },
      });

      expect(onOrderUpdated).toHaveBeenCalledTimes(1);
      const callArg = onOrderUpdated.mock.calls[0][0];
      expect(callArg.orderItems).toBeUndefined();
    });

    it('sets orderItems to undefined on invalid JSON', () => {
      const onOrderUpdated = jest.fn();
      const { getByTestId } = render(
        <QliroOneCheckout onOrderUpdated={onOrderUpdated} />
      );

      const nativeComponent = getNativeComponent(getByTestId);
      fireEvent(nativeComponent, 'onOrderUpdated', {
        nativeEvent: {
          order: {
            merchantUpdateVersion: 'v1',
            totalPrice: 100,
            orderItems: '{bad json',
          },
        },
      });

      expect(onOrderUpdated).toHaveBeenCalledTimes(1);
      const callArg = onOrderUpdated.mock.calls[0][0];
      expect(callArg.orderItems).toBeUndefined();
    });

    // Regression: the Android bridge used to emit a raw list of maps here instead of a
    // JSON string, which JSON.parse silently turned into undefined (PLIN-279).
    it('drops orderItems when sent as a raw array', () => {
      const onOrderUpdated = jest.fn();
      const { getByTestId } = render(
        <QliroOneCheckout onOrderUpdated={onOrderUpdated} />
      );

      const nativeComponent = getNativeComponent(getByTestId);
      fireEvent(nativeComponent, 'onOrderUpdated', {
        nativeEvent: {
          order: {
            merchantUpdateVersion: 'v1',
            totalPrice: 450,
            orderItems: [
              {
                merchantReference: 'ref1',
                pricePerItemIncVat: 200,
                quantity: 2,
              },
            ],
          },
        },
      });

      expect(onOrderUpdated).toHaveBeenCalledTimes(1);
      const callArg = onOrderUpdated.mock.calls[0][0];
      expect(callArg.orderItems).toBeUndefined();
    });
  });
});
