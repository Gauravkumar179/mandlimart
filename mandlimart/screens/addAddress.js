import React, { useState, useLayoutEffect, useContext, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { supabase } from '../supabase';
import { UserContext } from '../context/userContext';
import { Picker } from '@react-native-picker/picker'; // make sure to install this

export default function AddAddressScreen({ navigation }) {
  const { user } = useContext(UserContext);

  const [fullName, setFullName] = useState('');
  const [addressLine, setAddressLine] = useState('');
  const [phone, setPhone] = useState('');

  const [countryList, setCountryList] = useState([]);
  const [stateList, setStateList] = useState([]);
  const [cityList, setCityList] = useState([]);
  const [streetList, setStreetList] = useState([]);
  const [pincodeList, setPincodeList] = useState([]);

  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedStreet, setSelectedStreet] = useState('');
  const [selectedPincode, setSelectedPincode] = useState('');

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerBackTitleVisible: false,
      headerTitleAlign: 'center',
      headerTitle: 'Add New Address',
      headerStyle: { backgroundColor: '#2e86de' },
      headerTintColor: '#fff',
      headerTitleStyle: { fontWeight: '700', fontSize: 20 },
    });
  }, [navigation]);

  // Fetch country list on mount
  useEffect(() => {
    fetchCountries();
  }, []);

  const fetchCountries = async () => {
    const { data, error } = await supabase
      .from('location')
      .select('country')
      .order('country', { ascending: true });

    if (!error && data) {
      const uniqueCountries = [...new Set(data.map((item) => item.country))];
      setCountryList(uniqueCountries);
    }
  };

  const fetchStates = async (country) => {
    setStateList([]);
    setCityList([]);
    setStreetList([]);
    setPincodeList([]);
    setSelectedState('');
    setSelectedCity('');
    setSelectedStreet('');
    setSelectedPincode('');

    const { data, error } = await supabase
      .from('location')
      .select('state')
      .eq('country', country)
      .order('state', { ascending: true });

    if (!error && data) {
      const uniqueStates = [...new Set(data.map((item) => item.state))];
      setStateList(uniqueStates);
    }
  };

  const fetchCities = async (state) => {
    setCityList([]);
    setStreetList([]);
    setPincodeList([]);
    setSelectedCity('');
    setSelectedStreet('');
    setSelectedPincode('');

    const { data, error } = await supabase
      .from('location')
      .select('city')
      .eq('state', state)
      .order('city', { ascending: true });

    if (!error && data) {
      const uniqueCities = [...new Set(data.map((item) => item.city))];
      setCityList(uniqueCities);
    }
  };

  const fetchStreets = async (city) => {
    setStreetList([]);
    setPincodeList([]);
    setSelectedStreet('');
    setSelectedPincode('');

    const { data, error } = await supabase
      .from('location')
      .select('street')
      .eq('city', city)
      .order('street', { ascending: true });

    if (!error && data) {
      const uniqueStreets = [...new Set(data.map((item) => item.street))];
      setStreetList(uniqueStreets);
    }
  };

  const fetchPincodes = async (street) => {
    setPincodeList([]);
    setSelectedPincode('');

    const { data, error } = await supabase
      .from('location')
      .select('pincode')
      .eq('street', street)
      .order('pincode', { ascending: true });

    if (!error && data) {
      const uniquePincodes = [...new Set(data.map((item) => item.pincode))];
      setPincodeList(uniquePincodes);
    }
  };

  const handleSave = async () => {
    if (
      !fullName ||
      !addressLine ||
      !selectedCountry ||
      !selectedState ||
      !selectedCity ||
      !selectedStreet ||
      !selectedPincode ||
      !phone
    ) {
      Alert.alert('Please fill in all fields');
      return;
    }

    const { error } = await supabase.from('addresses').insert([
      {
        user_id: user.id,
        full_name: fullName,
        address_line: addressLine,
        country: selectedCountry,
        state: selectedState,
        city: selectedCity,
        street: selectedStreet,
        pincode: selectedPincode,
        phone,
      },
    ]);

    if (error) {
      Alert.alert('Error saving address');
      return;
    }

    Alert.alert('Address added successfully');
    navigation.goBack(); // No function in params, so no warning
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

      <Text style={styles.label}>Country</Text>
     <View style={styles.pickerContainer}>
  <Picker
    selectedValue={selectedCountry}
    onValueChange={(val) => {
      setSelectedCountry(val);
      fetchStates(val);
    }}
  >
    <Picker.Item label="Select Country" value="" />
    {countryList.map((country) => (
      <Picker.Item key={country} label={country} value={country} />
    ))}
  </Picker>
</View>


      <Text style={styles.label}>State</Text>
      <View style={styles.pickerContainer}>
      <Picker
        selectedValue={selectedState}
        onValueChange={(val) => {
          setSelectedState(val);
          fetchCities(val);
        }}
        enabled={stateList.length > 0}
      >
        <Picker.Item label="Select State" value="" />
        {stateList.map((state) => (
          <Picker.Item key={state} label={state} value={state} />
        ))}
      </Picker>
      </View>

      <Text style={styles.label}>City</Text>
      <View style={styles.pickerContainer}>
      <Picker
        selectedValue={selectedCity}
        onValueChange={(val) => {
          setSelectedCity(val);
          fetchStreets(val);
        }}
        enabled={cityList.length > 0}
      >
        <Picker.Item label="Select City" value="" />
        {cityList.map((city) => (
          <Picker.Item key={city} label={city} value={city} />
        ))}
      </Picker>
      </View>

      <Text style={styles.label}>Street</Text>
      <View style={styles.pickerContainer}>
      <Picker
        selectedValue={selectedStreet}
        onValueChange={(val) => {
          setSelectedStreet(val);
          fetchPincodes(val);
        }}
        enabled={streetList.length > 0}
      >
        <Picker.Item label="Select Street" value="" />
        {streetList.map((street) => (
          <Picker.Item key={street} label={street} value={street} />
        ))}
      </Picker>
      </View>

      <Text style={styles.label}>Pincode</Text>
      <View style={styles.pickerContainer}>
      <Picker
        selectedValue={selectedPincode}
        onValueChange={(val) => setSelectedPincode(val)}
        enabled={pincodeList.length > 0}
      >
        <Picker.Item label="Select Pincode" value="" />
        {pincodeList.map((pin) => (
          <Picker.Item key={pin} label={pin.toString()} value={pin} />
        ))}
      </Picker>
      </View>

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
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
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
