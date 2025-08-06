import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Switch, FlatList } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

// Liste des villes canadiennes pour l'autocomplétion
const canadianCities = [
  "Toronto", "Montréal", "Vancouver", "Calgary", "Ottawa", "Edmonton", 
  "Québec", "Winnipeg", "Halifax", "Saskatoon", "Regina", "St. John's", 
  "Victoria", "Gatineau", "Sherbrooke", "Windsor", "Kelowna", "Trois-Rivières", 
  "Saguenay", "Barrie", "Moncton", "Saint John", "Thunder Bay", "Kingston",
  "London", "Hamilton", "Kitchener", "Brampton", "Mississauga", "Markham"
];

// Fonction pour normaliser le texte (enlever accents et espaces)
const normalizeText = (text) => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Enlever les accents
    .replace(/\s+/g, '') // Enlever les espaces
    .trim();
};

export default function PublierScreen() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [userVehicles, setUserVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [isLoadingVehicles, setIsLoadingVehicles] = useState(true);
  
  // État du formulaire
  const [formData, setFormData] = useState({
    depart: '',
    adresseDepart: '',
    destination: '',
    adresseArrivee: '',
    date: null,
    places: 1,
    prix: 0,
    animauxAcceptes: false,
    bagagesAcceptes: true,
  });

  // Autocomplétion
  const [showDepartureSuggestions, setShowDepartureSuggestions] = useState(false);
  const [showDestinationSuggestions, setShowDestinationSuggestions] = useState(false);
  const [departureSuggestions, setDepartureSuggestions] = useState([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState([]);

  useEffect(() => {
    checkSession();
  }, []);

  // Autocomplétion pour départ
  useEffect(() => {
    if (formData.depart.trim()) {
      const normalizedSearch = normalizeText(formData.depart);
      const suggestions = canadianCities.filter(city => 
        normalizeText(city).includes(normalizedSearch)
      ).slice(0, 5);
      setDepartureSuggestions(suggestions);
      setShowDepartureSuggestions(suggestions.length > 0);
    } else {
      setShowDepartureSuggestions(false);
      setDepartureSuggestions([]);
    }
  }, [formData.depart]);

  // Autocomplétion pour destination
  useEffect(() => {
    if (formData.destination.trim()) {
      const normalizedSearch = normalizeText(formData.destination);
      const suggestions = canadianCities.filter(city => 
        normalizeText(city).includes(normalizedSearch)
      ).slice(0, 5);
      setDestinationSuggestions(suggestions);
      setShowDestinationSuggestions(suggestions.length > 0);
    } else {
      setShowDestinationSuggestions(false);
      setDestinationSuggestions([]);
    }
  }, [formData.destination]);

  const checkSession = async () => {
    try {
      const res = await fetch('http://192.168.1.70:5000/check-session', {
        credentials: 'include',
      });
      const data = await res.json();
      
      if (!data.isAuthenticated) {
        Alert.alert('Connexion requise', 'Vous devez être connecté pour publier un trajet');
        router.replace('/(tabs)/connexion');
        return;
      }
      
      setUser(data.user);
      await fetchUserVehicles(data.user.id);
    } catch (error) {
      console.error('Erreur de vérification de session:', error);
      Alert.alert('Erreur', 'Problème de connexion');
      router.replace('/(tabs)/connexion');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserVehicles = async (userId) => {
    try {
      setIsLoadingVehicles(true);
      const res = await fetch(`http://192.168.1.70:5000/voiture/${userId}`, {
        credentials: 'include'
      });

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setUserVehicles(data);
        } else {
          setUserVehicles([]);
        }
      } else {
        setUserVehicles([]);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des voitures:', error);
      setUserVehicles([]);
    } finally {
      setIsLoadingVehicles(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const selectDeparture = (city) => {
    setFormData(prev => ({ 
      ...prev, 
      depart: city,
      adresseDepart: city
    }));
    setShowDepartureSuggestions(false);
  };

  const selectDestination = (city) => {
    setFormData(prev => ({ 
      ...prev, 
      destination: city,
      adresseArrivee: city
    }));
    setShowDestinationSuggestions(false);
  };

  const validateForm = () => {
    if (!formData.depart.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir une ville de départ');
      return false;
    }
    if (!formData.destination.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir une destination');
      return false;
    }
    if (!formData.date) {
      Alert.alert('Erreur', 'Veuillez sélectionner une date de départ');
      return false;
    }
    if (formData.places < 1) {
      Alert.alert('Erreur', 'Veuillez saisir un nombre de places valide');
      return false;
    }
    if (formData.prix <= 0) {
      Alert.alert('Erreur', 'Veuillez saisir un prix valide');
      return false;
    }
    if (!selectedVehicle) {
      Alert.alert('Erreur', 'Veuillez sélectionner une voiture');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const trajetData = {
        depart: formData.depart,
        adresseDepart: formData.adresseDepart,
        destination: formData.destination,
        adresseArrivee: formData.adresseArrivee,
        date: formData.date.toISOString(),
        places: formData.places,
        prix: formData.prix,
        animauxAcceptes: formData.animauxAcceptes,
        bagagesAcceptes: formData.bagagesAcceptes,
        conducteurId: user.id,
        voitureId: selectedVehicle,
      };

      const response = await fetch('http://192.168.1.70:5000/trajets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(trajetData),
      });

      const result = await response.json();
      
      if (response.ok) {
        Alert.alert(
          'Succès !', 
          'Votre trajet a été publié avec succès !',
          [
            {
              text: 'OK',
              onPress: () => {
                // Reset du formulaire
                setFormData({
                  depart: '',
                  adresseDepart: '',
                  destination: '',
                  adresseArrivee: '',
                  date: null,
                  places: 1,
                  prix: 0,
                  animauxAcceptes: false,
                  bagagesAcceptes: true,
                });
                setSelectedVehicle(null);
              }
            }
          ]
        );
      } else {
        Alert.alert('Erreur', result.error || 'Erreur lors de la publication du trajet');
      }
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
      Alert.alert('Erreur', 'Problème de connexion au serveur');
    } finally {
      setSubmitting(false);
    }
  };

  const renderVehicleItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.vehicleItem,
        selectedVehicle === item.id && styles.vehicleItemSelected
      ]}
      onPress={() => setSelectedVehicle(item.id)}
    >
      <View style={styles.vehicleContent}>
        <View style={[
          styles.vehicleIcon,
          selectedVehicle === item.id && styles.vehicleIconSelected
        ]}>
          <Ionicons 
            name="car" 
            size={24} 
            color={selectedVehicle === item.id ? '#007AFF' : '#666'} 
          />
        </View>
        <View style={styles.vehicleInfo}>
          <Text style={styles.vehicleTitle}>
            {item.marque} {item.modele}
          </Text>
          <Text style={styles.vehicleSubtitle}>
            {item.couleur} • {item.immatriculation}
          </Text>
        </View>
        {selectedVehicle === item.id && (
          <View style={styles.checkIcon}>
            <Ionicons name="checkmark-circle" size={24} color="#007AFF" />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

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
        <Text style={styles.title}>Publier un trajet</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.formContainer}>
          {/* Itinéraire */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Itinéraire</Text>
            
            {/* Départ */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Ville de départ *</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: Montréal"
                  value={formData.depart}
                  onChangeText={(value) => handleInputChange('depart', value)}
                />
                {showDepartureSuggestions && (
                  <View style={styles.suggestionsContainer}>
                    {departureSuggestions.map((city, index) => (
                      <TouchableOpacity
                        key={index}
                        style={styles.suggestionItem}
                        onPress={() => selectDeparture(city)}
                      >
                        <Ionicons name="location-outline" size={16} color="#666" />
                        <Text style={styles.suggestionText}>{city}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            </View>

            {/* Destination */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Destination *</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: Toronto"
                  value={formData.destination}
                  onChangeText={(value) => handleInputChange('destination', value)}
                />
                {showDestinationSuggestions && (
                  <View style={styles.suggestionsContainer}>
                    {destinationSuggestions.map((city, index) => (
                      <TouchableOpacity
                        key={index}
                        style={styles.suggestionItem}
                        onPress={() => selectDestination(city)}
                      >
                        <Ionicons name="location-outline" size={16} color="#666" />
                        <Text style={styles.suggestionText}>{city}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* Détails du trajet */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Détails du trajet</Text>
            
            {/* Date et Heure */}
            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                <Text style={styles.label}>Date de départ *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="YYYY-MM-DD"
                  value={formData.date ? formData.date.toISOString().split('T')[0] : ''}
                  onChangeText={(value) => {
                    const date = new Date(value);
                    if (!isNaN(date.getTime())) {
                      handleInputChange('date', date);
                    }
                  }}
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1, marginLeft: 10 }]}>
                <Text style={styles.label}>Heure de départ *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="HH:MM"
                  onChangeText={(value) => {
                    if (formData.date) {
                      const [hours, minutes] = value.split(':');
                      const newDate = new Date(formData.date);
                      newDate.setHours(parseInt(hours) || 0, parseInt(minutes) || 0);
                      handleInputChange('date', newDate);
                    }
                  }}
                />
              </View>
            </View>

            {/* Places et Prix */}
            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                <Text style={styles.label}>Nombre de places *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="1"
                  value={formData.places.toString()}
                  onChangeText={(value) => handleInputChange('places', parseInt(value) || 1)}
                  keyboardType="numeric"
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1, marginLeft: 10 }]}>
                <Text style={styles.label}>Prix par place ($) *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="25"
                  value={formData.prix.toString()}
                  onChangeText={(value) => handleInputChange('prix', parseFloat(value) || 0)}
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>

          {/* Voiture et options */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Voiture et options</Text>
            
            {/* Sélection de la voiture */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Sélectionnez votre voiture *</Text>
              {isLoadingVehicles ? (
                <View style={styles.loadingContainer}>
                  <Text style={styles.loadingText}>Chargement de vos voitures...</Text>
                </View>
              ) : userVehicles.length === 0 ? (
                <View style={styles.noVehicleContainer}>
                  <Ionicons name="car" size={48} color="#ccc" />
                  <Text style={styles.noVehicleText}>Vous n'avez pas encore ajouté de voiture</Text>
                  <TouchableOpacity style={styles.addVehicleButton}>
                    <Text style={styles.addVehicleButtonText}>Ajouter une voiture</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <FlatList
                  data={userVehicles}
                  renderItem={renderVehicleItem}
                  keyExtractor={(item) => item.id.toString()}
                  scrollEnabled={false}
                />
              )}
            </View>

            {/* Options */}
            <View style={styles.optionsContainer}>
              <Text style={styles.optionsTitle}>Options du trajet</Text>
              
              <View style={styles.optionRow}>
                <View style={styles.optionInfo}>
                  <Ionicons name="briefcase-outline" size={20} color="#666" />
                  <Text style={styles.optionText}>Bagages autorisés</Text>
                </View>
                <Switch
                  value={formData.bagagesAcceptes}
                  onValueChange={(value) => handleInputChange('bagagesAcceptes', value)}
                  trackColor={{ false: '#e0e0e0', true: '#007AFF' }}
                  thumbColor={formData.bagagesAcceptes ? '#fff' : '#f4f3f4'}
                />
              </View>

              <View style={styles.optionRow}>
                <View style={styles.optionInfo}>
                  <Ionicons name="paw-outline" size={20} color="#666" />
                  <Text style={styles.optionText}>Animaux autorisés</Text>
                </View>
                <Switch
                  value={formData.animauxAcceptes}
                  onValueChange={(value) => handleInputChange('animauxAcceptes', value)}
                  trackColor={{ false: '#e0e0e0', true: '#007AFF' }}
                  thumbColor={formData.animauxAcceptes ? '#fff' : '#f4f3f4'}
                />
              </View>
            </View>
          </View>

          {/* Bouton de soumission */}
          <TouchableOpacity
            style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <Text style={styles.submitButtonText}>Publication en cours...</Text>
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={24} color="#fff" />
                <Text style={styles.submitButtonText}>Publier le trajet</Text>
              </>
            )}
          </TouchableOpacity>
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
  header: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    flex: 1,
  },
  formContainer: {
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  inputContainer: {
    position: 'relative',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  suggestionsContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    maxHeight: 150,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    gap: 8,
  },
  suggestionText: {
    fontSize: 16,
    color: '#333',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 20,
  },
  noVehicleContainer: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  noVehicleText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 15,
  },
  addVehicleButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addVehicleButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  vehicleItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  vehicleItemSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#f0f8ff',
  },
  vehicleContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vehicleIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  vehicleIconSelected: {
    backgroundColor: '#e3f2fd',
  },
  vehicleInfo: {
    flex: 1,
  },
  vehicleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  vehicleSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  checkIcon: {
    marginLeft: 8,
  },
  optionsContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginTop: 20,
  },
  optionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  optionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  optionText: {
    fontSize: 16,
    color: '#333',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#28a745',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  loadingText: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 50,
    color: '#666',
  },
}); 