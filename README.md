# QliroOne Checkout

## What does QliroOne Checkout offer?

This package wraps QliroOne Checkout and exposes its functionality as a React Native component.

## Getting started

To get started you need to install [React Native WebView](https://github.com/react-native-webview/react-native-webview).

## Usage

Import the `QliroOneCheckout` component from `qliroone_reactnative` and use it like:

```jsx
import React from 'react';
import { View } from 'react-native';
import { QliroOneCheckout } from 'qliroone_reactnative';

// ...

const CheckoutPage = () => {
  const checkoutRef = useRef < QliroOneCheckout > null;

  return (
    <View>
      <QliroOneCheckout
        orderHtml={orderHtml}
        ref={checkoutRef}
        onCheckoutLoaded={() => {}}
        onCustomerInfoChanged={() => {}}
        onPaymentMethodChanged={() => {}}
        onPaymentProcessStart={() => {}}
        onPaymentProcessEnd={() => {}}
        onShippingMethodChanged={() => {}}
        onShippingPriceChanged={() => {}}
        onOrderUpdated={() => {}}
        onCompletePurchaseRedirect={() => {}}
        onPaymentDeclined={() => {}}
        onCustomerDeauthenticating={() => {}}
        scrollEnabled={scrollEnabled}
        onLogged={onLogged}
      />
    </View>
  );
};
```

### Configurable props

- [orderHtml](#orderHtml)
- [scrollEnabled](#scrollEnabled)

### Checkout Event props

- [onCheckoutLoaded](<https://developers.qliro.com/docs/qliro-one/frontend-features/listeners#oncheckoutloaded()>)
- [onCustomerInfoChanged](<https://developers.qliro.com/docs/qliro-one/frontend-features/listeners#oncustomerinfochanged()>)
- [onCustomerDeauthenticating](<https://developers.qliro.com/docs/qliro-one/frontend-features/listeners#oncustomerdeauthenticating()>)
- [onPaymentMethodChanged](<https://developers.qliro.com/docs/qliro-one/frontend-features/listeners#onpaymentmethodchanged()>)
- [onPaymentDeclined](<https://developers.qliro.com/docs/qliro-one/frontend-features/listeners#onpaymentdeclined()>)
- [onPaymentProcessStart](<https://developers.qliro.com/docs/qliro-one/frontend-features/listeners#onpaymentprocess()>)
- [onPaymentProcessEnd](<https://developers.qliro.com/docs/qliro-one/frontend-features/listeners#onpaymentprocess()>)
- [onShippingMethodChanged](<https://developers.qliro.com/docs/qliro-one/frontend-features/listeners#onshippingmethodchanged()>)
- [onShippingPriceChanged](<https://developers.qliro.com/docs/qliro-one/frontend-features/listeners#onshippingpricechanged()>)

### SDK Specific Event props

- [onLogged](#onLogged)
- [onCompletePurchaseRedirect](#onCompletePurchaseRedirect)
- [onOrderUpdated](#onOrderUpdate)

### Checkout Actions

- [lock](https://developers.qliro.com/docs/qliro-one/checkout-features/update-order)
- [unlock](https://developers.qliro.com/docs/qliro-one/checkout-features/update-order)
- [updateOrders](https://developers.qliro.com/docs/qliro-one/checkout-features/update-order)
- [enableScrolling](https://developers.qliro.com/docs/qliro-one/frontend-features/enable-scrolling)
- [excludeResultModules](https://developers.qliro.com/docs/qliro-one/customization/thank-you-page-customize#how-to)

### SDK Specific Actions

- [onScroll](#onScroll)

### Configurable props

#### orderHtml

The html-snippet to the checkout, it is the html-snippet returned from the [getOrder](https://developers.qliro.com/docs/qliro-one/get-started/load-checkout#get-order).

#### scrollEnabled

Sets to enable scroll, default is false. If scrolling is disabled the component height is as tall as required.

### SDK Specific Event props

#### onLogged

Callback function that is called when something is logged.

Example:

```jsx
<QliroOneCheckout
  onLogged={message => console.log(message)}
  // ...
  // ...
  // ...
/>
```

#### onOrderUpdated

Called after the updateOrders action has been called when Qliro One has synced its orders.
This might be called multiple times and should return true when the Qliro One and the app is in sync.
Returning true will unlock the Checkout, stopping the callback to be called again.

Example:

```jsx
const onCartChanged = async cart => {
  // Lock interaction while fetching
  checkoutRef.current?.lock();
  const updatedCart = await client.updateCart(cart.id, cart.products);
  // Make sure that Qliro one is up to date with your update
  checkoutRef.current?.updateOrders();
};

const onOrderUpdated = (order: Order) => {
  // Check that the order is synced with your order.
  const orderCorrect = localCart.products === order.orderItems;
  return orderCorrect;
};

// ...
<QliroOneCheckout
  onOrderUpdated={onOrderUpdated}
  // ...
  // ...
  // ...
/>;
```

#### onCompletePurchaseRedirect

A callback called when a purchase has been completed. The successUrl you created in the createCart will be provided in this callback.

Example:

```jsx
<QliroOneCheckout
  // ...
  onCompletePurchaseRedirect={successUrl => {
    dispatch({ type: 'CHECKOUT_SUCCESS' });
    navigation.dispatch(StackActions.replace('ThankYou', { successUrl }));
  }}
  // ...
  // ...
/>
```

### SDK Specific Actions

#### onScroll

If QliroOne is rendered inside a scrollview this function needs to be called on when scrolling to ensure correct positions on popups in the checkout.

Example:

```jsx
<FlatList
  ref={listRef}
  scrollEventThrottle={120}
  onScroll={() => {
    checkoutRef.current?.onScroll();
    // ...
  }}
  data={productsInCart}
  renderItem={({ item }) => (
    //
    // rendering products in cart
    //
  )}
  ListFooterComponent={
    <QliroOneCheckout
        ref={checkoutRef}
        // ...
        // ...
        // ...
      />
  }
/>
```

More information about these callbacks can be found in the [developer portal](https://developers.qliro.com/docs/qliro-one).
