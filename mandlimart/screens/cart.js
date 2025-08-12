import React, { useEffect, useState, useContext,useLayoutEffect ,useCallback} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Image,
  SafeAreaView,
} from 'react-native';
import CheckBox from 'react-native-check-box';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../supabase';
import { UserContext } from '../context/userContext';
import { useFocusEffect } from '@react-navigation/native';


export default function CartScreen() {
  const { user } = useContext(UserContext);
  const [cartItems, setCartItems] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const navigation = useNavigation();

useFocusEffect(
  useCallback(() => {
    if (user?.id) {
      fetchCart();
    }
  }, [user])
);


  const fetchCart = async () => {
    try {
      const { data, error } = await supabase
        .from('cart')
        .select('id, item_name, price, quantity, user_id,item_id, image_url')
        .eq('user_id', user.id);

      if (error) throw error;
      setCartItems(data || []);
    } catch (err) {
      console.error(err);
      Alert.alert('Error fetching cart');
    }
  };
  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerTitle: 'My Cart',
      headerStyle: { backgroundColor: '#2e86de' },
      headerTintColor: '#fff',
      headerTitleStyle: { fontWeight: '700', fontSize: 20 },
    });
  }, [navigation]);
  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
    );
  };

  const deleteItem = async (id) => {
    try {
      const { error } = await supabase.from('cart').delete().eq('id', id);
      if (error) throw error;
      setCartItems((prev) => prev.filter((item) => item.id !== id));
      setSelectedIds((prev) => prev.filter((itemId) => itemId !== id));
    } catch (err) {
      Alert.alert('Error deleting item');
    }
  };

  const proceedToCheckout = () => {
    if (selectedIds.length === 0) {
      Alert.alert('Please select at least one item');
      return;
    }
    const selectedItems = cartItems.filter((item) => selectedIds.includes(item.id));
    navigation.navigate('Checkout', { selectedItems });
  };

  const totalPrice = cartItems
    .filter((item) => selectedIds.includes(item.id))
    .reduce((sum, item) => sum + item.price * item.quantity, 0);

  const renderItem = ({ item }) => {
    const isSelected = selectedIds.includes(item.id);
    return (
      <View style={styles.itemRow}>
        <CheckBox
          isChecked={isSelected}
          onClick={() => toggleSelect(item.id)}
          checkBoxColor="#28a745"
        />
        <Image
          source={{ uri: item.image_url }}
          style={styles.itemImage}
          resizeMode="cover"
        />
        <View style={styles.itemInfo}>
          <Text style={styles.itemText}>{item.item_name}</Text>
          <Text style={styles.itemSubText}>Qty: {item.quantity}</Text>
          <Text style={styles.price}>₹{item.price * item.quantity}</Text>
        </View>
        <TouchableOpacity onPress={() => deleteItem(item.id)}>
          <Icon name="delete" size={26} color="red" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🛒 My Cart</Text>
      </View> */}

      <View style={styles.container}>
        {cartItems.length > 0 ? (
          <>
            <FlatList
              data={cartItems}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderItem}
              showsVerticalScrollIndicator={false}
            />
            {selectedIds.length > 0 && (
              <View style={styles.totalContainer}>
                <Text style={styles.totalText}>Total: ₹{totalPrice}</Text>
              </View>
            )}
            <TouchableOpacity style={styles.checkoutBtn} onPress={proceedToCheckout}>
              <Text style={styles.checkoutText}>Proceed to Checkout</Text>
            </TouchableOpacity>
          </>
        ) : (
          <Text style={styles.emptyText}>Your cart is empty</Text>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  header: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: '#28a745',
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    elevation: 3
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold'
  },
  container: { flex: 1, padding: 15, backgroundColor: '#fff' },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#ddd'
  },
  itemImage: {
    width: 50,
    height: 50,
    borderRadius: 5,
    marginHorizontal: 10,
    backgroundColor: '#f0f0f0'
  },
  itemInfo: { flex: 1 },
  itemText: { fontSize: 16, fontWeight: 'bold' },
  itemSubText: { fontSize: 14, color: '#555' },
  price: { fontSize: 14, color: '#28a745', marginTop: 3 },
  totalContainer: {
    paddingVertical: 10,
    borderTopWidth: 1,
    borderColor: '#ddd',
    alignItems: 'flex-end'
  },
  totalText: { fontSize: 18, fontWeight: 'bold', color: '#000' },
  checkoutBtn: {
    backgroundColor: '#28a745',
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
    borderRadius: 5
  },
  checkoutText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  emptyText: { textAlign: 'center', color: '#999', marginTop: 20, fontSize: 16 }
});
