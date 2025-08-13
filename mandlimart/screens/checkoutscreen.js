import React, { useEffect, useState, useLayoutEffect, useContext,useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, StyleSheet, Image } from 'react-native';
import { supabase } from '../supabase';
import { UserContext } from '../context/userContext';
import { useFocusEffect } from '@react-navigation/native';


export default function CheckoutScreen({ route, navigation }) {
  const { selectedItems = [] } = route.params || {};
  const { user } = useContext(UserContext);

  const [addressList, setAddressList] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);

  // Header setup
  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerTitle: 'Place Order',
      headerStyle: { backgroundColor: '#2e86de' },
      headerTintColor: '#fff',
      headerTitleStyle: { fontWeight: '700', fontSize: 20 },
    });
  }, [navigation]);

  // Fetch addresses
  useFocusEffect(
  useCallback(() => {
    if (user?.id) {
      fetchAddresses();
    }
  }, [user])
);

  const fetchAddresses = async () => {
    const { data, error } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', user.id)
      .order('id', { ascending: false });

    if (!error) setAddressList(data || []);
  };

  const getTotal = () => {
    if (!Array.isArray(selectedItems)) return '0.00';
    return selectedItems
      .reduce((sum, item) => sum + item.price * item.quantity, 0)
      .toFixed(2);
  };

  const placeOrder = async () => {
    if (!selectedAddress) {
      Alert.alert('Please select an address before placing the order');
      return;
    }

    try {
      // 1️⃣ Prepare order data
      const orderItems = selectedItems.map(item => ({
        item_id: item.id,
        name: item.item_name,
        price: item.price,
        quantity: item.quantity,
        image: item.image_url || null
      }));

      const addressData = {
        name: selectedAddress.full_name,
        phone: selectedAddress.phone,
        address_line: selectedAddress.address_line,
        country: selectedAddress.country,
        street: selectedAddress.street,
        city: selectedAddress.city,
        state: selectedAddress.state,
        pincode: selectedAddress.pincode
      };

      // 2️⃣ Insert into orders table
      const { error: orderError } = await supabase
        .from('orders')
        .insert([
          {
            user_id: user.id,
            order_items: orderItems,
            address: addressData,
            payment_method: 'COD',
            total_price: parseFloat(getTotal()),
            status: 'Pending'
          }
        ]);

      if (orderError) throw orderError;

      // 3️⃣ Remove purchased items from cart
      const selectedItemIds = selectedItems.map(item => item.id);
      const { error: deleteError } = await supabase
        .from('cart')
        .delete()
        .eq('user_id', user.id)
        .in('id', selectedItemIds);

      if (deleteError) throw deleteError;

      // 4️⃣ Success
      Alert.alert('✅ Order placed successfully');
      navigation.navigate('OrderSuccess');
    } catch (err) {
      console.error(err);
      Alert.alert('Error placing order', err.message);
    }
  };

  return (
    <View style={styles.container}>
      {/* Items */}
      <Text style={styles.sectionTitle}>Your Items</Text>
      <FlatList
        data={selectedItems}
        keyExtractor={(item, index) => item.id?.toString() || index.toString()}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Image
              source={{ uri: item.image_url || 'https://via.placeholder.com/60' }}
              style={styles.itemImage}
            />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.itemName}>{item.item_name}</Text>
              <Text style={styles.itemQty}>Qty: {item.quantity}</Text>
              <Text style={styles.itemPrice}>₹{item.price * item.quantity}</Text>
            </View>
          </View>
        )}
      />

      {/* Addresses */}
      <Text style={styles.sectionTitle}>Delivery Address</Text>
      <FlatList
        data={addressList}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.addressCard,
              selectedAddress?.id === item.id && styles.selectedAddress,
            ]}
            onPress={() => setSelectedAddress(item)}
          >
            <Text style={styles.addressName}>{item.full_name}</Text>
            <Text style={styles.addressLine}>
              {item.address_line}
            </Text>
             <Text style={styles.addressLine}>
              {item.street}, {item.city}, {item.state},{item.country} - {item.pincode}
            </Text>
            <Text style={styles.addressPhone}>📞 {item.phone}</Text>
          </TouchableOpacity>
        )}
        ListFooterComponent={
          <TouchableOpacity
            style={styles.addAddressBtn}
            onPress={() =>
              navigation.navigate('AddAddress', {
                onGoBack: fetchAddresses,
              })
            }
          >
            <Text style={styles.addAddressText}>+ Add New Address</Text>
          </TouchableOpacity>
        }
      />

      {/* Payment */}
      <Text style={styles.sectionTitle}>Payment Method</Text>
      <View style={styles.paymentCard}>
        <Text style={styles.paymentText}>💵 Cash on Delivery</Text>
      </View>

      {/* Total + Place Order */}
      <Text style={styles.total}>Total: ₹{getTotal()}</Text>
      <TouchableOpacity style={styles.placeOrderBtn} onPress={placeOrder}>
        <Text style={styles.placeOrderText}>Place Order</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: '#f8f9fa' },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginTop: 15, marginBottom: 8, color: '#333' },

  item: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  itemImage: { width: 60, height: 60, borderRadius: 8, backgroundColor: '#f0f0f0' },
  itemName: { fontSize: 16, fontWeight: '600', color: '#333' },
  itemQty: { fontSize: 14, color: '#555', marginTop: 2 },
  itemPrice: { fontSize: 16, fontWeight: 'bold', color: '#28a745', marginTop: 5 },

  addressCard: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectedAddress: { borderColor: '#28a745', backgroundColor: '#eaffea' },
  addressName: { fontSize: 15, fontWeight: '600', color: '#333' },
  addressLine: { fontSize: 14, color: '#555', marginTop: 2 },
  addressPhone: { fontSize: 14, color: '#666', marginTop: 3 },

  addAddressBtn: {
    backgroundColor: '#2e86de',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  addAddressText: { color: '#fff', fontWeight: '600' },

  paymentCard: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  paymentText: { fontSize: 15, fontWeight: '600', color: '#333' },

  total: { fontSize: 20, fontWeight: 'bold', color: '#28a745', marginTop: 15, textAlign: 'right' },
  placeOrderBtn: {
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  placeOrderText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
