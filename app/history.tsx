import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// 🟢 FIX: NEW IP ADDRESS
const BASE_URL = 'http://172.20.10.8/capstone';

export default function HistoryScreen() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const load = async () => {
      const userData = await AsyncStorage.getItem('user_data');
      if (!userData) return;
      const user = JSON.parse(userData);
      fetch(`${BASE_URL}/get_attendance_history.php?user_id=${user.user_id}`)
        .then(res => res.json())
        .then(data => setHistory(data))
        .catch(console.error)
        .finally(() => setLoading(false));
    };
    load();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>My Attendance</Text>
          <Text style={styles.headerSub}>Dashboard / History</Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>EVENTS ATTENDED</Text>
          <Text style={styles.summaryValue}>{history.length}</Text>
          <Text style={styles.summarySub}>Total recorded attendance</Text>
        </View>

        {loading ? <ActivityIndicator size="large" color="#1b5e20" /> : (
          <FlatList
            data={history}
            keyExtractor={(item: any, index) => index.toString()}
            contentContainerStyle={{paddingBottom: 20}}
            ListEmptyComponent={
                <View style={styles.emptyContainer}>
                    <Ionicons name="clipboard-outline" size={60} color="#e0e0e0" />
                    <Text style={styles.emptyTitle}>No Attendance Records</Text>
                    <Text style={styles.emptySub}>You haven't attended any events yet.</Text>
                    
                    <TouchableOpacity style={styles.scanBtn} onPress={() => router.push('/scan')}>
                        <Text style={styles.scanBtnText}>Scan QR Code</Text>
                    </TouchableOpacity>
                </View>
            }
            renderItem={({ item }) => (
              <View style={styles.card}>
                <Ionicons name="checkmark-circle" size={32} color="#2e7d32" style={{marginRight: 15}} />
                <View>
                  <Text style={styles.cardTitle}>{item.event_name}</Text>
                  <Text style={styles.cardDate}>{item.formatted_date}</Text>
                  <Text style={styles.cardLoc}>{item.location}</Text>
                </View>
              </View>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6f8' },
  header: { backgroundColor: '#1b5e20', padding: 20, paddingTop: 50, flexDirection: 'row', alignItems: 'center' },
  backBtn: { marginRight: 15 },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  headerSub: { color: '#a5d6a7', fontSize: 12 },
  content: { flex: 1, padding: 15 },
  summaryCard: { backgroundColor: '#fff', padding: 20, borderRadius: 10, marginBottom: 20, borderLeftWidth: 5, borderLeftColor: '#2e7d32', elevation: 2 },
  summaryLabel: { color: '#666', fontSize: 12, fontWeight: 'bold', letterSpacing: 1 },
  summaryValue: { fontSize: 36, fontWeight: 'bold', color: '#2e7d32', marginVertical: 5 },
  summarySub: { color: '#888', fontSize: 12 },
  card: { backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center', padding: 15, borderRadius: 10, marginBottom: 10, elevation: 1 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  cardDate: { color: '#1b5e20', fontSize: 12, fontWeight: 'bold', marginTop: 2 },
  cardLoc: { color: '#666', fontSize: 12, marginTop: 2 },
  emptyContainer: { alignItems: 'center', marginTop: 50, padding: 20 },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginTop: 10 },
  emptySub: { color: '#888', textAlign: 'center', marginVertical: 10 },
  scanBtn: { backgroundColor: '#1b5e20', paddingHorizontal: 30, paddingVertical: 12, borderRadius: 25, marginTop: 10 },
  scanBtnText: { color: '#fff', fontWeight: 'bold' }
});