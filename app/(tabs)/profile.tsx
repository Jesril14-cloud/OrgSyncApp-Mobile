import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

// 🟢 MANUAL IP ADDRESS (No Config File Needed)
const BASE_URL = 'http://172.20.10.8/capstone';

export default function ProfileScreen() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false); // Toggles Edit Mode
  const [saving, setSaving] = useState(false);

  // Edit Form States
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [newPhoto, setNewPhoto] = useState<string | null>(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await AsyncStorage.getItem('user_data');
      if (userData) {
        const parsed = JSON.parse(userData);
        setUser(parsed);
        setFirstName(parsed.first_name);
        setLastName(parsed.last_name);
        setPhone(parsed.phone_number || '');
        setBirthdate(parsed.birthdate || '');
      }
    } catch (e) {
      console.error("Failed to load user", e);
    } finally {
      setLoading(false);
    }
  };

  // 🟢 FIX LOGOUT BUG
  // ✅ NEW SAFE CODE
// 🟢 FIX: PREVENT AUTO-LOGIN BOUNCE
  // 🟢 AGGRESSIVE LOGOUT FIX
  const handleLogout = async () => {
    Alert.alert("Log Out", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      { 
        text: "Log Out", 
        style: 'destructive',
        onPress: async () => {
            try {
                // 1. Corrupt the data (This is faster than deleting)
                await AsyncStorage.setItem('user_data', 'logged_out');
                
                // 2. Try to remove it (If this fails, step 1 saves us)
                await AsyncStorage.removeItem('user_data');

                // 3. Go to Login
                router.replace('/'); 
            } catch (error) {
                // Even if storage fails, force navigation
                router.replace('/');
            }
        }
      }
    ]);
  };
  // 🟢 IMAGE PICKER
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      setNewPhoto(result.assets[0].base64);
    }
  };

  // 🟢 SAVE CHANGES
  const handleSave = async () => {
    setSaving(true);
    try {
        const response = await fetch(`${BASE_URL}/update_profile.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_id: user.user_id,
                first_name: firstName,
                last_name: lastName,
                phone: phone,
                birthdate: birthdate,
                photo_base64: newPhoto 
            })
        });

        const result = await response.json();
        
        if (result.success) {
            await AsyncStorage.setItem('user_data', JSON.stringify(result.user));
            setUser(result.user);
            setIsEditing(false);
            setNewPhoto(null);
            Alert.alert("Success", "Profile Updated!");
        } else {
            Alert.alert("Error", result.message);
        }
    } catch (e) {
        Alert.alert("Network Error", "Check your connection.");
    } finally {
        setSaving(false);
    }
  };

  if (loading) return <View style={styles.center}><ActivityIndicator color="#1b5e20" /></View>;

  const profileImageSrc = newPhoto 
    ? { uri: `data:image/jpeg;base64,${newPhoto}` }
    : (user?.profile_pic 
        ? { uri: `data:image/jpeg;base64,${user.profile_pic}` } 
        : null);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{isEditing ? "Edit Profile" : "My Profile"}</Text>
      </View>

      <View style={styles.cardContainer}>
        <View style={styles.card}>
            <View style={styles.avatarContainer}>
                {profileImageSrc ? (
                    <Image source={profileImageSrc} style={styles.avatarImage} />
                ) : (
                    <View style={styles.avatarPlaceholder}>
                        <Text style={styles.avatarText}>
                            {user?.first_name?.charAt(0)}{user?.last_name?.charAt(0)}
                        </Text>
                    </View>
                )}
                {isEditing && (
                    <TouchableOpacity style={styles.cameraBtn} onPress={pickImage}>
                        <Ionicons name="camera" size={20} color="#fff" />
                    </TouchableOpacity>
                )}
            </View>

            {isEditing ? (
                <View style={styles.form}>
                    <Text style={styles.label}>First Name</Text>
                    <TextInput style={styles.input} value={firstName} onChangeText={setFirstName} />
                    
                    <Text style={styles.label}>Last Name</Text>
                    <TextInput style={styles.input} value={lastName} onChangeText={setLastName} />

                    <Text style={styles.label}>Phone Number</Text>
                    <TextInput style={styles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="0912..." />

                    <Text style={styles.label}>Birthdate (YYYY-MM-DD)</Text>
                    <TextInput style={styles.input} value={birthdate} onChangeText={setBirthdate} placeholder="2000-01-30" />

                    <View style={styles.btnRow}>
                        <TouchableOpacity style={[styles.btn, styles.cancelBtn]} onPress={() => setIsEditing(false)}>
                            <Text style={styles.cancelText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.btn, styles.saveBtn]} onPress={handleSave} disabled={saving}>
                            {saving ? <ActivityIndicator color="#fff"/> : <Text style={styles.saveText}>Save Changes</Text>}
                        </TouchableOpacity>
                    </View>
                </View>
            ) : (
                <View style={styles.infoSection}>
                    <Text style={styles.name}>{user?.first_name} {user?.last_name}</Text>
                    <Text style={styles.role}>{user?.role || 'Student'}</Text>

                    <View style={styles.divider} />
                    
                    <View style={styles.infoRow}>
                        <Ionicons name="mail-outline" size={20} color="#666" />
                        <Text style={styles.infoText}>{user?.email}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Ionicons name="call-outline" size={20} color="#666" />
                        <Text style={styles.infoText}>{user?.phone_number || "No phone added"}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Ionicons name="calendar-outline" size={20} color="#666" />
                        <Text style={styles.infoText}>{user?.birthdate || "No birthday added"}</Text>
                    </View>
                    
                    <TouchableOpacity style={styles.editBtn} onPress={() => setIsEditing(true)}>
                        <Text style={styles.editText}>Edit Profile</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                        <Text style={styles.logoutText}>Log Out</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6f8' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { backgroundColor: '#1b5e20', height: 160, justifyContent: 'center', alignItems: 'center', paddingBottom: 30 },
  headerTitle: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  cardContainer: { alignItems: 'center', marginTop: -50, paddingBottom: 50 },
  card: { backgroundColor: '#fff', width: '90%', borderRadius: 15, padding: 25, elevation: 5, alignItems: 'center' },
  avatarContainer: { marginBottom: 20, position: 'relative' },
  avatarImage: { width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: '#fff' },
  avatarPlaceholder: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#e8f5e9', justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#fff' },
  avatarText: { fontSize: 36, fontWeight: 'bold', color: '#1b5e20' },
  cameraBtn: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#1b5e20', padding: 8, borderRadius: 20 },
  infoSection: { width: '100%', alignItems: 'center' },
  name: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  role: { fontSize: 14, color: '#666', marginBottom: 15 },
  divider: { height: 1, backgroundColor: '#eee', width: '100%', marginBottom: 15 },
  infoRow: { flexDirection: 'row', alignItems: 'center', width: '100%', marginBottom: 15, paddingLeft: 10 },
  infoText: { marginLeft: 15, fontSize: 16, color: '#444' },
  form: { width: '100%' },
  label: { fontSize: 12, fontWeight: 'bold', color: '#666', marginTop: 10 },
  input: { borderBottomWidth: 1, borderBottomColor: '#ddd', paddingVertical: 8, fontSize: 16, color: '#333', marginBottom: 5 },
  editBtn: { marginTop: 10, padding: 12, width: '100%', alignItems: 'center', borderWidth: 1, borderColor: '#1b5e20', borderRadius: 10 },
  editText: { color: '#1b5e20', fontWeight: 'bold' },
  logoutBtn: { marginTop: 15, width: '100%', backgroundColor: '#ffebee', padding: 15, borderRadius: 10, alignItems: 'center' },
  logoutText: { color: '#d32f2f', fontWeight: 'bold' },
  btnRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  btn: { flex: 1, padding: 15, borderRadius: 10, alignItems: 'center' },
  cancelBtn: { backgroundColor: '#f5f5f5', marginRight: 10 },
  saveBtn: { backgroundColor: '#1b5e20' },
  cancelText: { color: '#666', fontWeight: 'bold' },
  saveText: { color: '#fff', fontWeight: 'bold' }
});