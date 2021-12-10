import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useDispatch } from './Store';

export const SettingsPage = () => {
  const dispatch = useDispatch();
  return (
    <ScrollView style={style.container}>
      <Text selectable>070-4581515</Text>
      <Text selectable>780709-8889</Text>
      <TouchableOpacity
        style={style.button}
        onPress={() => dispatch({ type: 'CHECKOUT_SUCCESS' })}>
        <Text>Remove cart</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const style = StyleSheet.create({
  container: { backgroundColor: 'white' },
  button: { padding: 20 },
});
