import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export const ThankYouPage = () => {
  return (
    <View style={style.container}>
      <Text>Custom Made</Text>
      <Text>Thank You Page</Text>
    </View>
  );
};

const style = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: 'white', alignItems: 'center' },
});
