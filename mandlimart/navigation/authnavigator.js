import React, { useContext, useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/login';
import RegisterScreen from '../screens/registration';
import OrderScreen from '../screens/orderdetails';
import { UserContext } from '../context/userContext';
import SplashScreen from '../screens/splashscreen';
import BottomTab from './bottomtab';
import CartScreen from '../screens/cart';
import CheckoutScreen from '../screens/checkoutscreen';
import AddAddressScreen from '../screens/addAddress';
import OrderSuccessScreen from '../screens/ordersuccess';
import ProfileScreen from '../screens/profile';
import OrderDetailScreen from '../screens/orderdetails';

const Stack = createNativeStackNavigator();

export default function AuthNavigator() {
  const { user } = useContext(UserContext);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const minMs = 5000;
    const start = Date.now();

    const maybeHide = () => {
      const elapsed = Date.now() - start;
      const wait = Math.max(0, minMs - elapsed);
      setTimeout(() => {
        if (!cancelled) setShowSplash(false);
      }, wait);
    };

    const maxTimer = setTimeout(() => {
      if (!cancelled) setShowSplash(false);
    }, 1500);

    if (user !== undefined) {
      maybeHide();
    }

    return () => {
      cancelled = true;
      clearTimeout(maxTimer);
    };
  }, [user]);

  if (showSplash) {
    return <SplashScreen />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        <>
          {/* Show bottom navigation as main screen */}
          <Stack.Screen name="BottomTab" component={BottomTab} />

          {/* Other screens that open on top of bottom nav */}
          <Stack.Screen name="Orderdetails" component={OrderDetailScreen} />
          <Stack.Screen name="Cart" component={CartScreen} />
          <Stack.Screen name="Checkout" component={CheckoutScreen} />
          <Stack.Screen name="AddAddress" component={AddAddressScreen} />
          <Stack.Screen name="OrderSuccess" component={OrderSuccessScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="Orders" component={OrderScreen} />
          {/* Add other screens as needed */}
        </>
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}
