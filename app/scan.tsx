import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Camera, CameraView } from "expo-camera";
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// 🟢 FIX: NEW IP ADDRESS
const BASE_URL = 'http://172.20.10.8/capstone';

export default function ScanScreen() {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const getPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    };
    getPermissions();
  }, []);

  const handleBarCodeScanned = async ({ type, data }: any) => {
    setScanned(true);
    try {
        const userData = await AsyncStorage.getItem('user_data');
        if (!userData) return;
        const user = JSON.parse(userData);

        const response = await fetch(`${BASE_URL}/record_attendance.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ qr_data: data, user_id: user.user_id })
        });

        const result = await response.json();
        Alert.alert(
            result.success ? "Attendance Recorded!" : "Failed",
            result.message || "Invalid QR Code",
            [{ text: "OK", onPress: () => setScanned(false) }]
        );
    } catch (e) {
        Alert.alert("Error", "Could not connect to server.");
        setScanned(false);
    }
  };

  if (hasPermission === null) return <View style={styles.container} />;
  if (hasPermission === false) return <Text style={{color:'#fff', marginTop:50, textAlign:'center'}}>No Camera Access</Text>;

  return (
    <View style={styles.container}>
      <CameraView
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={styles.overlay}>
        <View style={styles.scanFrame} />
        <Text style={styles.instruct}>Align Event QR Code within frame</Text>
        <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
          <Ionicons name="close-circle" size={50} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  scanFrame: { width: 250, height: 250, borderWidth: 2, borderColor: '#fff', borderRadius: 20 },
  instruct: { color: '#fff', marginTop: 20, fontSize: 16, fontWeight: 'bold' },
  closeBtn: { position: 'absolute', bottom: 50 }
});