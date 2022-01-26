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
      />
    </View>
  );
};
```

More information about these callbacks can be found in the [developer portal](https://developers.qliro.com/docs/qliro-one).

## Example App

### Setup

run `yarn` to install all dependencies

Before running iOS, also run the following:
`cd ios && pod install && ..`

### Both iOS and Android

Start the javascript bundler and keep it running:

`yarn start`

To run iOS:

`yarn ios`

To run Android:

`yarn android`
