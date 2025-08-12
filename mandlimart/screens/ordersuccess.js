import React, { useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function OrderSuccessScreen() {
  const navigation = useNavigation();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.navigate('BottomTab');
    }, 3000); // navigate after 3 seconds

    return () => clearTimeout(timer);
  }, [navigation]);

  const handleBackHome = () => {
    navigation.navigate('BottomTab');
  };

  return (
    <View style={styles.container}>
      <Image
        source={{
          uri: 'https://tse1.mm.bing.net/th/id/OIP.KBMWxOjON4mYn201QH-6zQHaD4?pid=Api&P=0&h=180',
        }}
        style={styles.image}
        resizeMode="contain"
      />
      <Text style={styles.title}>Order Placed Successfully!</Text>
      <Text style={styles.subtitle}>Thank you for shopping with us.</Text>

      <TouchableOpacity style={styles.button} onPress={handleBackHome}>
        <Text style={styles.buttonText}>Back to Home</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  image: {
    width: 250,
    height: 150,
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#28a745',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#28a745',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
