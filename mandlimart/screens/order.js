import React, { useState, useEffect, useContext, useLayoutEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Animated,
  Image,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { supabase } from '../supabase';
import { UserContext } from '../context/userContext';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FileViewer from 'react-native-file-viewer';

export default function OrdersScreen({ navigation }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(UserContext);
  const [pdfPaths, setPdfPaths] = useState({}); // orderId -> pdfPath mapping

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
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'orders',
            filter: `user_id=eq.${user.id}`,
          },
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
      .select('*, order_items, address')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error) setOrders(data);
    else console.error(error);
    setLoading(false);
  };

  const OrderStatusBar = ({ status }) => {
    const progressAnim = useRef(new Animated.Value(0)).current;
    const steps = ['Pending', 'Shipped', 'Delivered'];
    const stepIndex = steps.findIndex(
      (s) => s.toLowerCase() === status?.toLowerCase().trim()
    );

    const colors = {
      Pending: '#FFA726',
      Shipped: '#42A5F5',
      Delivered: '#66BB6A',
      Cancelled: '#EF5350',
    };

    const activeColor = colors[steps[stepIndex]] || colors[status] || '#9e9e9e';

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
                <View
                  style={[
                    styles.stepCircle,
                    { backgroundColor: isCompleted ? activeColor : '#ccc' },
                  ]}
                >
                  <Text style={styles.stepText}>{index + 1}</Text>
                </View>
                <Text
                  style={[
                    styles.stepLabel,
                    { color: isCompleted ? activeColor : '#999' },
                  ]}
                >
                  {step}
                </Text>
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

const generatePdf = async (order) => {
  const htmlContent = `
    <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 20px;
            color: #333;
          }
          h1, h2 {
            text-align: center;
            color: #007bff;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
            margin-bottom: 20px;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
          }
          th {
            background-color: #007bff;
            color: white;
          }
          tfoot td {
            font-weight: bold;
            font-size: 16px;
          }
          .address {
            margin-top: 20px;
            font-size: 14px;
            line-height: 1.5;
          }
          .footer {
            margin-top: 30px;
            font-size: 12px;
            color: #666;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <h1>Mandlimart</h1>
        <h2>Order Receipt</h2>
        <p><strong>Order ID:</strong> ${order.id}</p>
        <p><strong>Date:</strong> ${new Date(order.created_at).toLocaleDateString()}</p>

        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Qty</th>
              <th>Price (₹)</th>
              <th>Total (₹)</th>
            </tr>
          </thead>
          <tbody>
            ${order.order_items
              .map(
                (item) =>
                  `<tr>
                    <td>${item.name}</td>
                    <td>${item.quantity}</td>
                    <td>${item.price.toFixed(2)}</td>
                    <td>${(item.quantity * item.price).toFixed(2)}</td>
                  </tr>`
              )
              .join('')}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="3" style="text-align:right;">Grand Total:</td>
              <td>₹${order.total_price.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>

        <div class="address">
          <strong>Shipping Address:</strong><br />
          ${order.address.name}<br />
          ${order.address.street}<br />
          ${order.address.city}, ${order.address.state} - ${order.address.pincode}<br />
          Phone: ${order.address.phone}
        </div>

        <div class="footer">
          Thank you for shopping with Mandlimart!
        </div>
      </body>
    </html>
  `;

  try {
    const options = {
      html: htmlContent,
      fileName: `order_${order.id}`,
      directory: 'Documents',
    };
    const file = await RNHTMLtoPDF.convert(options);

    const newPdfPaths = { ...pdfPaths, [order.id]: file.filePath };
    setPdfPaths(newPdfPaths);
    await AsyncStorage.setItem('pdfPaths', JSON.stringify(newPdfPaths));

    alert('PDF generated and saved!');
  } catch (error) {
    console.error(error);
    alert('Failed to generate PDF');
  }
};


  useEffect(() => {
    const loadPdfPaths = async () => {
      const savedPaths = await AsyncStorage.getItem('pdfPaths');
      if (savedPaths) setPdfPaths(JSON.parse(savedPaths));
    };
    loadPdfPaths();
  }, []);

  const openPdf = async (path) => {
    try {
      await FileViewer.open(path);
    } catch (error) {
      console.error('Failed to open PDF:', error);
      alert('Failed to open PDF');
    }
  };

  if (loading)
    return (
      <ActivityIndicator style={{ marginTop: 30 }} size="large" color="#007bff" />
    );

  return (
    <ScrollView style={styles.container}>
      {orders.length === 0 ? (
        <Text style={styles.noOrders}>No orders found</Text>
      ) : (
        orders.map((order) => (
          <View key={order.id} style={styles.card}>
            <Text style={styles.orderId}>Order ID: {order.id}</Text>
            <Text style={styles.orderDetail}>Total: ₹{order.total_price}</Text>
            <Text style={styles.orderDetail}>
              Date: {new Date(order.created_at).toLocaleDateString()}
            </Text>

            {/* PDF icons only */}
            <View style={styles.iconRow}>
              {!pdfPaths[order.id] ? (
                <TouchableOpacity
                  onPress={() => generatePdf(order)}
                  style={styles.iconTouchable}
                >
                  <Icon name="download" size={28} color="#007bff" />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  onPress={() => openPdf(pdfPaths[order.id])}
                  style={styles.iconTouchable}
                >
                  <Icon name="picture-as-pdf" size={28} color="#28a745" />
                </TouchableOpacity>
              )}
            </View>

            {/* Order Items */}
            {order.order_items && order.order_items.length > 0 && (
              <View style={{ marginTop: 10 }}>
                <Text style={styles.addressTitle}>Items:</Text>
                {order.order_items.map((item, idx) => (
                  <View key={idx} style={styles.itemContainer}>
                    {item.image ? (
                      <Image source={{ uri: item.image }} style={styles.itemImage} />
                    ) : (
                      <View style={styles.itemImagePlaceholder}>
                        <Text style={{ color: '#999' }}>No Image</Text>
                      </View>
                    )}
                    <View style={{ flex: 1 }}>
                      <Text style={styles.itemName}>{item.name}</Text>
                      <Text>Qty: {item.quantity}</Text>
                      <Text>Price: ₹{item.price}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Address */}
            {order.address && (
              <View style={styles.addressContainer}>
                <Text style={styles.addressTitle}>Shipping Address:</Text>
                <Text>{order.address.name}</Text>
                <Text>{order.address.street || ''}</Text>
                <Text>
                  {order.address.city}, {order.address.state} - {order.address.pincode}
                </Text>
                <Text>Phone: {order.address.phone}</Text>
              </View>
            )}

            <OrderStatusBar status={order.status} />
          </View>
        ))
      )}
    </ScrollView>
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
  statusSteps: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
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
  addressContainer: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#eef2f7',
    borderRadius: 8,
  },
  addressTitle: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  itemContainer: {
    flexDirection: 'row',
    marginVertical: 6,
    alignItems: 'center',
  },
  itemImage: {
    width: 50,
    height: 50,
    borderRadius: 6,
    marginRight: 12,
    resizeMode: 'cover',
  },
  itemImagePlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 6,
    marginRight: 12,
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
  },
  iconRow: {
    flexDirection: 'row',
    marginTop: 10,
  },
  iconTouchable: {
    marginRight: 16,
  },
});
