import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

// 🟢 CONFIGURATION
const BASE_URL = 'http://172.20.10.8/capstone'; 

export default function DashboardScreen() {
  const router = useRouter();
  const [user, setUser] = useState({ user_id: '', first_name: 'Student', role: 'Student' });
  const [stats, setStats] = useState({ events: 0, fines: '0.00', notifs: 0 });
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // 1. Fetch Data
  const fetchData = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('user_data');
      if (!storedUser) return;
      
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);

      console.log(`[Dashboard] Fetching from: ${BASE_URL}/get_dashboard.php`);

      const response = await fetch(`${BASE_URL}/get_dashboard.php?user_id=${parsedUser.user_id}`);
      const data = await response.json();

      setStats({
        events: data.events_count,
        fines: data.fines_total,
        notifs: data.notifs_count
      });
      setEvents(data.upcoming_events || []);
      
    } catch (e) {
      console.error("[Dashboard Error]", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchData(); }, []);
  const onRefresh = useCallback(() => { setRefreshing(true); fetchData(); }, []);

  // 🔴 LOGOUT FUNCTION
  const handleLogout = async () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Logout", 
          style: 'destructive',
          onPress: async () => {
            try {
              // 🟢 SAFE WAY: Only remove the user data key
              await AsyncStorage.removeItem('user_data');
            } catch (error) {
              console.log("Error clearing data:", error);
            }
            
            // 2. Go specifically to the Login screen
            router.replace('/login' as any); 
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      
      {/* 🟢 NEW HEADER (Matches Web Style) */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>OrgSync</Text>
          <Text style={styles.headerSubtitle}>Student Portal</Text>
        </View>
        
        {/* LOGOUT BUTTON */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
           <Text style={styles.logoutText}>Logout</Text>
           <Ionicons name="log-out-outline" size={18} color="#fff" style={{marginLeft: 4}} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={styles.content} 
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#1b5e20']} />}
      >
        
        {/* 🟡 WELCOME CARD */}
        <TouchableOpacity style={styles.welcomeCard} onPress={() => router.push('/events')}>
          <Text style={styles.welcomeTitle}>Welcome back, {user.first_name}!</Text>
          <Text style={styles.welcomeText}>Stay updated with upcoming events, check your attendance, and manage your student activities all in one place.</Text>
        </TouchableOpacity>

        {/* 📊 STATS ROW */}
        <View style={styles.statsRow}>
          <StatCard 
            label="EVENTS" value={stats.events} color="#2e7d32" sub="Upcoming" 
            onPress={() => router.push('/events')} 
          />
          <StatCard 
            label="FINES" value={`₱${stats.fines}`} color="#d32f2f" sub="Unpaid" 
            onPress={() => router.push('/fines')} 
          />
          <StatCard 
            label="NOTIFS" value={stats.notifs} color="#f9a825" sub="Unread" 
            onPress={() => Alert.alert("Notifications", `You have ${stats.notifs} unread messages.`)} 
          />
        </View>

        {/* 🟢 QUICK ACTIONS (Removed Profile Button logic) */}
        <View style={styles.gridContainer}>
          <ActionButton 
            icon="calendar" 
            label="Events Calendar" 
            onPress={() => router.push('/events')} 
          />
          <ActionButton 
            icon="qr-code" 
            label="My QR Code" // Changed label since they don't scan anymore
            onPress={() => router.push('/scan')} 
          />
          <ActionButton 
            icon="cash-outline" 
            label="View Fines" 
            onPress={() => router.push('/fines')} 
          />
          <ActionButton 
            icon="time-outline" 
            label="Attendance" 
            onPress={() => router.push('/history')} 
          />
        </View>

        {/* 📅 UPCOMING EVENTS LIST */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upcoming Events</Text>
          
          {events.length > 0 ? events.map((ev:any, i) => (
            <TouchableOpacity key={i} style={styles.eventItem} onPress={() => router.push('/events')}>
              <Text style={styles.evName}>{ev.event_name || ev.title}</Text>
              <Text style={styles.evLoc}>{ev.location}</Text>
              <Text style={styles.evDate}>{ev.start_time || ev.date}</Text>
            </TouchableOpacity>
          )) : (
            <Text style={styles.noData}>No upcoming events.</Text>
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

// 🛠 COMPONENTS
const StatCard = ({ label, value, color, sub, onPress }: any) => (
  <TouchableOpacity style={[styles.statCard, { borderLeftColor: color }]} onPress={onPress}>
    <Text style={styles.statLabel}>{label}</Text>
    <Text style={[styles.statValue, { color }]}>{value}</Text>
    <Text style={styles.statSub}>{sub}</Text>
  </TouchableOpacity>
);

const ActionButton = ({ icon, label, onPress }: any) => (
  <TouchableOpacity style={styles.actionButton} onPress={onPress}>
    <View style={styles.iconCircle}>
      <Ionicons name={icon as any} size={28} color="#2e7d32" />
    </View>
    <Text style={styles.actionText}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6f8' },
  
  // 🟢 UPDATED HEADER STYLES
  header: { 
    backgroundColor: '#1b5e20', 
    padding: 20, 
    paddingTop: 50, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center' 
  },
  headerTitle: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  headerSubtitle: { color: '#a5d6a7', fontSize: 12 },
  
  // 🟢 LOGOUT BUTTON STYLE (Matches Web "Green/Transparent" look)
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)', // Semi-transparent
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)'
  },
  logoutText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12
  },

  content: { padding: 15 },
  welcomeCard: { backgroundColor: '#fff', padding: 20, borderRadius: 10, marginBottom: 15, borderLeftWidth: 5, borderLeftColor: '#fbc02d', elevation: 2 },
  welcomeTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 5 },
  welcomeText: { color: '#666' },
  
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  statCard: { backgroundColor: '#fff', width: '31%', padding: 10, borderRadius: 8, elevation: 2, borderLeftWidth: 4 },
  statLabel: { fontSize: 10, color: '#888', fontWeight: 'bold' },
  statValue: { fontSize: 18, fontWeight: 'bold', marginVertical: 2 },
  statSub: { fontSize: 9, color: '#aaa' },

  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 15 },
  actionButton: { backgroundColor: '#fff', width: '48%', padding: 15, borderRadius: 12, alignItems: 'center', marginBottom: 15, elevation: 2 },
  iconCircle: { backgroundColor: '#e8f5e9', padding: 12, borderRadius: 50, marginBottom: 10 },
  actionText: { fontWeight: '600', color: '#333', fontSize: 13 },

  section: { backgroundColor: '#fff', borderRadius: 10, padding: 15, elevation: 2 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 10, borderBottomWidth: 1, borderColor: '#eee', paddingBottom: 10 },
  eventItem: { borderLeftWidth: 3, borderColor: '#1b5e20', paddingLeft: 10, marginBottom: 15 },
  evName: { fontWeight: 'bold', fontSize: 14, color: '#333' },
  evLoc: { color: '#666', fontSize: 12 },
  evDate: { color: '#1b5e20', fontWeight: 'bold', fontSize: 12, marginTop: 2 },
  noData: { color: '#999', fontStyle: 'italic', textAlign: 'center' }
});