import React, { useEffect, useRef } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { QliroOneCheckout } from '../src';
import { useDispatch, useStore } from './Store';
import { ProductItem } from './ProductItem';
import { client } from './Client';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Order } from '../src/models';
import { Cart, Product } from './models';
import { addProductToCart, removeProductFromCart } from './models/Cart';
import { useNavigation } from '@react-navigation/core';

export const CheckoutPage = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const store = useStore();
  const listRef = useRef<FlatList>(null);
  const checkoutRef = useRef<QliroOneCheckout>(null);

  useEffect(() => {
    const getCheckout = async () => {
      const checkout = await client.loadCheckout(
        store.cart!.id,
        store.productData!.settings,
      );
      dispatch({ type: 'ADD', data: { ...checkout } });
    };
    getCheckout();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const productsInCart = store.productData?.products.filter(p =>
    store.cart?.products.find(cp => cp.productId === p.id),
  );

  const onCartChanged = async (cart: Cart) => {
    // Lock interaction while fetching
    dispatch({ type: 'ADD', data: { ...store, cart } });
    checkoutRef.current?.lock();
    const updatedCart = await client.updateCart(cart.id, cart.products);
    dispatch({ type: 'ADD', data: { ...store, cart: updatedCart } });

    checkoutRef.current?.updateOrders();
  };

  const onAddProduct = (product: Product) => {
    if (!store.cart) {
      navigation.goBack();
      return;
    }
    const cart = addProductToCart(store.cart, product);
    onCartChanged(cart);
  };

  const onRemoveProduct = (product: Product) => {
    if (!store.cart) {
      navigation.goBack();
      return;
    }
    const cart = removeProductFromCart(store.cart, product);
    onCartChanged(cart);
  };

  const onOrderUpdate = (order: Order) => {
    console.log('onOrderUpdated');
    if (!store.cart) {
      return true;
    }
    const cartQuantity = store.cart.products
      .map(p => p.quantity)
      .reduce((q1, q2) => q1 + q2);

    if (cartQuantity === 0) {
      return true;
    }

    const orderQuantity = order.orderItems
      .map(o => o.quantity)
      .reduce((q1, q2) => q1 + q2);

    return cartQuantity === orderQuantity;
  };

  const onWillShowSuccess = () => {
    dispatch({ type: 'CHECKOUT_SUCCESS' });
    return false;
  };

  const onCheckoutLoaded = () => console.log('onCheckoutLoaded');
  const onPaymentProcessStart = () => console.log('onPaymentProcessStart');
  const onPaymentProcessEnd = () => {
    console.log('onPaymentProcessEnd');
    listRef.current?.scrollToOffset({ offset: 0 });
  };
  const onCustomerInfoChanged = () => console.log('onCustomerInfoChanged');
  const onPaymentMethodChanged = () => console.log('onPaymentMethodChanged');
  const onShippingMethodChanged = () => console.log('onShippingMethodChanged');
  const onShippingPriceChanged = () => console.log('onShippingPriceChanged');
  const onPaymentDeclined = (r: string) =>
    console.log(`onPaymentDeclined: ${r}`);
  const onCustomerDeauthenticating = () =>
    console.log('onCustomerDeauthenticating');

  return (
    <FlatList
      ref={listRef}
      style={style.container}
      ItemSeparatorComponent={() => <View style={style.separator} />}
      data={productsInCart}
      renderItem={({ item }) => (
        <ProductItem
          onAddProduct={onAddProduct}
          onRemoveProduct={onRemoveProduct}
          product={item}
        />
      )}
      ListFooterComponent={
        <SafeAreaView edges={['bottom']}>
          {store.qliroResponse?.orderHtmlSnippet && (
            <QliroOneCheckout
              ref={checkoutRef}
              orderHtml={store.qliroResponse?.orderHtmlSnippet}
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
            />
          )}
        </SafeAreaView>
      }
    />
  );
};

const style = StyleSheet.create({
  separator: {
    height: 1,
    width: '100%',
    color: 'gray',
  },
  container: { flexGrow: 1, backgroundColor: 'white' },
});
