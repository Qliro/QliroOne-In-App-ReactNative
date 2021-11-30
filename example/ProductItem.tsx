import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useStore } from './Store';
import { Badge } from './Badge';

import { Product } from './models/Product';

interface Props {
  product: Product;
  onAddProduct: (product: Product) => void;
  onRemoveProduct: (product: Product) => void;
}

export const ProductItem = ({
  product,
  onAddProduct,
  onRemoveProduct,
}: Props) => {
  const store = useStore();
  const cartProduct = store.cart?.products.find(
    p => p.productId === product.id,
  );
  return (
    <View style={style.container}>
      <View style={style.wrapper}>
        <Image
          resizeMode="contain"
          style={style.image}
          source={{ uri: product.image.secure_url }}
        />
        <Badge style={style.badge} count={cartProduct?.quantity} />
      </View>
      <View style={style.wrapper}>
        <Text>{product.name}</Text>
        <Text>{`${product.price} ${store.cart?.currency ?? 'SEK'}`}</Text>
      </View>
      <View style={[style.wrapper, style.right]}>
        <TouchableOpacity onPress={() => onAddProduct(product)}>
          <Text style={style.touchable}>Add 1</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onRemoveProduct(product)}>
          <Text style={style.touchable}>Remove 1</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const style = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    flexDirection: 'row',
    height: 150,
    padding: 16,
  },
  badge: {
    top: 10,
    left: 10,
  },
  wrapper: {
    height: '100%',
    flex: 1,
    justifyContent: 'space-around',
  },
  right: {
    alignItems: 'flex-end',
  },
  touchable: {
    color: 'dodgerblue',
  },
  image: {
    height: '100%',
    width: '100%',
  },
});
