## Usage

Import the `QliroOneCheckout` component from `qliroone_reactnative` and use it like:

```jsx
import React from 'react';
import { View } from 'react-native';
import { QliroOneCheckout } from 'qliroone_reactnative';

// ...

const CheckoutPage = () => {
  // prettier-ignore
  const checkoutRef = useRef<QliroOneCheckout>(null);
  const onOrderUpdate = (order: Order) => {
    console.log('onOrderUpdated');
    return true;
  };
  const onWillShowSuccess = () => {
    console.log('onWillShowSuccess');
    return false;
  };
  const onCheckoutLoaded = () => console.log('onCheckoutLoaded');
  const onPaymentProcessStart = () => console.log('onPaymentProcessStart');
  const onPaymentProcessEnd = () => console.log('onPaymentProcessEnd');
  const onCustomerInfoChanged = () => console.log('onCustomerInfoChanged');
  const onPaymentMethodChanged = () => console.log('onPaymentMethodChanged');
  const onShippingMethodChanged = () => console.log('onShippingMethodChanged');
  const onShippingPriceChanged = () => console.log('onShippingPriceChanged');
  const onPaymentDeclined = (r: string) =>
    console.log(`onPaymentDeclined: ${r}`);
  const onCustomerDeauthenticating = () =>
    console.log('onCustomerDeauthenticating');
  const onLogged = (message: string) => console.log(`onLogged: ${message}`);

  return (
    <View>
      <QliroOneCheckout
        ref={checkoutRef}
        onCheckoutLoaded={onCheckoutLoaded}
        onCustomerInfoChanged={onCustomerInfoChanged}
        onPaymentMethodChanged={onPaymentMethodChanged}
        onPaymentProcessStart={onPaymentProcessStart}
        onPaymentProcessEnd={onPaymentProcessEnd}
        onShippingMethodChanged={onShippingMethodChanged}
        onShippingPriceChanged={onShippingPriceChanged}
        onOrderUpdated={onOrderUpdate}
        onWillShowSuccess={onWillShowSuccess}
        onPaymentDeclined={onPaymentDeclined}
        onCustomerDeauthenticating={onCustomerDeauthenticating}
        scrollEnabled={scrollEnabled}
        onLogged={onLogged}
      />
    </View>
  );
};
```

More information about these callbacks can be found in the [developer portal](https://developers.qliro.com/docs/qliro-one).

## Example App

See [Example apps README](./example/README.md) for information about the example app.
