import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ 
      headerShown: false,
      tabBarActiveTintColor: '#1b5e20', // HNU Green
      tabBarInactiveTintColor: 'gray',
      tabBarStyle: { height: 60, paddingBottom: 10, paddingTop: 5 }
    }}>
      
      {/* 🟢 Tab 1: Home (This is your index.tsx) */}
      <Tabs.Screen 
        name="index" 
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Ionicons name="home" size={24} color={color} />,
        }} 
      />

      {/* 🟢 Tab 2: Profile (This is your profile.tsx) */}
      <Tabs.Screen 
        name="profile" 
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <Ionicons name="person" size={24} color={color} />,
        }} 
      />
      
    </Tabs>
  );
}