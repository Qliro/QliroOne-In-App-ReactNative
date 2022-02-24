import { useNavigation } from '@react-navigation/core';
import React, { useLayoutEffect } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { CheckoutButton } from './CheckoutButton';
import { client } from './Client';
import { Cart, Product } from './models';
import { addProductToCart, removeProductFromCart } from './models/Cart';
import { ProductItem } from './ProductItem';
import { useDispatch, useStore } from './Store';

export const HomePage = () => {
  const navigation = useNavigation();
  const store = useStore();
  const dispatch = useDispatch();
  const count = store.cart?.products
    .map(p => p.quantity)
    .reduce((p1, p2) => p1 + p2, 0);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <CheckoutButton
          count={count}
          onPress={() => navigation.navigate('Checkout')}
        />
      ),
      headerLeft: () => (
        <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
          <Text>Settings</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, count, dispatch]);

  const onCartChanged = async (cart: Cart) => {
    dispatch({ type: 'ADD', data: { ...store, cart } });
    const updatedCart = await client.updateCart(cart.id, cart.products);
    dispatch({ type: 'ADD', data: { ...store, cart: updatedCart } });
  };

  const onAddProduct = (product: Product) => {
    if (!store.cart) {
      return;
    }
    const cart = addProductToCart(store.cart, product);
    onCartChanged(cart);
  };

  const onRemoveProduct = (product: Product) => {
    if (!store.cart) {
      return;
    }
    const cart = removeProductFromCart(store.cart, product);
    onCartChanged(cart);
  };

  return (
    <FlatList
      style={style.container}
      ItemSeparatorComponent={() => <View style={style.separator} />}
      data={store.productData?.products}
      renderItem={({ item }) => (
        <ProductItem
          onAddProduct={onAddProduct}
          onRemoveProduct={onRemoveProduct}
          product={item}
        />
      )}
    />
  );
};

const style = StyleSheet.create({
  container: { backgroundColor: 'white' },
  separator: {
    height: 1,
    width: '100%',
    color: 'gray',
  },
});
