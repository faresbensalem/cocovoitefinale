import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function VoitureScreen() {
  const [voiture, setVoiture] = useState({
    marque: '',
    modele: '',
    couleur: '',
    immatriculation: '',
  });
  const [voitures, setVoitures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch('http://192.168.1.70:5000/check-session', {
        credentials: 'include'
      });

      if (!res.ok) {
        throw new Error('Erreur de connexion au serveur');
      }

      const data = await res.json();
      
      if (data.isAuthenticated && data.user) {
        setUser(data.user);
        await loadVoitures(data.user.id);
      } else {
        router.replace('/(tabs)/connexion');
      }
    } catch (error) {
      console.error('Erreur:', error);
      Alert.alert('Erreur', 'Impossible de charger les données');
    } finally {
      setLoading(false);
    }
  };

  const loadVoitures = async (userId) => {
    try {
      const res = await fetch(`http://192.168.1.70:5000/voiture/${userId}`, {
        credentials: 'include'
      });

      if (!res.ok) {
        throw new Error('Erreur lors du chargement des voitures');
      }

      const data = await res.json();
      setVoitures(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Erreur:', error);
      Alert.alert('Erreur', 'Impossible de charger les voitures');
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!voiture.marque.trim() || !voiture.modele.trim() || !voiture.couleur.trim() || !voiture.immatriculation.trim()) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch('http://192.168.1.70:5000/voiture', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(voiture)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de l\'ajout de la voiture');
      }

      setVoitures([data, ...voitures]);
      setVoiture({ marque: '', modele: '', couleur: '', immatriculation: '' });
      Alert.alert('Succès', 'Voiture ajoutée avec succès !');
    } catch (error) {
      console.error('Erreur:', error);
      Alert.alert('Erreur', error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (voitureId) => {
    Alert.alert(
      'Supprimer la voiture',
      'Êtes-vous sûr de vouloir supprimer cette voiture ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              const res = await fetch(`http://192.168.1.70:5000/voiture/${voitureId}`, {
                method: 'DELETE',
                credentials: 'include'
              });

              if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || 'Erreur lors de la suppression');
              }

              setVoitures(voitures.filter(v => v.id !== voitureId));
              Alert.alert('Succès', 'Voiture supprimée avec succès !');
            } catch (error) {
              console.error('Erreur:', error);
              Alert.alert('Erreur', error.message);
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Ma Voiture</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Formulaire d'ajout */}
        <View style={styles.formCard}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="add-circle-outline" size={20} color="#007AFF" />
            {' '}Ajouter une voiture
          </Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Marque</Text>
            <TextInput
              style={styles.input}
              value={voiture.marque}
              onChangeText={(text) => setVoiture({ ...voiture, marque: text })}
              placeholder="Ex: Renault"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Modèle</Text>
            <TextInput
              style={styles.input}
              value={voiture.modele}
              onChangeText={(text) => setVoiture({ ...voiture, modele: text })}
              placeholder="Ex: Clio"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Couleur</Text>
            <TextInput
              style={styles.input}
              value={voiture.couleur}
              onChangeText={(text) => setVoiture({ ...voiture, couleur: text })}
              placeholder="Ex: Blanc"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Immatriculation</Text>
            <TextInput
              style={styles.input}
              value={voiture.immatriculation}
              onChangeText={(text) => setVoiture({ ...voiture, immatriculation: text })}
              placeholder="Ex: AB-123-CD"
              placeholderTextColor="#999"
              autoCapitalize="characters"
            />
          </View>

          <TouchableOpacity
            style={[styles.submitButton, submitting && styles.disabledButton]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>Ajouter la voiture</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Liste des voitures */}
        <View style={styles.listCard}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="car-sport-outline" size={20} color="#007AFF" />
            {' '}Mes voitures ({voitures.length})
          </Text>

          {voitures.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="car-outline" size={48} color="#ccc" />
              <Text style={styles.emptyText}>Aucune voiture enregistrée</Text>
              <Text style={styles.emptySubtext}>Ajoutez votre première voiture ci-dessus</Text>
            </View>
          ) : (
            <View style={styles.voituresList}>
              {voitures.map((v) => (
                <View key={v.id} style={styles.voitureCard}>
                  <View style={styles.voitureInfo}>
                    <Text style={styles.voitureTitle}>{v.marque} {v.modele}</Text>
                    <Text style={styles.voitureDetails}>Couleur: {v.couleur}</Text>
                    <Text style={styles.voitureDetails}>Immatriculation: {v.immatriculation}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleDelete(v.id)}
                    style={styles.deleteButton}
                  >
                    <Ionicons name="trash-outline" size={20} color="#dc3545" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 32,
  },
  content: {
    flex: 1,
    padding: 16,
    paddingBottom: 150, // Marge pour éviter que la barre de navigation cache le contenu
  },
  formCard: {
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
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#fff',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  listCard: {
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
  emptyState: {
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  voituresList: {
    gap: 12,
  },
  voitureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
  },
  voitureInfo: {
    flex: 1,
  },
  voitureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  voitureDetails: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  deleteButton: {
    padding: 8,
  },
}); 