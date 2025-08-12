import React, { useState, useEffect, useContext, useLayoutEffect, useRef } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Animated } from 'react-native';
import { supabase } from '../supabase';
import { UserContext } from '../context/userContext';

export default function OrdersScreen({ navigation }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(UserContext);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      title: 'My Orders',
      headerStyle: { backgroundColor: '#007bff' },
      headerTintColor: '#fff',
      headerTitleStyle: { fontWeight: 'bold' },
    });
  }, [navigation]);

  useEffect(() => {
    if (user?.id) {
      fetchOrders();

      const subscription = supabase
        .channel('orders_changes')
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'orders', filter: `user_id=eq.${user.id}` },
          (payload) => {
            setOrders((prevOrders) =>
              prevOrders.map((order) =>
                order.id === payload.new.id ? payload.new : order
              )
            );
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(subscription);
      };
    }
  }, [user]);

  const fetchOrders = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error) setOrders(data);
    setLoading(false);
  };

  const OrderStatusBar = ({ status }) => {
    const progressAnim = useRef(new Animated.Value(0)).current;

    // Step mapping
    const steps = ['Pending', 'Shipped', 'Delivered'];
    const stepIndex = steps.findIndex(
      s => s.toLowerCase() === status?.toLowerCase().trim()
    );

    const colors = {
      Pending: '#FFA726',
      Shipped: '#42A5F5',
      Delivered: '#66BB6A',
      Cancelled: '#EF5350',
    };

    const activeColor =
      colors[steps[stepIndex]] || colors[status] || '#9e9e9e';

    useEffect(() => {
      Animated.timing(progressAnim, {
        toValue: stepIndex,
        duration: 800,
        useNativeDriver: false,
      }).start();
    }, [stepIndex]);

    return (
      <View style={styles.statusContainer}>
        <View style={styles.statusSteps}>
          {steps.map((step, index) => {
            const isCompleted = index <= stepIndex;
            const isLast = index === steps.length - 1;

            return (
              <View key={step} style={styles.stepWrapper}>
                {/* Circle */}
                <View
                  style={[
                    styles.stepCircle,
                    { backgroundColor: isCompleted ? activeColor : '#ccc' },
                  ]}
                >
                  <Text style={styles.stepText}>{index + 1}</Text>
                </View>
                {/* Label */}
                <Text
                  style={[
                    styles.stepLabel,
                    { color: isCompleted ? activeColor : '#999' },
                  ]}
                >
                  {step}
                </Text>
                {/* Line */}
                {!isLast && (
                  <View style={styles.stepLineWrapper}>
                    <Animated.View
                      style={[
                        styles.stepLine,
                        {
                          backgroundColor: activeColor,
                          width: progressAnim.interpolate({
                            inputRange: [index, index + 1],
                            outputRange: ['0%', '100%'],
                            extrapolate: 'clamp',
                          }),
                        },
                      ]}
                    />
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  if (loading)
    return <ActivityIndicator style={{ marginTop: 30 }} size="large" color="#007bff" />;

  return (
    <View style={styles.container}>
      {orders.length === 0 ? (
        <Text style={styles.noOrders}>No orders found</Text>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.orderId}>Order ID: {item.id}</Text>
              <Text style={styles.orderDetail}>Total: ₹{item.total_price}</Text>
              <Text style={styles.orderDetail}>
                Date: {new Date(item.created_at).toLocaleDateString()}
              </Text>
              <OrderStatusBar status={item.status} />
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f8f9fa' },
  card: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  orderId: { fontWeight: 'bold', fontSize: 16, marginBottom: 5, color: '#333' },
  orderDetail: { fontSize: 14, color: '#555' },
  noOrders: { textAlign: 'center', fontSize: 16, marginTop: 50, color: '#777' },
  statusContainer: { marginTop: 10 },
  statusSteps: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  stepWrapper: { flexDirection: 'row', alignItems: 'center' },
  stepCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  stepLabel: { fontSize: 12, marginLeft: 4, marginRight: 4 },
  stepLineWrapper: {
    height: 4,
    backgroundColor: '#ccc',
    borderRadius: 2,
    width: 40,
    overflow: 'hidden',
  },
  stepLine: {
    height: 4,
    borderRadius: 2,
  },
});
