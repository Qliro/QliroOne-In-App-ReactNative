import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';

interface Props {
  count?: number;
  style?: ViewStyle;
}

export const Badge = ({ count, style: s }: Props) => {
  if (count) {
    return (
      <View style={[style.badge, s]}>
        <Text style={style.badgeText}>{count}</Text>
      </View>
    );
  }
  return <></>;
};

const style = StyleSheet.create({
  badge: {
    position: 'absolute',
    width: 18,
    height: 18,
    borderRadius: 10,
    backgroundColor: 'red',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 12,
    color: 'white',
  },
});
