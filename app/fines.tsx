import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

// 🟢 CONFIGURATION
const API_URL = 'http://172.20.10.8/capstone'; 
const USER_ID = 27; 

interface Fine {
  id: number;
  event: string;
  organization: string;
  date: string;
  amount: string;     
  amount_raw: number; 
  status: string;     
  absence_type: string; 
}

export default function FinesScreen() {
  const [fines, setFines] = useState<Fine[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('All');

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedFine, setSelectedFine] = useState<Fine | null>(null);
  const [orNumber, setOrNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // FETCH DATA
  const fetchFines = async () => {
    try {
      const response = await fetch(`${API_URL}/get_student_fines.php?user_id=${USER_ID}`);
      const data = await response.json();
      if (data.success) {
        setFines(data.fines);
      }
    } catch (error) {
      console.error("Error fetching fines:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchFines();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchFines();
  };

  // SUBMIT PAYMENT
  const handleSubmitPayment = async () => {
    if (!orNumber.trim()) {
      Alert.alert("Required", "Please enter the Official Receipt Number.");
      return;
    }
    setSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/submit_payment.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fine_id: selectedFine?.id,
          user_id: USER_ID,
          payment_reference: orNumber
        })
      });
      const result = await response.json();
      if (result.success) {
        Alert.alert("Success", "Payment recorded successfully!");
        setModalVisible(false);
        setOrNumber('');
        fetchFines();
      } else {
        Alert.alert("Error", result.message);
      }
    } catch (error) {
      Alert.alert("Network Error", "Could not connect to server.");
    } finally {
      setSubmitting(false);
    }
  };

  // CALCULATE TOTALS
  const totalUnpaid = fines
    .filter(f => f.status === 'Unpaid')
    .reduce((sum, f) => sum + Number(f.amount_raw), 0);
  const totalPending = fines.filter(f => f.absence_type === 'Pending_Review').length;
  const countTotal = fines.length;

  // RENDER ITEM
  const renderFineItem = ({ item }: { item: Fine }) => (
    <View style={styles.card}>
      <View style={styles.cardRow}>
        <View style={{flex: 1}}>
          <Text style={styles.eventName}>{item.event}</Text>
          <Text style={styles.orgName}>{item.organization}</Text>
          <Text style={styles.date}>{item.date}</Text>
        </View>
        <View style={{alignItems: 'flex-end'}}>
          <Text style={styles.amount}>₱{item.amount}</Text>
          <View style={[styles.statusBadge, item.status === 'Unpaid' ? styles.badgeRed : styles.badgeGreen]}>
            <Text style={[styles.statusText, item.status === 'Unpaid' ? styles.textRed : styles.textGreen]}>
              {item.status}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.actionRow}>
        <Text style={styles.absenceType}>Type: {item.absence_type.replace('_', ' ')}</Text>
        
        {item.status === 'Unpaid' && item.absence_type === 'Unexcused' && (
          <TouchableOpacity 
            style={styles.payButton}
            onPress={() => {
              setSelectedFine(item);
              setModalVisible(true);
            }}
          >
            <Text style={styles.payButtonText}>Record Payment</Text>
          </TouchableOpacity>
        )}
         {item.absence_type === 'Pending_Review' && (
          <Text style={styles.pendingText}>⏳ Under Review</Text>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1b5e20" />
      
      {/* HEADER (Taller to allow overlap) */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Fines</Text>
        <Text style={styles.headerSubtitle}>Student Overview</Text>
      </View>

      {/* STATS CARDS (Negative margin to float up) */}
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { borderLeftColor: '#d32f2f' }]}>
          <Text style={styles.statLabel}>TOTAL UNPAID</Text>
          <Text style={[styles.statValue, { color: '#d32f2f' }]}>₱{totalUnpaid.toFixed(2)}</Text>
        </View>
        <View style={[styles.statCard, { borderLeftColor: '#fbc02d' }]}>
          <Text style={styles.statLabel}>PENDING</Text>
          <Text style={[styles.statValue, { color: '#fbc02d' }]}>{totalPending}</Text>
        </View>
        <View style={[styles.statCard, { borderLeftColor: '#1b5e20' }]}>
          <Text style={styles.statLabel}>TOTAL FINES</Text>
          <Text style={[styles.statValue, { color: '#1b5e20' }]}>{countTotal}</Text>
        </View>
      </View>

      {/* TABS */}
      <View style={styles.tabsContainer}>
        {['All', 'Unpaid', 'Paid'].map((tab) => (
          <TouchableOpacity 
            key={tab} 
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {tab} Fines
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* LIST */}
      {loading ? (
        <ActivityIndicator size="large" color="#1b5e20" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={activeTab === 'All' ? fines : fines.filter(f => activeTab === 'Unpaid' ? f.status === 'Unpaid' : f.status === 'Paid')}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderFineItem}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={<Text style={styles.emptyText}>No fines found.</Text>}
        />
      )}

      {/* PAYMENT MODAL */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Record Payment</Text>
            <Text style={styles.modalSubtitle}>
              Amount to pay: <Text style={{fontWeight: 'bold', color: '#333'}}>₱{selectedFine?.amount}</Text>
            </Text>
            
            <View style={styles.warningBox}>
              <Ionicons name="warning" size={20} color="#856404" />
              <Text style={styles.warningText}>
                Important: Only submit this form AFTER you have paid to the cashier. You will need your official receipt number.
              </Text>
            </View>

            <Text style={styles.inputLabel}>Official Receipt Number:</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. OR-2026-12345"
              value={orNumber}
              onChangeText={setOrNumber}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.cancelBtn}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.confirmBtn}
                onPress={handleSubmitPayment}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.confirmBtnText}>Record Payment</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  
  // 🟢 HEADER: Standard header, no extra space at bottom
  header: { 
    backgroundColor: '#1b5e20', 
    paddingHorizontal: 20,
    paddingTop: 50,    
    paddingBottom: 30, // Normal padding
  },
  headerTitle: { color: 'white', fontSize: 24, fontWeight: 'bold' },
  headerSubtitle: { color: 'rgba(255,255,255,0.8)', fontSize: 14, marginTop: 2 },
  
  // 🟢 STATS CONTAINER: Sitting in the BODY, not floating
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    marginTop: 20, // <--- Positive margin pushes it DOWN (away from header)
  },
  
  // 🟢 INDIVIDUAL CARDS: Keep the gaps you liked
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    paddingVertical: 20,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginHorizontal: 5, // <--- Keeps the spaces between boxes
    elevation: 2,        
    shadowColor: '#000', 
    shadowOpacity: 0.1, 
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    justifyContent: 'center',
    borderLeftWidth: 4, 
  },
  statLabel: { fontSize: 9, color: '#666', fontWeight: 'bold', marginBottom: 5, letterSpacing: 0.5, textTransform: 'uppercase' },
  statValue: { fontSize: 18, fontWeight: 'bold' },

  // Tabs
  tabsContainer: { flexDirection: 'row', padding: 15, paddingTop: 20, gap: 10 },
  tab: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, backgroundColor: '#e0e0e0' },
  activeTab: { backgroundColor: '#1b5e20' },
  tabText: { fontSize: 13, color: '#333', fontWeight: '600' },
  activeTabText: { color: 'white' },

  // List & Cards
  listContent: { padding: 15 },
  card: { backgroundColor: 'white', borderRadius: 10, padding: 15, marginBottom: 12, elevation: 2 },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between' },
  eventName: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 2 },
  orgName: { fontSize: 12, color: '#666', marginBottom: 2 },
  date: { fontSize: 12, color: '#888' },
  amount: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  
  statusBadge: { marginTop: 4, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, borderWidth: 1, alignSelf: 'flex-end' },
  badgeRed: { borderColor: '#d32f2f', backgroundColor: '#ffebee' },
  badgeGreen: { borderColor: '#1b5e20', backgroundColor: '#e8f5e9' },
  statusText: { fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' },
  textRed: { color: '#d32f2f' },
  textGreen: { color: '#1b5e20' },

  actionRow: { marginTop: 15, paddingTop: 15, borderTopWidth: 1, borderTopColor: '#f0f0f0', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  absenceType: { fontSize: 12, color: '#666' },
  payButton: { backgroundColor: '#1b5e20', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 6 },
  payButtonText: { color: 'white', fontSize: 12, fontWeight: 'bold' },
  pendingText: { color: '#fbc02d', fontWeight: 'bold', fontSize: 12 },

  emptyText: { textAlign: 'center', marginTop: 40, color: '#999' },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: 'white', width: '90%', padding: 25, borderRadius: 12, elevation: 5 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#1b5e20', marginBottom: 5 },
  modalSubtitle: { fontSize: 15, color: '#666', marginBottom: 20 },
  warningBox: { flexDirection: 'row', backgroundColor: '#fff3cd', padding: 12, borderRadius: 6, gap: 10, marginBottom: 20 },
  warningText: { fontSize: 12, color: '#856404', flex: 1, lineHeight: 18 },
  inputLabel: { fontSize: 14, fontWeight: 'bold', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 12, marginBottom: 25, fontSize: 16 },
  modalButtons: { flexDirection: 'row', gap: 15 },
  confirmBtn: { flex: 1, backgroundColor: '#1b5e20', padding: 14, borderRadius: 6, alignItems: 'center' },
  confirmBtnText: { color: 'white', fontWeight: 'bold', fontSize: 14 },
  cancelBtn: { flex: 1, backgroundColor: '#daa520', padding: 14, borderRadius: 6, alignItems: 'center' },
  cancelBtnText: { color: 'white', fontWeight: 'bold', fontSize: 14 },
});