import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function HomeScreen() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

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
      <View style={styles.header}>
        <Image
          source={require('../../assets/cocologo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>Bienvenue sur Cocovoit</Text>
        {user && (
          <View style={styles.userInfo}>
            <Text style={styles.welcomeText}>Bonjour, {user.nom}</Text>
            <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
              <Ionicons name="log-out-outline" size={20} color="#fff" />
              <Text style={styles.logoutText}>Déconnexion</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <Text style={styles.subtitle}>Que souhaitez-vous faire ?</Text>
        
        <View style={styles.buttonsContainer}>
          <TouchableOpacity style={styles.mainButton} onPress={handleConducteur}>
            <View style={styles.buttonContent}>
              <Ionicons name="car-sport" size={48} color="#007AFF" />
              <Text style={styles.buttonTitle}>Je suis conducteur</Text>
              <Text style={styles.buttonDescription}>
                Proposer un trajet et gagner de l'argent
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.mainButton} onPress={handlePassager}>
            <View style={styles.buttonContent}>
              <Ionicons name="people" size={48} color="#28a745" />
              <Text style={styles.buttonTitle}>Je suis passager</Text>
              <Text style={styles.buttonDescription}>
                Trouver un trajet et voyager à moindre coût
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>À propos de Cocovoit</Text>
          <Text style={styles.infoText}>
            Cocovoit est une plateforme de covoiturage qui connecte conducteurs et passagers pour des trajets économiques et écologiques.
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
  },
  welcomeText: {
    fontSize: 16,
    color: '#666',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dc3545',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  logoutText: {
    color: '#fff',
    fontSize: 14,
    marginLeft: 4,
  },
  content: {
    flex: 1,
    padding: 20,
    paddingBottom: 150, // Marge pour éviter que la barre de navigation cache le contenu
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 30,
  },
  buttonsContainer: {
    gap: 20,
    marginBottom: 30,
  },
  mainButton: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonContent: {
    alignItems: 'center',
  },
  buttonTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 12,
    marginBottom: 8,
  },
  buttonDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  infoSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginTop: 20,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  loadingText: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 50,
    color: '#666',
  },
});
