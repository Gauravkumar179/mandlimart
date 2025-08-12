import React, { useState, useLayoutEffect,useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { supabase } from '../supabase';
import { UserContext } from '../context/userContext';

export default function AddAddressScreen({ navigation }) {
  const { user } = useContext(UserContext);
    
  const [fullName, setFullName] = useState('');
  const [addressLine, setAddressLine] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [phone, setPhone] = useState('');

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: 'Add New Address',
      headerStyle: { backgroundColor: '#2e86de' },
      headerTintColor: '#fff',
      headerTitleStyle: { fontWeight: '700', fontSize: 20 },
    });
  }, [navigation]);

  const handleSave = async () => {
    if (!fullName || !addressLine || !city || !state || !postalCode || !phone) {
      Alert.alert('Please fill in all fields');
      return;
    }

   

    const { error } = await supabase.from('addresses').insert([
      {
        user_id: user.id,
        full_name: fullName,
        address_line: addressLine,
        city,
        state,
        pincode: postalCode,
        phone,
      },
    ]);

    if (error) {
      Alert.alert('Error saving address');
      return;
    }

    Alert.alert('Address added successfully');
    navigation.goBack();
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.label}>Full Name</Text>
      <TextInput
        style={styles.input}
        value={fullName}
        onChangeText={setFullName}
        placeholder="Enter full name"
      />

      <Text style={styles.label}>Address Line</Text>
      <TextInput
        style={styles.input}
        value={addressLine}
        onChangeText={setAddressLine}
        placeholder="Enter address"
      />

      <Text style={styles.label}>City</Text>
      <TextInput
        style={styles.input}
        value={city}
        onChangeText={setCity}
        placeholder="Enter city"
      />

      <Text style={styles.label}>State</Text>
      <TextInput
        style={styles.input}
        value={state}
        onChangeText={setState}
        placeholder="Enter state"
      />

      <Text style={styles.label}>Postal Code</Text>
      <TextInput
        style={styles.input}
        value={postalCode}
        onChangeText={setPostalCode}
        placeholder="Enter postal code"
        keyboardType="number-pad"
      />

      <Text style={styles.label}>Phone Number</Text>
      <TextInput
        style={styles.input}
        value={phone}
        onChangeText={setPhone}
        placeholder="Enter phone number"
        keyboardType="phone-pad"
      />

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Save Address</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: '#fff' },
  label: { fontSize: 14, fontWeight: 'bold', marginTop: 15, color: '#333' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    marginTop: 5,
    backgroundColor: '#f9f9f9',
  },
  saveButton: {
    backgroundColor: '#2e86de',
    padding: 15,
    borderRadius: 8,
    marginTop: 25,
    alignItems: 'center',
  },
  saveButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
