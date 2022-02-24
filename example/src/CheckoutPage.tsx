import React, { useEffect, useRef, useState } from 'react';
import { FlatList, StyleSheet, View, ViewStyle } from 'react-native';
import { QliroOneCheckout, Order } from 'qliroone_reactnative';
import { useDispatch, useStore } from './Store';
import { ProductItem } from './ProductItem';
import { client } from './Client';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Cart, Product } from './models';
import { addProductToCart, removeProductFromCart } from './models/Cart';
import { useNavigation } from '@react-navigation/core';
import { StackActions } from '@react-navigation/native';

export const CheckoutPage = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const store = useStore();
  const [showProducts, setShowProducts] = useState(true);
  const listRef = useRef<FlatList>(null);
  const checkoutRef = useRef<QliroOneCheckout>(null);
  const orderHtml = store.qliroResponse?.orderHtmlSnippet;

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

  useEffect(() => {
    if (orderHtml) {
      checkoutRef.current?.loadOrderHtml(orderHtml);
    }
  }, [orderHtml]);

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
    navigation.dispatch(StackActions.replace('ThankYou'));
    return true;
  };

  const onCheckoutLoaded = () => console.log('onCheckoutLoaded');
  const onPaymentProcessStart = () => {
    setShowProducts(false);
    listRef.current?.scrollToOffset({ offset: 0 });
    console.log('onPaymentProcessStart');
  };
  const onPaymentProcessEnd = () => {
    setShowProducts(true);
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
  const onLogged = (message: string) => console.log(`onLogged: ${message}`);

  const qliroCheckout = (scrollEnabled: boolean, style?: ViewStyle) => (
    <SafeAreaView edges={['bottom']} style={style}>
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
    </SafeAreaView>
  );

  const orderItems = ({
    additionalStyle,
    listFooterComponent,
  }: {
    additionalStyle?: ViewStyle;
    listFooterComponent?: JSX.Element;
  }) => (
    <FlatList
      ref={listRef}
      style={[style.container, additionalStyle]}
      ItemSeparatorComponent={() => <View style={style.separator} />}
      data={showProducts ? productsInCart : []}
      renderItem={({ item }) => (
        <ProductItem
          onAddProduct={onAddProduct}
          onRemoveProduct={onRemoveProduct}
          product={item}
        />
      )}
      ListFooterComponent={listFooterComponent}
    />
  );

  const layouts = {
    oneScrollView: orderItems({
      listFooterComponent: qliroCheckout(false),
    }),
    twoScrollView: (
      <View style={style.twoScrollWrapper}>
        {orderItems({ additionalStyle: style.twoScrollWrapper })}
        {qliroCheckout(true, style.twoScrollCheckout)}
      </View>
    ),
    fullscreen: qliroCheckout(true, style.fullscreenCheckout),
  };

  return layouts[store.checkoutLayout || 'oneScrollView'];
};

const style = StyleSheet.create({
  separator: {
    height: 1,
    width: '100%',
    color: 'gray',
  },
  container: { flex: 1, backgroundColor: 'white' },
  twoScrollWrapper: { flex: 1 },
  twoScrollItemsWrapper: { height: '50%' },
  twoScrollCheckout: {
    height: '50%',
    backgroundColor: 'white',
    borderTopColor: 'lightgrey',
    borderTopWidth: 1,
  },
  fullscreenCheckout: { backgroundColor: 'white' },
});
