# QliroOne Checkout

## What does QliroOne Checkout offer?

This package wraps QliroOne Checkout and exposes its functionality as a React Native component.

## Getting started

### Pod install

Run `cd ios && pod install`.

## Usage

Import the `QliroOneCheckout` component from `qliroone_reactnative` and use it like:

```jsx
import React from "react";
import { View } from "react-native";
import { QliroOneCheckout } from "qliroone_reactnative";

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
        onSessionExpired={() => {}}
        onCustomerDeauthenticating={() => {}}
        isScrollEnabled={scrollEnabled}
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
- [onSessionExpired](<https://developers.qliro.com/docs/qliro-one/frontend-features/listeners#onsessionexpired()>)

### SDK Specific Event props

- [onLogged](#onLogged)
- [onCompletePurchaseRedirect](#onCompletePurchaseRedirect)
- [onOrderUpdated](#onOrderUpdate)

### Checkout Actions

- [lock](https://developers.qliro.com/docs/qliro-one/checkout-features/update-order)
- [unlock](https://developers.qliro.com/docs/qliro-one/checkout-features/update-order)
- [enableScrolling](https://developers.qliro.com/docs/qliro-one/frontend-features/enable-scrolling)
- [excludeResultModules](https://developers.qliro.com/docs/qliro-one/customization/thank-you-page-customize#how-to)

### SDK Specific Actions

- [updateOrders](https://developers.qliro.com/docs/qliro-one/checkout-features/update-order)
- [onScroll](#onScroll)

### Configurable props

#### orderHtml

The html-snippet to the checkout, it is the html-snippet returned from the [getOrder](https://developers.qliro.com/docs/qliro-one/get-started/load-checkout#get-order).

#### scrollEnabled

Sets to enable scroll, default is false. If scrolling is disabled the component height is as tall as required.

### SDK Specific Event props

#### onOrderUpdated

Called after the ´updateOrders´ action has been called when Qliro One has synced its orders.
This might be called multiple times and should return true when the Qliro One and the app is in sync.
Once the order change can be validated, call removeOrderUpdateCallback and unset the locked property in order for the customer to interact with the checkout again.

Example:

```jsx
const checkoutRef = useRef<QliroOneCheckout>(null);

const onCartChanged = async () => {
  checkoutRef.current?.lock();
  /// ...
  const updatedCart = await ...
  /// ...
  checkoutRef.current?.addOrderUpdateCallback();
}

const onOrderUpdated = (order: Order) => {
  // Check that the order is synced with your order.
  const orderCorrect = localCart.products === order.orderItems;
  if (orderCorrect) {
    checkoutRef.current?.removeOrderUpdateCallback();
    checkoutRef.current?.unlock();
  }
};

// ...
<QliroOneCheckout
  onOrderUpdated={onOrderUpdated}
  // ...
/>;
```

#### onCompletePurchaseRedirect

A callback called when a purchase has been completed. The successUrl you created in the createCart will be provided in this callback in
an object as merchantConfirmationUrl: { merchantConfirmationUrl: string }

Example:

```jsx
<QliroOneCheckout
  // ...
  onCompletePurchaseRedirect={(options) => {
    dispatch({ type: "CHECKOUT_SUCCESS" });
    navigation.dispatch(
      StackActions.replace("ThankYou", {
        successUrl: options.merchantConfirmationUrl,
      })
    );
  }}
  // ...
  // ...
/>
```

### SDK Specific Actions

#### addOrderUpdateCallback and removeOrderUpdateCallback

Initiates and removes the order sync process.

See `onOrderUpdated`

#### locked and unlock

Initiates and removes the order sync process.

See `onOrderUpdated`

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
