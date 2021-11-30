import React, {
  Dispatch,
  useContext,
  useEffect,
  useReducer,
  useState,
} from 'react';
import { QliroResponse } from '../src/models';
import { Cart, ProductData } from './models';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { client } from './Client';
import { useAppState } from './Helpers';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

interface Store {
  cart?: Cart;
  qliroResponse?: QliroResponse;
  productData?: ProductData;
}

type Action = { type: 'ADD'; data: Store } | { type: 'CHECKOUT_SUCCESS' };

const reducer = (state: Store, action: Action): Store => {
  console.log('action :>> ', action.type);
  switch (action.type) {
    case 'ADD':
      return { ...state, ...action.data };
    case 'CHECKOUT_SUCCESS':
      return { cart: undefined, qliroResponse: undefined };
  }
};

const storeCart = (cart: Cart) => {
  return AsyncStorage.setItem('cart', JSON.stringify(cart));
};

const getCart = async (): Promise<Cart> => {
  const persistedCart = await AsyncStorage.getItem('cart');
  let cart: Cart;
  if (persistedCart) {
    cart = await client.getCart(JSON.parse(persistedCart).id);
  } else {
    cart = await client.createCart();
    storeCart(cart);
  }
  return cart;
};

const StateContext = React.createContext<Store>({} as any);
const DispatchContext = React.createContext<Dispatch<Action>>({} as any);

export const useStore = () => useContext(StateContext);
export const useDispatch = () => useContext(DispatchContext);

export const StoreProvider = ({ children }: { children: any }) => {
  const [state, dispatch] = useReducer(reducer, {});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const getInitialData = async () => {
      try {
        const productData = await client.getProducts('hats');
        const cart = await getCart();
        const store: Store = {
          productData,
          cart,
        };
        dispatch({ type: 'ADD', data: store });
        setReady(true);
      } catch (error) {
        console.warn(error);
        return;
      }
    };

    getInitialData();
  }, []);

  useAppState(appState => {
    if (appState.match(/inactive|background/)) {
      if (state.cart) {
        storeCart(state.cart);
      }
    }
  });

  if (!ready) {
    return (
      <View style={style.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <DispatchContext.Provider value={dispatch}>
      <StateContext.Provider value={state}>{children}</StateContext.Provider>
    </DispatchContext.Provider>
  );
};

const style = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: 'center' },
});
