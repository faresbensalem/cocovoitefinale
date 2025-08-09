import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';

export default function ProfileScreen() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    trajets: [],
    reservations: [],
    voitures: []
  });
  const [avis, setAvis] = useState({ avis: [], moyenne: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('profile'); // 'profile', 'trajets', 'reservations'

  useEffect(() => {
    fetchData();
  }, []);

  // Rafraîchir les données quand l'écran reprend le focus
  useFocusEffect(
    React.useCallback(() => {
      fetchData();
    }, [])
  );

  const fetchData = async () => {
    try {
      // Vérifier l'authentification
      const authResponse = await fetch('http://192.168.1.70:5000/check-session', {
        credentials: 'include'
      });
      const authData = await authResponse.json();

      if (!authData.isAuthenticated) {
        router.replace('/(tabs)/connexion');
        return;
      }

      setUser(authData.user);

      // Charger les trajets
      const trajetsResponse = await fetch('http://192.168.1.70:5000/mes-trajets', {
        credentials: 'include'
      });
      const trajetsData = await trajetsResponse.json();

      // Charger les réservations
      const reservationsResponse = await fetch('http://192.168.1.70:5000/mes-reservations', {
        credentials: 'include'
      });
      const reservationsData = await reservationsResponse.json();

      setStats({
        trajets: trajetsData,
        reservations: reservationsData,
        voitures: authData.user.voitures || []
      });

      // Charger les avis reçus
      if (authData.user && authData.user.id) {
        const avisResponse = await fetch(`http://192.168.1.70:5000/avis/conducteur/${authData.user.id}`);
        if (avisResponse.ok) {
          const avisData = await avisResponse.json();
          setAvis(avisData);
        }
      }
    } catch (error) {
      console.error('Erreur:', error);
      Alert.alert('Erreur', 'Impossible de charger les données');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleLogout = async () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Déconnexion',
          style: 'destructive',
          onPress: async () => {
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
          }
        }
      ]
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Non spécifiée';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
  };

  const renderProfileTab = () => (
    <View style={styles.tabContent}>
      {/* Informations utilisateur */}
      <View style={styles.profileCard}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={40} color="#fff" />
          </View>
        </View>
        <Text style={styles.userName}>{user?.nom || 'Utilisateur'}</Text>
        <Text style={styles.userType}>{user?.type || 'Utilisateur standard'}</Text>
        
        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <Ionicons name="mail-outline" size={20} color="#007AFF" />
            <Text style={styles.infoText}>{user?.email}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="call-outline" size={20} color="#007AFF" />
            <Text style={styles.infoText}>{user?.numero || 'Non spécifié'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={20} color="#007AFF" />
            <Text style={styles.infoText}>{formatDate(user?.dateNaissance)}</Text>
          </View>
        </View>
      </View>

      {/* Statistiques */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Ionicons name="map-outline" size={24} color="#007AFF" />
          <Text style={styles.statNumber}>{stats.trajets.length}</Text>
          <Text style={styles.statLabel}>Trajets</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="bookmark-outline" size={24} color="#28a745" />
          <Text style={styles.statNumber}>{stats.reservations.length}</Text>
          <Text style={styles.statLabel}>Réservations</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="car-outline" size={24} color="#6f42c1" />
          <Text style={styles.statNumber}>{stats.voitures.length}</Text>
          <Text style={styles.statLabel}>Véhicules</Text>
        </View>
      </View>

      {/* Voiture */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>
          <Ionicons name="car-sport-outline" size={20} color="#007AFF" />
          {' '}Ma voiture
        </Text>
        {user?.voitures && user.voitures.length > 0 ? (
          user.voitures.map((voiture) => (
            <View key={voiture.id} style={styles.voitureCard}>
              <Text style={styles.voitureTitle}>{voiture.marque} {voiture.modele}</Text>
              <Text style={styles.voitureInfo}>Couleur: {voiture.couleur}</Text>
              <Text style={styles.voitureInfo}>Immatriculation: {voiture.immatriculation}</Text>
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="car-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>Aucune voiture enregistrée</Text>
                         <TouchableOpacity 
               style={styles.addButton}
               onPress={() => router.push('/(tabs)/voiture')}
             >
               <Text style={styles.addButtonText}>Ajouter une voiture</Text>
             </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Avis */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>
          <Ionicons name="star-outline" size={20} color="#ffc107" />
          {' '}Note & Commentaires
        </Text>
        <View style={styles.ratingContainer}>
          <Text style={styles.ratingNumber}>{avis.moyenne}</Text>
          <Ionicons name="star" size={24} color="#ffc107" />
          <Text style={styles.ratingText}>({avis.total} avis)</Text>
        </View>
        {avis.avis.length > 0 ? (
          <ScrollView style={styles.avisContainer} showsVerticalScrollIndicator={false}>
            {avis.avis.map((a) => (
              <View key={a.id} style={styles.avisCard}>
                <View style={styles.avisHeader}>
                  <View style={styles.avisRating}>
                    <Ionicons name="star" size={16} color="#ffc107" />
                    <Text style={styles.avisNote}>{a.note}/5</Text>
                  </View>
                  <Text style={styles.avisDate}>
                    {new Date(a.date).toLocaleDateString('fr-FR')}
                  </Text>
                </View>
                <Text style={styles.avisCommentaire}>{a.commentaire}</Text>
                <Text style={styles.avisAuteur}>par {a.auteur?.nom || 'Utilisateur'}</Text>
              </View>
            ))}
          </ScrollView>
        ) : (
          <Text style={styles.emptyText}>Aucun avis pour le moment</Text>
        )}
      </View>
    </View>
  );

  const renderTrajetsTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>
          <Ionicons name="map-outline" size={20} color="#007AFF" />
          {' '}Mes trajets publiés
        </Text>
        {stats.trajets.length > 0 ? (
          <ScrollView showsVerticalScrollIndicator={false}>
            {stats.trajets.map((trajet) => (
              <View key={trajet.id} style={styles.trajetCard}>
                <View style={styles.trajetHeader}>
                  <Text style={styles.trajetRoute}>
                    {trajet.depart} → {trajet.destination}
                  </Text>
                  <Text style={styles.trajetPrix}>{trajet.prix}€</Text>
                </View>
                <View style={styles.trajetDetails}>
                  <Text style={styles.trajetDate}>
                    <Ionicons name="calendar-outline" size={16} color="#666" />
                    {' '}{formatDate(trajet.date)}
                  </Text>
                  <Text style={styles.trajetPlaces}>
                    <Ionicons name="people-outline" size={16} color="#666" />
                    {' '}{trajet.places} places
                  </Text>
                </View>
              </View>
            ))}
          </ScrollView>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="map-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>Aucun trajet publié</Text>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => router.push('/(tabs)/publier')}
            >
              <Text style={styles.addButtonText}>Publier un trajet</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );

  const renderReservationsTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>
          <Ionicons name="bookmark-outline" size={20} color="#28a745" />
          {' '}Mes réservations
        </Text>
        {stats.reservations.length > 0 ? (
          <ScrollView showsVerticalScrollIndicator={false}>
            {stats.reservations.map((reservation) => (
              <View key={reservation.id} style={styles.reservationCard}>
                <View style={styles.reservationHeader}>
                  <Text style={styles.reservationRoute}>
                    {reservation.trajet.depart} → {reservation.trajet.destination}
                  </Text>
                  <View style={[
                    styles.statusBadge,
                    reservation.statut === 'CONFIRMEE' ? styles.statusConfirmed :
                    reservation.statut === 'EN_ATTENTE' ? styles.statusPending :
                    styles.statusCancelled
                  ]}>
                    <Text style={styles.statusText}>{reservation.statut}</Text>
                  </View>
                </View>
                <View style={styles.reservationDetails}>
                  <Text style={styles.reservationDate}>
                    <Ionicons name="calendar-outline" size={16} color="#666" />
                    {' '}{formatDate(reservation.trajet.date)}
                  </Text>
                  <Text style={styles.reservationPlaces}>
                    <Ionicons name="person-outline" size={16} color="#666" />
                    {' '}{reservation.nbPlaces} place(s)
                  </Text>
                </View>
              </View>
            ))}
          </ScrollView>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="bookmark-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>Aucune réservation</Text>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => router.push('/(tabs)/recherche')}
            >
              <Text style={styles.addButtonText}>Rechercher un trajet</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  if (!user) return null;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Image
          source={require('../../assets/cocologo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>Mon Profil</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'profile' && styles.activeTab]}
          onPress={() => setActiveTab('profile')}
        >
          <Ionicons 
            name="person-outline" 
            size={20} 
            color={activeTab === 'profile' ? '#007AFF' : '#666'} 
          />
          <Text style={[styles.tabText, activeTab === 'profile' && styles.activeTabText]}>
            Profil
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'trajets' && styles.activeTab]}
          onPress={() => setActiveTab('trajets')}
        >
          <Ionicons 
            name="map-outline" 
            size={20} 
            color={activeTab === 'trajets' ? '#007AFF' : '#666'} 
          />
          <Text style={[styles.tabText, activeTab === 'trajets' && styles.activeTabText]}>
            Trajets
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'reservations' && styles.activeTab]}
          onPress={() => setActiveTab('reservations')}
        >
          <Ionicons 
            name="bookmark-outline" 
            size={20} 
            color={activeTab === 'reservations' ? '#007AFF' : '#666'} 
          />
          <Text style={[styles.tabText, activeTab === 'reservations' && styles.activeTabText]}>
            Réservations
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'profile' && renderProfileTab()}
        {activeTab === 'trajets' && renderTrajetsTab()}
        {activeTab === 'reservations' && renderReservationsTab()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    marginTop: 25, // 0,5 cm
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  logo: {
    width: 40,
    height: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    textAlign: 'center',
  },
  logoutButton: {
    backgroundColor: '#dc3545',
    padding: 8,
    borderRadius: 8,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#007AFF',
  },
  tabText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#666',
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingBottom: 150, // Marge pour éviter que la barre de navigation cache le contenu
  },
  tabContent: {
    padding: 16,
  },
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 4,
  },
  userType: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  infoSection: {
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoText: {
    fontSize: 16,
    color: '#333',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  voitureCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
  },
  voitureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  voitureInfo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  ratingNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffc107',
    marginRight: 8,
  },
  ratingText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  avisContainer: {
    maxHeight: 200,
  },
  avisCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  avisHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  avisRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avisNote: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginLeft: 4,
  },
  avisDate: {
    fontSize: 12,
    color: '#666',
  },
  avisCommentaire: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
  avisAuteur: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  trajetCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  trajetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  trajetRoute: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  trajetPrix: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#28a745',
  },
  trajetDetails: {
    flexDirection: 'row',
    gap: 16,
  },
  trajetDate: {
    fontSize: 14,
    color: '#666',
  },
  trajetPlaces: {
    fontSize: 14,
    color: '#666',
  },
  reservationCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  reservationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reservationRoute: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusConfirmed: {
    backgroundColor: '#d4edda',
  },
  statusPending: {
    backgroundColor: '#fff3cd',
  },
  statusCancelled: {
    backgroundColor: '#f8d7da',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  reservationDetails: {
    flexDirection: 'row',
    gap: 16,
  },
  reservationDate: {
    fontSize: 14,
    color: '#666',
  },
  reservationPlaces: {
    fontSize: 14,
    color: '#666',
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
    marginBottom: 16,
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
}); 