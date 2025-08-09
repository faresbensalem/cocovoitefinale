import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const res = await fetch('http://192.168.1.70:5000/check-session', {
        credentials: 'include',
      });
      const data = await res.json();
      
      if (!data.isAuthenticated) {
        // Rediriger vers la connexion si pas connecté
        router.replace('/(tabs)/connexion');
        return;
      }
      
      setUser(data.user);
    } catch (error) {
      console.error('Erreur de vérification de session:', error);
      router.replace('/(tabs)/connexion');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const res = await fetch('http://192.168.1.70:5000/logout', {
        method: 'POST',
        credentials: 'include',
      });
      
      if (res.ok) {
        router.replace('/(tabs)/connexion');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Problème lors de la déconnexion');
    }
  };

  const handleConducteur = () => {
    router.push('/(tabs)/publier');
  };

  const handlePassager = () => {
    router.push('/(tabs)/recherche');
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Top background decor */}
      <View style={styles.heroBg}>
        <View style={styles.bgCircleA} />
        <View style={styles.bgCircleB} />
        {/* Logo déplacé en bas de la page */}
        <BlurView intensity={40} tint="light" style={styles.heroCard}>
          <Text style={styles.heroKicker}>Bienvenue</Text>
          <Text style={styles.heroTitle}>Cocovoit</Text>
          <Text style={styles.heroSubtitle}>Voyagez malin, partagez vos trajets</Text>
          {user && (
            <View style={styles.heroUserRow}>
              <Ionicons name="happy-outline" size={18} color="#0ea5e9" />
              <Text style={styles.heroUserText}>Bonjour, {user.nom}</Text>
            </View>
          )}
          <View style={styles.heroCtas}>
            <TouchableOpacity style={styles.ctaPrimary} onPress={handlePassager}>
              <Ionicons name="search" size={18} color="#fff" />
              <Text style={styles.ctaPrimaryText}>Rechercher un trajet</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.ctaGhost} onPress={handleConducteur}>
              <Ionicons name="car-sport" size={18} color="#0ea5e9" />
              <Text style={styles.ctaGhostText}>Publier un trajet</Text>
            </TouchableOpacity>
          </View>
        </BlurView>
        {!!user && (
          <TouchableOpacity onPress={handleLogout} style={[styles.topLogout, { top: insets.top + 44 }]}>
            <Ionicons name="log-out-outline" size={18} color="#0f172a" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.content}>
        {/* Quick actions grid */}
        <View style={styles.grid}>
          <TouchableOpacity style={[styles.tile, styles.tileBlue]} onPress={handlePassager}>
            <View style={styles.tileIconBubble}><Ionicons name="navigate" size={20} color="#fff" /></View>
            <Text style={styles.tileTitle}>Recherche</Text>
            <Text style={styles.tileText}>Trouvez un covoiturage près de chez vous</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tile, styles.tileGreen]} onPress={handleConducteur}>
            <View style={styles.tileIconBubble}><Ionicons name="car" size={20} color="#fff" /></View>
            <Text style={styles.tileTitle}>Publier</Text>
            <Text style={styles.tileText}>Partagez votre trajet et réduisez vos frais</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tile, styles.tileIndigo]} onPress={() => router.push('/(tabs)/reservations')}>
            <View style={styles.tileIconBubble}><Ionicons name="reader" size={20} color="#fff" /></View>
            <Text style={styles.tileTitle}>Réservations</Text>
            <Text style={styles.tileText}>Suivez vos trajets réservés</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tile, styles.tileOrange]} onPress={() => router.push('/(tabs)/mestrajet')}>
            <View style={styles.tileIconBubble}><Ionicons name="map" size={20} color="#fff" /></View>
            <Text style={styles.tileTitle}>Mes trajets</Text>
            <Text style={styles.tileText}>Gérez vos trajets publiés</Text>
          </TouchableOpacity>
        </View>

        {/* Highlights */}
        <View style={styles.highlights}>
          <View style={styles.highlightItem}>
            <Ionicons name="leaf-outline" size={18} color="#16a34a" />
            <Text style={styles.highlightText}>Éco-responsable</Text>
          </View>
          <View style={styles.highlightItem}>
            <Ionicons name="shield-checkmark-outline" size={18} color="#2563eb" />
            <Text style={styles.highlightText}>Sécurisé</Text>
          </View>
          <View style={styles.highlightItem}>
            <Ionicons name="cash-outline" size={18} color="#f59e0b" />
            <Text style={styles.highlightText}>Économique</Text>
          </View>
        </View>

        {/* Logo en bas, entre les highlights et la barre de navigation */}
        <View style={styles.bottomLogoContainer}>
          <Image
            source={require('../../assets/cocologo.png')}
            style={styles.bottomLogo}
            resizeMode="contain"
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fb',
  },
  heroBg: {
    height: 300,
    backgroundColor: '#0ea5e9',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: 'hidden',
  },
  bgCircleA: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: '#22d3ee',
    top: -60,
    right: -40,
    opacity: 0.45,
  },
  bgCircleB: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#38bdf8',
    bottom: -40,
    left: -30,
    opacity: 0.4,
  },
  logoHero: {
    position: 'absolute',
    width: 56,
    height: 56,
    top: 18,
    left: 18,
  },
  topLogout: {
    position: 'absolute',
    top: 18,
    right: 18,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  heroCard: {
    marginTop: 80,
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  heroKicker: { color: '#0369a1', fontWeight: '700', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 },
  heroTitle: { color: '#0f172a', fontSize: 28, fontWeight: '800' },
  heroSubtitle: { color: '#1f2937', marginTop: 4 },
  heroUserRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 },
  heroUserText: { color: '#0f172a', fontWeight: '700' },
  heroCtas: { flexDirection: 'row', gap: 10, marginTop: 16 },
  ctaPrimary: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#0ea5e9', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10 },
  ctaPrimaryText: { color: '#fff', fontWeight: '700' },
  ctaGhost: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.9)', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10 },
  ctaGhostText: { color: '#0ea5e9', fontWeight: '700' },
  content: {
    flex: 1,
    padding: 16,
    paddingBottom: 140,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  tile: { flexBasis: '48%', backgroundColor: '#fff', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#eef2f7' },
  tileBlue: { shadowColor: '#3b82f6', shadowOpacity: 0.08, shadowRadius: 6, elevation: 2 },
  tileGreen: { shadowColor: '#10b981', shadowOpacity: 0.08, shadowRadius: 6, elevation: 2 },
  tileIndigo: { shadowColor: '#6366f1', shadowOpacity: 0.08, shadowRadius: 6, elevation: 2 },
  tileOrange: { shadowColor: '#f59e0b', shadowOpacity: 0.08, shadowRadius: 6, elevation: 2 },
  tileIconBubble: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#0ea5e9', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  tileTitle: { fontSize: 16, fontWeight: '700', color: '#0f172a' },
  tileText: { color: '#6b7280', marginTop: 4 },
  highlights: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff', borderRadius: 12, padding: 12, marginTop: 16, borderWidth: 1, borderColor: '#eef2f7' },
  highlightItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  highlightText: { color: '#0f172a', fontWeight: '600' },
  bottomLogoContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 16, marginBottom: 8 },
  bottomLogo: { width: 160, height: 60, opacity: 0.9 },
  loadingText: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 50,
    color: '#666',
  },
});
