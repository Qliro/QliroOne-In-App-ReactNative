import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { CheckoutPage } from './CheckoutPage';
import { HomePage } from './HomePage';

type RootStackParameters = {
  Home: undefined;
  Checkout: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParameters {}
  }
}

const Stack = createNativeStackNavigator<RootStackParameters>();

export const Navigation = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomePage} />
        <Stack.Screen name="Checkout" component={CheckoutPage} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
