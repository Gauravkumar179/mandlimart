import React, { useState, useCallback, useContext } from 'react';
import { View, Text, TextInput, Image, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { launchImageLibrary } from 'react-native-image-picker';
import { supabase } from '../supabase';
import { UserContext } from '../context/userContext';
import { useFocusEffect } from '@react-navigation/native';

export default function ProfileScreen({ navigation }) {
  const [name, setName] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('');
  const [pincode, setPincode] = useState('');
  const [phone, setPhone] = useState('');
  const [imageBase64, setImageBase64] = useState(null);
  const [loading, setLoading] = useState(false);
  const { user } = useContext(UserContext);

  useFocusEffect(
    useCallback(() => {
      if (user?.id) {
        fetchProfile();
      }
    }, [user])
  );

  const fetchProfile = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (data) {
      setName(data.full_name || '');
      setStreet(data.street || '');
      setCity(data.city || '');
      setStateName(data.state || '');
      setPincode(data.pincode || '');
      setPhone(data.phone || '');
      setImageBase64(data.image_base64 || null);
    }
    if (error) console.log(error);
    setLoading(false);
  };

  const selectImage = () => {
    launchImageLibrary({ mediaType: 'photo', includeBase64: true }, (response) => {
      if (response.didCancel) return;
      if (response.errorCode) {
        Alert.alert('Error', response.errorMessage);
        return;
      }
      const base64String = `data:${response.assets[0].type};base64,${response.assets[0].base64}`;
      setImageBase64(base64String);
    });
  };

  const saveProfile = async () => {
    if (!name || !street || !city || !stateName || !pincode || !phone) {
      Alert.alert('Validation', 'Please fill all fields');
      return;
    }

    setLoading(true);

    const { error } = await supabase
      .from('profiles')
      .upsert([
        {
          full_name: name,
          street,
          city,
          state: stateName,
          pincode,
          phone,
          image_base64: imageBase64,
          updated_at: new Date(),
        },
      ]);

    setLoading(false);

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      Alert.alert('Success', 'Profile saved successfully', [
        { text: 'OK', onPress: () => navigation.navigate('Home') },
      ]);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity onPress={selectImage} style={styles.imagePicker}>
          {imageBase64 ? (
            <Image source={{ uri: imageBase64 }} style={styles.image} />
          ) : (
            <Text style={styles.imageText}>Select Profile Image</Text>
          )}
        </TouchableOpacity>

        <TextInput style={styles.input} placeholder="Full Name" value={name} onChangeText={setName} />
        <TextInput style={styles.input} placeholder="Street" value={street} onChangeText={setStreet} />
        <TextInput style={styles.input} placeholder="City" value={city} onChangeText={setCity} />
        <TextInput style={styles.input} placeholder="State" value={stateName} onChangeText={setStateName} />
        <TextInput
          style={styles.input}
          placeholder="Pincode"
          value={pincode}
          keyboardType="numeric"
          onChangeText={setPincode}
        />
        <TextInput
          style={styles.input}
          placeholder="Phone"
          value={phone}
          keyboardType="phone-pad"
          onChangeText={setPhone}
        />

        <TouchableOpacity onPress={saveProfile} style={styles.saveButton} disabled={loading}>
          <Text style={styles.saveButtonText}>{loading ? 'Saving...' : 'Save Profile'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
  },
  imagePicker: {
    width: 120,
    height: 120,
    backgroundColor: '#f1f1f1',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    overflow: 'hidden',
  },
  imageText: {
    color: '#777',
    textAlign: 'center',
    fontSize: 14,
  },
  image: {
    width: 120,
    height: 120,
  },
  input: {
    width: '100%',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
  },
  saveButton: {
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
