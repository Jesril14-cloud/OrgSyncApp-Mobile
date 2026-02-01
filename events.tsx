import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { Calendar } from 'react-native-calendars';

// 🟢 MANUAL IP ADDRESS
const BASE_URL = 'http://172.20.10.8/capstone'; 

export default function EventsScreen() {
  const router = useRouter();
  const [events, setEvents] = useState([]);
  const [markedDates, setMarkedDates] = useState({});
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedEvents, setSelectedEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [activeEvent, setActiveEvent] = useState<any>(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch(`${BASE_URL}/get_events.php`);
      const text = await response.text();
      try { 
        const data = JSON.parse(text); 
        if (data.success) {
          setEvents(data.events);
          processCalendarMarkers(data.events);
        }
      } catch(e) { console.error("JSON Error", text); }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const processCalendarMarkers = (eventList: any[]) => {
    let markers: any = {};
    eventList.forEach(event => {
      const dateKey = event.start.split(' ')[0]; 
      // Use the event's real org color for the dot
      markers[dateKey] = { marked: true, dotColor: event.color || '#1b5e20' };
    });
    setMarkedDates(markers);
  };

  const onDayPress = (day: any) => {
    setSelectedDate(day.dateString);
    const daysEvents = events.filter((e: any) => e.start.startsWith(day.dateString));
    setSelectedEvents(daysEvents);
  };

  const openEventDetails = (event: any) => {
    setActiveEvent(event);
    setModalVisible(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>My Event Calendar</Text>
          <Text style={styles.headerSub}>Dashboard / My Calendar</Text>
        </View>
      </View>

      <ScrollView style={styles.content}>
        
        {/* SUMMARY CARD */}
        <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>UPCOMING EVENTS</Text>
            <Text style={styles.summaryValue}>{events.length}</Text>
            <Text style={styles.summarySub}>View all upcoming university events</Text>
        </View>

        {/* 🟢 GREEN INFO BANNER (From Web Screenshot) */}
        <View style={styles.infoBanner}>
             {/* Using a star icon to match the text description */}
            <Text style={styles.infoBannerText}>
                📌 Showing all approved university events. Events from your organization are highlighted with a star (⭐).
            </Text>
        </View>

        {/* CALENDAR GRID */}
        <View style={styles.calendarContainer}>
            <Calendar
                markedDates={{
                    ...markedDates,
                    [selectedDate]: { selected: true, selectedColor: '#1b5e20' }
                }}
                onDayPress={onDayPress}
                theme={{
                    todayTextColor: '#1b5e20',
                    arrowColor: '#1b5e20',
                    selectedDayBackgroundColor: '#1b5e20',
                    dotColor: '#1b5e20',
                    textMonthFontWeight: 'bold',
                }}
            />
        </View>

        {/* EVENTS LIST */}
        <View style={styles.eventListContainer}>
            <Text style={styles.sectionTitle}>
                {selectedDate ? `Events for ${selectedDate}` : "Select a date to view details"}
            </Text>

            {selectedEvents.length === 0 && selectedDate !== '' && (
                <Text style={styles.noEventsText}>No events scheduled for this day.</Text>
            )}

            {selectedEvents.map((item: any, index) => (
                <TouchableOpacity key={index} style={styles.eventCard} onPress={() => openEventDetails(item)}>
                    <View style={styles.eventRow}>
                        <View style={styles.dateBox}>
                            <Text style={styles.dayText}>{new Date(item.start).getDate()}</Text>
                            <Text style={styles.monthText}>{new Date(item.start).toLocaleString('default', { month: 'short' })}</Text>
                        </View>
                        <View style={{flex: 1}}>
                            <Text style={styles.eventTitle}>{item.title}</Text>
                            {/* Small pill in list view too */}
                            <View style={[styles.miniPill, {backgroundColor: item.color}]}>
                                <Text style={styles.miniPillText}>{item.organization}</Text>
                            </View>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#ccc" />
                    </View>
                </TouchableOpacity>
            ))}
        </View>
      </ScrollView>

      {/* 🟢 POPUP MODAL (Dynamic Data) */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
                
                {/* Header */}
                <View style={styles.modalHeader}>
                    <Text style={styles.modalHeaderTitle}>Event Details</Text>
                    <TouchableOpacity onPress={() => setModalVisible(false)}>
                        <Ionicons name="close" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>

                {/* Body */}
                <View style={styles.modalBody}>
                    <Text style={styles.modalTitle}>{activeEvent?.title}</Text>
                    
                    {/* 🟢 DYNAMIC ORGANIZATION PILL */}
                    {/* Uses the real color from DB (e.g. Blue for CSG) */}
                    <View style={[styles.orgPill, { backgroundColor: activeEvent?.color || '#1b5e20' }]}>
                        <Text style={styles.orgText}>{activeEvent?.organization}</Text>
                    </View>

                    {/* Details */}
                    <View style={styles.detailsGrid}>
                        <View style={styles.detailItem}>
                             <Ionicons name="calendar-outline" size={18} color="#666" style={{marginRight: 8}} />
                             <View>
                                <Text style={styles.detailLabel}>DATE</Text>
                                <Text style={styles.detailValue}>
                                    {activeEvent ? new Date(activeEvent.start).toDateString() : ''}
                                </Text>
                             </View>
                        </View>

                        <View style={styles.detailItem}>
                             <Ionicons name="time-outline" size={18} color="#666" style={{marginRight: 8}} />
                             <View>
                                <Text style={styles.detailLabel}>TIME</Text>
                                <Text style={styles.detailValue}>
                                    {activeEvent ? new Date(activeEvent.start).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}
                                </Text>
                             </View>
                        </View>
                    </View>

                    <View style={[styles.detailItem, { marginTop: 15 }]}>
                         <Ionicons name="location-outline" size={18} color="#666" style={{marginRight: 8}} />
                         <View>
                            <Text style={styles.detailLabel}>LOCATION</Text>
                            <Text style={styles.detailValue}>{activeEvent?.location}</Text>
                         </View>
                    </View>

                    {/* Description */}
                    <View style={styles.descBox}>
                        <Text style={styles.detailLabel}>DESCRIPTION</Text>
                        <Text style={styles.descText}>
                            {activeEvent?.description}
                        </Text>
                    </View>

                    <TouchableOpacity style={styles.closeBtn} onPress={() => setModalVisible(false)}>
                        <Text style={styles.closeText}>Close</Text>
                    </TouchableOpacity>
                </View>

            </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6f8' },
  header: { backgroundColor: '#1b5e20', padding: 20, paddingTop: 50, flexDirection: 'row', alignItems: 'center' },
  backBtn: { marginRight: 15 },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  headerSub: { color: '#a5d6a7', fontSize: 12 },
  content: { flex: 1 },

  summaryCard: { margin: 15, backgroundColor: '#fff', padding: 20, borderRadius: 10, borderLeftWidth: 5, borderLeftColor: '#1b5e20', elevation: 2 },
  summaryLabel: { color: '#666', fontSize: 12, fontWeight: 'bold', letterSpacing: 1 },
  summaryValue: { fontSize: 36, fontWeight: 'bold', color: '#1b5e20', marginVertical: 5 },
  summarySub: { color: '#888', fontSize: 12 },

  // Green Info Banner
  infoBanner: { backgroundColor: '#d4edda', marginHorizontal: 15, marginBottom: 10, padding: 15, borderRadius: 5, borderColor: '#c3e6cb', borderWidth: 1 },
  infoBannerText: { color: '#155724', fontSize: 12, lineHeight: 18 },

  calendarContainer: { marginHorizontal: 15, backgroundColor: '#fff', borderRadius: 10, padding: 5, elevation: 2 },

  eventListContainer: { padding: 20 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 10 },
  noEventsText: { color: '#888', fontStyle: 'italic', marginTop: 10 },
  
  eventCard: { backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 10, elevation: 1 },
  eventRow: { flexDirection: 'row', alignItems: 'center' },
  dateBox: { backgroundColor: '#e8f5e9', padding: 8, borderRadius: 8, marginRight: 15, alignItems: 'center', width: 55 },
  dayText: { fontSize: 18, fontWeight: 'bold', color: '#1b5e20' },
  monthText: { fontSize: 10, color: '#1b5e20', fontWeight: 'bold', textTransform: 'uppercase' },
  eventTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  
  // Mini pill in list view
  miniPill: { marginTop: 4, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, alignSelf: 'flex-start' },
  miniPillText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },

  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContainer: { backgroundColor: '#fff', width: '100%', borderRadius: 8, overflow: 'hidden', elevation: 10 },
  modalHeader: { backgroundColor: '#1b5e20', padding: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalHeaderTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  modalBody: { padding: 20 },
  modalTitle: { fontSize: 22, fontWeight: 'bold', color: '#333', marginBottom: 10 },
  
  // The Dynamic Organization Pill
  orgPill: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 15, marginBottom: 20 },
  orgText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },

  detailsGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  detailItem: { flexDirection: 'row', alignItems: 'flex-start', flex: 1 },
  detailLabel: { fontSize: 10, color: '#888', fontWeight: 'bold', marginBottom: 2 },
  detailValue: { fontSize: 14, color: '#333', fontWeight: '600' },

  descBox: { backgroundColor: '#f9f9f9', padding: 15, borderRadius: 5, marginTop: 20, marginBottom: 20 },
  descText: { color: '#555', fontSize: 14, lineHeight: 20 },

  closeBtn: { alignSelf: 'flex-end', paddingHorizontal: 20, paddingVertical: 8, borderWidth: 1, borderColor: '#ddd', borderRadius: 5 },
  closeText: { color: '#666' }
});