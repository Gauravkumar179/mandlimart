import React, { useContext, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
  Dimensions,
  Image,
  FlatList,
} from 'react-native';
import { supabase } from '../supabase';
import { UserContext } from '../context/userContext';
import Carousel from 'react-native-reanimated-carousel';
import Icon from "react-native-vector-icons/MaterialIcons";


export default function HomeScreen({ navigation }) {
  const { user, setUser } = useContext(UserContext);
  const [search, setSearch] = useState('');
  const [products, setProducts] = useState([]);

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      navigation.replace('Login');
    } catch (error) {
      Alert.alert('Logout Failed', error.message);
    }
  };

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from('product')
        .select('id,itemName, itemurl, price,description');

      if (error) {
        console.error('❌ Failed to fetch products:', error.message);
      } else {
        setProducts(data);
      }
    };

    fetchProducts();
  }, []);

  const filteredProducts = products.filter((item) =>
    item.itemName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {/* App Bar */}
      <View style={styles.appBar}>
        <Text style={styles.appTitle}>Mandlimart</Text>
        <View style={styles.rightSection}>
          <Text style={styles.userName}>
            {typeof user?.user_metadata?.full_name === 'string'
              ? user.user_metadata.full_name
              : 'Guest'}
          </Text>
          {/* <TouchableOpacity onPress={logout} style={styles.logoutIcon}> */}
             <Icon
              name="logout"
              color="white"
              size={24}
              style={styles.logoutIcon}
              iconType="material-community"
              onPress={() => {logout}}
            /> 
            {/* <Text style={styles.logoutEmoji}>🏃‍♂️</Text> */}
          {/* </TouchableOpacity> */}
        </View>
      </View>

      {/* Search & Content */}
      <View style={styles.body}>
        <View style={styles.searchContainer}>
           <Icon
              name="search"
              color="#666"
              size={15}
              style={styles.searchEmoji}
              iconType="material-community"
            /> 
          {/* <Text style={styles.searchEmoji}>🔍</Text> */}
          <TextInput
            style={styles.searchInput}
            placeholder="Search groceries, kirana, etc..."
            placeholderTextColor="#999"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Image Carousel */}
        <Carousel
          width={Dimensions.get('window').width - 40}
          height={180}
          autoPlay
          data={[
            require('../../assets/product1.jpg'),
            require('../../assets/product2.jpeg'),
            require('../../assets/product3.jpg'),
            require('../../assets/product4.jpeg'),
            require('../../assets/product5.jpeg'),
            require('../../assets/product6.jpeg'),
            require('../../assets/product7.jpg'),
          ]}
          scrollAnimationDuration={1000}
          renderItem={({ item }) => (
            <Image
              source={item}
              style={{
                width: '100%',
                height: 180,
                borderRadius: 12,
                resizeMode: 'cover',
              }}
            />
          )}
          style={{ marginTop: 20 }}
        />

        <View style={{ height: 20 }} />
        <Text style={styles.sectionTitle}>Popular Products</Text>
        <View style={{ height: 10 }} />

        {/* Product List */}
        <FlatList
          data={filteredProducts}
          numColumns={2}
          keyExtractor={(item, index) => index.toString()}
          columnWrapperStyle={styles.row}
          contentContainerStyle={{ paddingBottom: 100 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.productBox}
              onPress={() => {
                // Ensure `item` contains only serializable primitives
                navigation.navigate('Orderdetails', {
                  item: {
                    itemName: item.itemName,
                    itemurl: item.itemurl,
                    id: item.id,
                    price: item.price,
                    description: item.description || 'No description available.',
                  },
                });
              }}
            >
              <Image source={{ uri: item.itemurl }} style={styles.productImage} />
              <Text style={styles.productName}>{item.itemName}</Text>
              <Text style={styles.productName}>{`${item.price} ₹`}</Text>
            </TouchableOpacity>
          )}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  appBar: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  appTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userName: {
    fontSize: 16,
    color: 'white',
    marginRight: 8,
  },
  logoutIcon: {
    padding: 4,
  },
  logoutEmoji: {
    fontSize: 20,
    marginLeft: 8,
  },
  body: {
    flex: 1,
    padding: 20,
    flexDirection: 'column',
  },
  searchContainer: {
    flexDirection: 'row',
    backgroundColor: '#f2f2f2',
    borderRadius: 18,
    paddingVertical: 6,
    paddingHorizontal: 8,
    alignItems: 'center',
    elevation: 2,
  },
  searchEmoji: {
    fontSize: 18,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  row: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  productBox: {
    flex: 0.48,
    aspectRatio: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  productImage: {
    width: '100%',
    height: '70%',
    borderRadius: 8,
    resizeMode: 'cover',
    marginBottom: 6,
  },
  productName: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    color: '#333',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#444',
    marginLeft: 12,
    marginBottom: 4,
  },
});
