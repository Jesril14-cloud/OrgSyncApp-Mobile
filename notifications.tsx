import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Platform,
    RefreshControl, SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

// 🟢 CONFIGURATION
const BASE_URL = 'http://172.20.10.8/capstone'; 

export default function NotificationsScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all' or 'unread'

  const fetchNotifications = async () => {
    try {
      const userData = await AsyncStorage.getItem('user_data');
      if (!userData) return;
      const user = JSON.parse(userData);
      
      const response = await fetch(`${BASE_URL}/get_notifications.php?user_id=${user.user_id}`);
      const data = await response.json();

      if (data.success) {
        setNotifications(data.notifications);
      }
    } catch (error) {
      console.log("Error fetching notifications:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // 🟢 NEW FUNCTION: Mark as Read
  const handleMarkAsRead = async (notification_id: any) => {
    try {
      const userData = await AsyncStorage.getItem('user_data');
      if (!userData) return;
      const user = JSON.parse(userData);

      // 1. Update UI Instantly (Optimistic Update)
      setNotifications(prev => prev.map((n: any) => 
        n.notification_id === notification_id ? { ...n, is_read: 1 } : n
      ) as any);

      // 2. Send to Server
      await fetch(`${BASE_URL}/mark_notification_read.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          notification_id: notification_id,
          user_id: user.user_id 
        })
      });

    } catch (error) {
      Alert.alert("Error", "Could not mark as read.");
    }
  };

  // 🟢 FILTER LOGIC
  const filteredData = notifications.filter((item: any) => {
    if (filter === 'unread') return item.is_read == 0;
    return true;
  });

  const unreadCount = notifications.filter((item: any) => item.is_read == 0).length;

  const renderItem = ({ item }: any) => {
    const isUnread = item.is_read == 0;

    return (
      <View style={[styles.card, !isUnread && styles.readCard]}>
        {/* 1. ICON (Left) */}
        <View style={styles.iconContainer}>
           <Ionicons 
             name={isUnread ? "notifications" : "notifications-outline"} 
             size={24} 
             color={isUnread ? "#fbc02d" : "#ccc"} 
           />
        </View>

        {/* 2. TEXT (Middle) */}
        <View style={styles.textContainer}>
           <Text style={[styles.cardTitle, !isUnread && styles.readText]}>{item.title}</Text>
           <Text style={styles.cardMessage} numberOfLines={2}>
             {item.message || "No details provided."}
           </Text>
           <Text style={styles.cardDate}>{item.created_at}</Text>
        </View>

        {/* 3. ACTION BUTTONS (Right) */}
        <View style={styles.actions}>
          
          {/* VIEW BUTTON */}
          <TouchableOpacity 
            style={styles.viewButton} 
            onPress={() => Alert.alert(item.title, item.message || "No content")}
          >
            <Text style={styles.viewButtonText}>View</Text>
          </TouchableOpacity>

          {/* MARK READ BUTTON (Only show if unread) */}
          {isUnread && (
            <TouchableOpacity 
              style={styles.markReadButton} 
              onPress={() => handleMarkAsRead(item.notification_id)}
            >
              <Ionicons name="checkmark" size={16} color="#1b5e20" />
            </TouchableOpacity>
          )}

        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* 🟢 HEADER (Back button removed) */}
      <SafeAreaView style={styles.customHeader}>
        <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
                <View style={styles.logoCircle}>
                    <Text style={styles.logoText}>HNU</Text>
                </View>
                <View>
                    <Text style={styles.headerTitle}>Notifications</Text>
                    <Text style={styles.headerSubtitle}>{unreadCount} unread</Text>
                </View>
            </View>
        </View>
      </SafeAreaView>

      <View style={styles.contentContainer}>
        {/* TABS */}
        <View style={styles.tabsContainer}>
            <TouchableOpacity 
                style={[styles.tab, filter === 'all' && styles.activeTab]} 
                onPress={() => setFilter('all')}
            >
                <Text style={[styles.tabText, filter === 'all' && styles.activeTabText]}>All</Text>
            </TouchableOpacity>

            <TouchableOpacity 
                style={[styles.tab, filter === 'unread' && styles.activeTab]} 
                onPress={() => setFilter('unread')}
            >
                <Text style={[styles.tabText, filter === 'unread' && styles.activeTabText]}>Unread</Text>
            </TouchableOpacity>
        </View>

        {/* LIST */}
        {loading ? (
            <ActivityIndicator size="large" color="#1b5e20" style={{marginTop: 40}} />
        ) : (
            <FlatList
                data={filteredData}
                keyExtractor={(item: any) => item.notification_id?.toString()}
                renderItem={renderItem}
                contentContainerStyle={{ paddingBottom: 20 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchNotifications(); }} />}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Text style={{color: '#999'}}>No notifications found.</Text>
                    </View>
                }
            />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },

  customHeader: {
    backgroundColor: '#1b5e20',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  headerContent: {
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  logoCircle: {
    width: 36, height: 36, borderRadius: 18,
    borderWidth: 1.5, borderColor: '#fff',
    justifyContent: 'center', alignItems: 'center',
    marginRight: 10
  },
  logoText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  headerSubtitle: { color: '#a5d6a7', fontSize: 12 },

  contentContainer: { flex: 1, padding: 20 },

  tabsContainer: { flexDirection: 'row', marginBottom: 20 },
  tab: {
    paddingVertical: 8, paddingHorizontal: 16,
    borderRadius: 4, marginRight: 10,
    borderWidth: 1, borderColor: '#ddd',
    backgroundColor: '#fff'
  },
  activeTab: { backgroundColor: '#1b5e20', borderColor: '#1b5e20' },
  tabText: { color: '#666', fontWeight: '600' },
  activeTabText: { color: '#fff' },

  // CARD STYLES
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#eee'
  },
  readCard: {
    backgroundColor: '#f9f9f9', // Dimmed background for read items
    opacity: 0.8
  },
  readText: {
    fontWeight: 'normal',
    color: '#666'
  },
  iconContainer: { marginRight: 15 },
  textContainer: { flex: 1, paddingRight: 10 },
  cardTitle: { fontSize: 14, fontWeight: 'bold', color: '#333', marginBottom: 2 },
  cardMessage: { fontSize: 13, color: '#555', marginBottom: 4 },
  cardDate: { fontSize: 11, color: '#999' },
  
  actions: {
    alignItems: 'center',
    gap: 8 // Space between View and Check buttons
  },
  viewButton: {
    backgroundColor: '#1b5e20',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 5
  },
  viewButtonText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },

  markReadButton: {
    padding: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1b5e20',
    marginTop: 5
  },

  emptyState: { alignItems: 'center', marginTop: 50 }
});