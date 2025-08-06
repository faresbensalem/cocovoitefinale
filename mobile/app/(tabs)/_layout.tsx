import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            height: 90,
            paddingBottom: 20,
          },
          android: {
            height: 70,
            paddingBottom: 10,
          },
          default: {
            height: 70,
            paddingBottom: 10,
          },
        }),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Accueil',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />, 
        }}
      />
      <Tabs.Screen
        name="recherche"
        options={{
          title: 'Recherche',
          tabBarIcon: ({ color, size }) => <Ionicons name="search" size={size ?? 28} color={color} />, 
        }}
      />
      <Tabs.Screen
        name="publier"
        options={{
          title: 'Publier',
          tabBarIcon: ({ color, size }) => <Ionicons name="car" size={size ?? 28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="connexion"
        options={{
          title: 'Connexion',
          tabBarIcon: ({ color, size }) => <Ionicons name="log-in-outline" size={size ?? 28} color={color} />, 
          href: null, // Cache cet onglet de la navigation
        }}
      />
      <Tabs.Screen
        name="inscription"
        options={{
          title: 'Inscription',
          href: null, // Cache cet onglet de la navigation
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" size={size ?? 28} color={color} />, 
        }}
      />
      <Tabs.Screen
        name="voiture"
        options={{
          title: 'Voiture',
          href: null, // Cache cet onglet de la navigation
        }}
      />
    </Tabs>
  );
}
