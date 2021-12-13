import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { CheckoutPage } from './CheckoutPage';
import { HomePage } from './HomePage';
import { SettingsPage } from './SettingsPage';
import { ThankYouPage } from './ThankYouPage';

type RootStackParameters = {
  Home: undefined;
  Checkout: undefined;
  Settings: undefined;
  ThankYou: undefined;
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
        <Stack.Screen name="Settings" component={SettingsPage} />
        <Stack.Screen name="ThankYou" component={ThankYouPage} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
