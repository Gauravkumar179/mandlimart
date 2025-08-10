import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Pressable,
  SafeAreaView,Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {
  BannerAd,
  BannerAdSize,
  TestIds,
} from 'react-native-google-mobile-ads';

export default function OrderScreen({ route, navigation }) {
  const { item } = route.params;
  const [quantity, setQuantity] = useState(1);
  const totalPrice = item.price * quantity;

  const adUnitId = __DEV__
    ? TestIds.BANNER
    : 'ca-app-pub-3940256099942544/6300978111'; // Replace with real ad ID

  const increaseQty = () => setQuantity(prev => prev + 1);
  const decreaseQty = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));

  const handleAddToCart = () => {
    Alert.alert('Added to Cart', `You added ${item.itemName} x${quantity} to your cart.`);
    console.log('✅ Added to cart:', { ...item, quantity });
    // Store to context/redux here
  };

  const handlePlaceOrder = () => {
    navigation.navigate('OrderSummary', {
      item,
      quantity,
      totalPrice,
    });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* Header */}
      <View style={styles.appBar}>
        <Icon
          name="arrow-back"
          color="#fff"
          size={24}
          style={styles.backIcon}
          onPress={() => navigation.goBack()}
        />
        <Text style={styles.appTitle}>Order Details</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Main Content */}
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
            <Text style={styles.description}>
              {item.description }
            </Text>

            {/* Add to Cart Button */}
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

            {/* Buy Now Button */}
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
          onAdLoaded={() => console.log('✅ Ad loaded')}
          onAdFailedToLoad={(error) => console.warn('❌ Ad failed', error)}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  appBar: {
    backgroundColor: '#007AFF',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  appTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  backIcon: {
    padding: 4,
  },
  scrollContainer: {
    padding: 20,
  },
  container: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  left: {
    width: '80%',
    alignItems: 'center',
  },
  right: {
    width: '100%',
    paddingLeft: 10,
  },
  image: {
    width: '100%',
    height: '60%',
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
