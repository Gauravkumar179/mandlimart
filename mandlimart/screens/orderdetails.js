import React, { useState, useLayoutEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Pressable,
  SafeAreaView,
  Alert,
} from 'react-native';
import {
  BannerAd,
  BannerAdSize,
  TestIds,
} from 'react-native-google-mobile-ads';
import { supabase } from '../supabase';

export default function OrderDetailScreen({ route, navigation }) {
  const { item } = route.params;
  const [quantity, setQuantity] = useState(1);
  const totalPrice = item.price * quantity;

  const adUnitId = __DEV__
    ? TestIds.BANNER
    : 'ca-app-pub-3940256099942544/6300978111'; // Replace with your real ad unit ID

  const increaseQty = () => setQuantity(prev => prev + 1);
  const decreaseQty = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));

  const handleAddToCart = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert('Login Required', 'You must be logged in to add items to your cart.');
        return;
      }

      const { error } = await supabase.from('cart').insert([
        {
          user_id: user.id,
          item_id: item.id,
          item_name: item.itemName,
          price: item.price,
          quantity: quantity,
          image_url: item.itemurl,
        },
      ]);

      if (error) {
        console.error('Add to cart error:', error);
        Alert.alert('Error', 'Could not add to cart. Please try again.');
      } else {
        Alert.alert('Added to Cart', `${item.itemName} x${quantity} has been added.`);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      Alert.alert('Error', 'Something went wrong.');
    }
  };

  const handlePlaceOrder = () => {
    navigation.navigate('OrderSummary', {
      item,
      quantity,
      totalPrice,
    });
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerBackTitleVisible: false,
      headerTitleAlign: 'center',
      headerTitle: 'Order Details',
      headerStyle: { backgroundColor: '#2e86de' },
      headerTintColor: '#fff',
      headerTitleStyle: { fontWeight: '700', fontSize: 20 },
    });
  }, [navigation]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          {/* Image + Quantity */}
          <View style={styles.left}>
            <Image source={{ uri: item.itemurl }} style={styles.image} />
            <View style={styles.quantityContainer}>
              <TouchableOpacity onPress={decreaseQty} style={styles.qtyButton}>
                <Text style={styles.qtyText}>–</Text>
              </TouchableOpacity>
              <Text style={styles.qtyValue}>{quantity}</Text>
              <TouchableOpacity onPress={increaseQty} style={styles.qtyButton}>
                <Text style={styles.qtyText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Info + Actions */}
          <View style={styles.right}>
            <Text style={styles.itemName}>{item.itemName}</Text>
            <Text style={styles.price}>Price: ₹{item.price}</Text>
            <Text style={styles.total}>Total: ₹{totalPrice}</Text>
            <Text style={styles.description}>{item.description}</Text>

            <Pressable
              onPress={handleAddToCart}
              android_ripple={{ color: '#ffffff30' }}
              style={({ pressed }) => [
                styles.addToCartBtn,
                pressed && { opacity: 0.9 },
              ]}
            >
              <Text style={styles.btnText}>Add to Cart</Text>
            </Pressable>

            <Pressable
              onPress={handlePlaceOrder}
              android_ripple={{ color: '#ffffff30' }}
              style={({ pressed }) => [
                styles.orderBtn,
                pressed && { opacity: 0.9 },
              ]}
            >
              <Text style={styles.btnText}>Buy Now</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      {/* Google Ad */}
      <View style={styles.adContainer}>
        <BannerAd
          unitId={adUnitId}
          size={BannerAdSize.INLINE_ADAPTIVE_BANNER}
          requestOptions={{ requestNonPersonalizedAdsOnly: true }}
          onAdLoaded={() => console.log('Ad loaded')}
          onAdFailedToLoad={(error) => console.warn('Ad failed', error)}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    padding: 20,
    flexGrow: 1,
  },
  container: {
    flexDirection: 'column',
  },
  left: {
    width: '100%',
    alignItems: 'center',
  },
  right: {
    width: '100%',
    paddingLeft: 0,
    marginTop: 20,
  },
  image: {
    width: '100%',
    height: 250,        // FIXED height here — this is crucial
    borderRadius: 12,
    resizeMode: 'cover',
  },
  quantityContainer: {
    flexDirection: 'row',
    marginTop: 16,
    alignItems: 'center',
  },
  qtyButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  qtyText: {
    fontSize: 20,
    color: '#fff',
  },
  qtyValue: {
    marginHorizontal: 16,
    fontSize: 20,
    fontWeight: 'bold',
  },
  itemName: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  price: {
    fontSize: 16,
    marginBottom: 4,
    color: '#555',
  },
  total: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    color: '#666',
    marginBottom: 20,
  },
  addToCartBtn: {
    backgroundColor: '#FF9800',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 12,
  },
  orderBtn: {
    backgroundColor: '#28A745',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  btnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  adContainer: {
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
});
