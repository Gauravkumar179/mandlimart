import structuredClone from 'structured-clone';

// Monkey patch global
import { Buffer } from 'buffer';
if (!global.Buffer) global.Buffer = Buffer;

if (typeof global.structuredClone !== 'function') {
  global.structuredClone = (obj) => JSON.parse(JSON.stringify(obj));
}
import 'react-native-url-polyfill/auto';
import React, { useEffect, useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AuthNavigator from './navigation/authnavigator';
import { UserProvider, UserContext } from './context/userContext';
import { supabase } from './supabase';

import googleMobileAds from 'react-native-google-mobile-ads';

googleMobileAds()
  .initialize()
  .then(adapterStatuses => {
    console.log('✅ AdMob initialized:', adapterStatuses);
  })
  .catch(err => {
    console.error('🧨 AdMob initialization error:', err);
  });



function RootNavigation() {
  const { user, setUser } = useContext(UserContext);

 useEffect(() => {
  const checkSession = async () => {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error('🔴 Session fetch error:', error);
      }
      if (data?.session?.user) {
        console.log('🟢 Restoring user:', data.session.user);
        setUser(data.session.user);
      } else {
        console.log('🟡 No session user');
      }
    } catch (err) {
      console.error('🧨 Error checking session:', err);
    }
  };
  checkSession();

  const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
    console.log('🔄 Auth state changed:', _event);
    if (session?.user) {
      setUser(session.user);
    } else {
      setUser(null);
    }
  });

  return () => {
    listener?.subscription.unsubscribe();
  };
}, []);

  return <AuthNavigator />;
}

export default function App() {
  return (
    <UserProvider>
      <NavigationContainer>
        <RootNavigation />
      </NavigationContainer>
    </UserProvider>
  );
}
