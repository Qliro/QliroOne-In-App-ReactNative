import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Badge } from './Badge';

interface Props {
  onPress: () => void;
  count?: number;
}

export const CheckoutButton = ({ onPress, count }: Props) => {
  return (
    <View>
      <TouchableOpacity disabled={!count} onPress={onPress}>
        <Text>Bag</Text>
      </TouchableOpacity>
      <Badge style={style.badge} count={count} />
    </View>
  );
};

const style = StyleSheet.create({
  badge: {
    top: -12,
    right: -5,
  },
});
