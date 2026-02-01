import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert, SafeAreaView,
  ScrollView,
  StyleSheet,
  Text, TextInput, TouchableOpacity,
  View
} from 'react-native';
import { apiRequest } from './services/api';

export default function RegisterScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // --- STATE VARIABLES ---
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [idFront, setIdFront] = useState<string | null>(null);
  const [idBack, setIdBack] = useState<string | null>(null);

  const pickImage = async (type: 'front' | 'back') => {
    let permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) { Alert.alert("Permission Required", "Allow gallery access."); return; }
    
    let result = await ImagePicker.launchImageLibraryAsync({ 
        mediaTypes: ImagePicker.MediaTypeOptions.Images, 
        quality: 0.1, 
        base64: true 
    });

    if (!result.canceled && result.assets[0].base64) {
      if (type === 'front') setIdFront(result.assets[0].base64);
      else setIdBack(result.assets[0].base64);
    }
  };

  const handleRegister = async () => {
    if (!firstName || !lastName || !email || !password || !confirmPassword || !idFront || !idBack) {
      Alert.alert("Error", "All fields marked with * are required.");
      return;
    }

    if (password !== confirmPassword) { Alert.alert("Mismatch", "Passwords do not match."); return; }
    if (!email.includes('@hnu.edu.ph')) { Alert.alert("Invalid Email", "Must use @hnu.edu.ph email."); return; }
    if (password.length < 8) { Alert.alert("Weak Password", "Password must be at least 8 characters."); return; }

    setLoading(true);

    const result = await apiRequest('register.php', 'POST', {
        first_name: firstName, 
        last_name: lastName,
        email: email, 
        password: password,
        id_front_base64: idFront, 
        id_back_base64: idBack          
    });

    setLoading(false);

    if (result.success) {
      Alert.alert(
        "Registration Sent!", 
        "Your account is now PENDING APPROVAL.\n\nPlease wait for the CSA to verify your ID photos before you can log in.",
        // 🟢 FIX 1: Point directly to /login
        [{ text: "OK", onPress: () => router.replace('/login') }] 
      );
    } else {
      Alert.alert("Registration Failed", result.message || "Please try again.");
    }
  };

  // Helper Component for inputs
  const InputField = ({ label, value, onChange, placeholder, secure = false, style = {} }: any) => (
    <View style={[styles.inputContainer, style]}>
      <Text style={styles.label}>{label} <Text style={styles.red}>*</Text></Text>
      <TextInput 
        style={styles.input} 
        value={value} 
        onChangeText={onChange} 
        placeholder={placeholder}
        placeholderTextColor="#ccc"
        secureTextEntry={secure}
        autoCapitalize="none"
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* HEADER */}
        <View style={styles.headerContainer}>
            <Text style={styles.headerTitle}>Student Registration</Text>
            <Text style={styles.headerSubtitle}>Create your OrgSync account</Text>
        </View>

        {/* ROW 1: NAMES */}
        <View style={styles.row}>
            <InputField label="First Name" value={firstName} onChange={setFirstName} style={{flex: 1, marginRight: 10}} />
            <InputField label="Last Name" value={lastName} onChange={setLastName} style={{flex: 1}} />
        </View>

        {/* EMAIL */}
        <InputField label="HNU Email Address" value={email} onChange={setEmail} placeholder="yourname@hnu.edu.ph" />

        {/* ROW 2: PASSWORD */}
        <View style={styles.row}>
            <InputField label="Password" value={password} onChange={setPassword} secure={!showPassword} placeholder="Min. 8 chars" style={{flex: 1, marginRight: 10}} />
            <InputField label="Confirm Password" value={confirmPassword} onChange={setConfirmPassword} secure={!showPassword} style={{flex: 1}} />
        </View>
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{marginBottom: 20}}>
            <Text style={{color: '#666', fontSize: 12, textAlign: 'right'}}>
                {showPassword ? "Hide Password" : "Show Password"}
            </Text>
        </TouchableOpacity>

        {/* ROW 3: ID UPLOADS */}
        <View style={styles.row}>
            {/* Front ID */}
            <View style={{flex: 1, marginRight: 10}}>
                <Text style={styles.label}>School ID (Front) <Text style={styles.red}>*</Text></Text>
                <TouchableOpacity style={styles.uploadBox} onPress={() => pickImage('front')}>
                    {idFront ? (
                        <View style={{alignItems: 'center'}}>
                            <Ionicons name="checkmark-circle" size={32} color="green" />
                            <Text style={styles.uploadedText}>Front Ready</Text>
                        </View>
                    ) : (
                        <View style={{alignItems: 'center'}}>
                            <Ionicons name="camera-outline" size={32} color="#999" />
                            <Text style={styles.uploadText}>Click to upload</Text>
                        </View>
                    )}
                </TouchableOpacity>
            </View>

            {/* Back ID */}
            <View style={{flex: 1}}>
                <Text style={styles.label}>School ID (Back) <Text style={styles.red}>*</Text></Text>
                <TouchableOpacity style={styles.uploadBox} onPress={() => pickImage('back')}>
                    {idBack ? (
                        <View style={{alignItems: 'center'}}>
                            <Ionicons name="checkmark-circle" size={32} color="green" />
                            <Text style={styles.uploadedText}>Back Ready</Text>
                        </View>
                    ) : (
                        <View style={{alignItems: 'center'}}>
                            <Ionicons name="camera-outline" size={32} color="#999" />
                            <Text style={styles.uploadText}>Click to upload</Text>
                        </View>
                    )}
                </TouchableOpacity>
            </View>
        </View>

        {/* BUTTON */}
        <TouchableOpacity style={styles.registerButton} onPress={handleRegister} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff"/> : <Text style={styles.registerButtonText}>Create Account</Text>}
        </TouchableOpacity>

        {/* 🟢 FIX 2: Point directly to /login */}
        <TouchableOpacity onPress={() => router.replace('/login')} style={{marginTop: 20}}>
          <Text style={{textAlign: 'center', color: '#666'}}>
             Already have an account? <Text style={{color: '#1b5e20', fontWeight: 'bold'}}>Sign in here</Text>
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' }, 
  scrollContent: { padding: 25, justifyContent: 'center' },
  
  headerContainer: { alignItems: 'center', marginBottom: 30, marginTop: 10 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#1b5e20' }, 
  headerSubtitle: { fontSize: 14, color: '#666', marginTop: 5 },

  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  inputContainer: { marginBottom: 15 },
  label: { fontSize: 13, fontWeight: '600', color: '#333', marginBottom: 6 },
  red: { color: 'red' },
  
  input: { 
    backgroundColor: '#fff', 
    borderWidth: 1, 
    borderColor: '#e0e0e0', 
    borderRadius: 6, 
    padding: 12,
    fontSize: 14
  },

  uploadBox: {
    height: 100,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#ccc',
    borderStyle: 'dashed',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center'
  },
  uploadText: { fontSize: 12, color: '#999', marginTop: 5 },
  uploadedText: { fontSize: 12, color: 'green', marginTop: 5, fontWeight: 'bold' },

  registerButton: { 
    backgroundColor: '#1b5e20', 
    padding: 15, 
    borderRadius: 6, 
    alignItems: 'center', 
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  registerButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});