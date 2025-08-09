import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Modal, FlatList } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

// Liste des villes canadiennes (comme dans la version web)
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

export default function RechercheScreen() {
  const [trajets, setTrajets] = useState([]);
  const [filteredTrajets, setFilteredTrajets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState(null);
  
  // Filtres
  const [departure, setDeparture] = useState('');
  const [destination, setDestination] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [allowBaggage, setAllowBaggage] = useState(false);
  const [allowAnimals, setAllowAnimals] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('earliest');
  
  // Autocomplétion
  const [showDepartureSuggestions, setShowDepartureSuggestions] = useState(false);
  const [showDestinationSuggestions, setShowDestinationSuggestions] = useState(false);
  const [departureSuggestions, setDepartureSuggestions] = useState([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState([]);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [trajetsPerPage] = useState(5);
  
  // Modal
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    checkSessionAndFetchTrajets();
  }, []);

  useEffect(() => {
    filterTrajets();
  }, [searchQuery, trajets, departure, destination, selectedDate, allowBaggage, allowAnimals, selectedFilter]);

  // Autocomplétion pour départ
  useEffect(() => {
    if (departure.trim()) {
      const normalizedSearch = normalizeText(departure);
      const suggestions = canadianCities.filter(city => 
        normalizeText(city).includes(normalizedSearch)
      ).slice(0, 5);
      setDepartureSuggestions(suggestions);
      setShowDepartureSuggestions(suggestions.length > 0);
    } else {
      setShowDepartureSuggestions(false);
      setDepartureSuggestions([]);
    }
  }, [departure]);

  // Autocomplétion pour destination
  useEffect(() => {
    if (destination.trim()) {
      const normalizedSearch = normalizeText(destination);
      const suggestions = canadianCities.filter(city => 
        normalizeText(city).includes(normalizedSearch)
      ).slice(0, 5);
      setDestinationSuggestions(suggestions);
      setShowDestinationSuggestions(suggestions.length > 0);
    } else {
      setShowDestinationSuggestions(false);
      setDestinationSuggestions([]);
    }
  }, [destination]);

  const checkSessionAndFetchTrajets = async () => {
    try {
      const sessionRes = await fetch('http://192.168.1.70:5000/check-session', {
        credentials: 'include',
      });
      const sessionData = await sessionRes.json();
      
      if (!sessionData.isAuthenticated) {
        Alert.alert('Connexion requise', 'Veuillez vous connecter pour voir les trajets');
        return;
      }
      
      setUser(sessionData.user);
      
      const trajetsRes = await fetch('http://192.168.1.70:5000/trajets');
      if (trajetsRes.ok) {
        const data = await trajetsRes.json();
        setTrajets(data);
        setFilteredTrajets(data);
      } else {
        Alert.alert('Erreur', 'Impossible de charger les trajets');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Problème de connexion');
    } finally {
      setLoading(false);
    }
  };

  const filterTrajets = () => {
    let filtered = trajets;

    // Filtre par recherche textuelle (normalisé)
    if (searchQuery.trim()) {
      const normalizedSearch = normalizeText(searchQuery);
      filtered = filtered.filter(trajet => 
        normalizeText(trajet.depart).includes(normalizedSearch) ||
        normalizeText(trajet.destination).includes(normalizedSearch) ||
        normalizeText(trajet.conducteur?.nom || '').includes(normalizedSearch)
      );
    }

    // Filtre par départ (normalisé)
    if (departure.trim()) {
      const normalizedDeparture = normalizeText(departure);
      filtered = filtered.filter(trajet => 
        normalizeText(trajet.depart).includes(normalizedDeparture)
      );
    }

    // Filtre par destination (normalisé)
    if (destination.trim()) {
      const normalizedDestination = normalizeText(destination);
      filtered = filtered.filter(trajet => 
        normalizeText(trajet.destination).includes(normalizedDestination)
      );
    }

    // Filtre par date
    if (selectedDate) {
      const searchDate = new Date(selectedDate);
      filtered = filtered.filter(trajet => {
        const trajetDate = new Date(trajet.date);
        return trajetDate.toDateString() === searchDate.toDateString();
      });
    }

    // Filtre par bagages
    if (allowBaggage) {
      filtered = filtered.filter(trajet => trajet.bagagesAcceptes);
    }

    // Filtre par animaux
    if (allowAnimals) {
      filtered = filtered.filter(trajet => trajet.animauxAcceptes);
    }

    // Tri
    filtered.sort((a, b) => {
      if (selectedFilter === 'earliest') {
        return new Date(a.date) - new Date(b.date);
      } else if (selectedFilter === 'lowestPrice') {
        return a.prix - b.prix;
      }
      return 0;
    });

    setFilteredTrajets(filtered);
    setCurrentPage(1); // Reset à la première page
  };

  const clearFilters = () => {
    setSearchQuery('');
    setDeparture('');
    setDestination('');
    setSelectedDate('');
    setAllowBaggage(false);
    setAllowAnimals(false);
    setSelectedFilter('earliest');
    setShowDepartureSuggestions(false);
    setShowDestinationSuggestions(false);
  };

  const selectDeparture = (city) => {
    setDeparture(city);
    setShowDepartureSuggestions(false);
  };

  const selectDestination = (city) => {
    setDestination(city);
    setShowDestinationSuggestions(false);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPlacesDisponibles = (trajet) => {
    const placesReservees = Array.isArray(trajet.reservations)
      ? trajet.reservations.reduce((total, r) => total + (r.nbPlaces || 0), 0)
      : 0;
    return trajet.places - placesReservees;
  };

  // Pagination
  const indexOfLastTrajet = currentPage * trajetsPerPage;
  const indexOfFirstTrajet = indexOfLastTrajet - trajetsPerPage;
  const currentTrajets = filteredTrajets.slice(indexOfFirstTrajet, indexOfLastTrajet);
  const totalPages = Math.ceil(filteredTrajets.length / trajetsPerPage);

  const goToPage = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const goToPreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const goToNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  const renderSuggestionItem = ({ item, onSelect }) => (
    <TouchableOpacity
      style={styles.suggestionItem}
      onPress={() => onSelect(item)}
    >
      <Ionicons name="location-outline" size={16} color="#666" />
      <Text style={styles.suggestionText}>{item}</Text>
    </TouchableOpacity>
  );

  // Données pour la FlatList des filtres
  const filterSections = [
    {
      id: 'departure',
      type: 'departure',
      title: 'Départ',
      placeholder: 'Ville de départ'
    },
    {
      id: 'destination',
      type: 'destination',
      title: 'Destination',
      placeholder: 'Ville de destination'
    },
    {
      id: 'date',
      type: 'date',
      title: 'Date de départ',
      placeholder: 'YYYY-MM-DD'
    },
    {
      id: 'sort',
      type: 'sort',
      title: 'Trier par'
    },
    {
      id: 'equipment',
      type: 'equipment',
      title: 'Équipements'
    }
  ];

  const renderFilterSection = ({ item }) => {
    switch (item.type) {
      case 'departure':
        return (
          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>{item.title}</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.filterInput}
                placeholder={item.placeholder}
                value={departure}
                onChangeText={setDeparture}
                onFocus={() => setShowDepartureSuggestions(true)}
              />
              {showDepartureSuggestions && (
                <View style={styles.suggestionsContainer}>
                  <FlatList
                    data={departureSuggestions}
                    keyExtractor={(item) => item}
                    renderItem={({ item }) => renderSuggestionItem({ item, onSelect: selectDeparture })}
                    style={styles.suggestionsList}
                    nestedScrollEnabled={true}
                  />
                </View>
              )}
            </View>
          </View>
        );

      case 'destination':
        return (
          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>{item.title}</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.filterInput}
                placeholder={item.placeholder}
                value={destination}
                onChangeText={setDestination}
                onFocus={() => setShowDestinationSuggestions(true)}
              />
              {showDestinationSuggestions && (
                <View style={styles.suggestionsContainer}>
                  <FlatList
                    data={destinationSuggestions}
                    keyExtractor={(item) => item}
                    renderItem={({ item }) => renderSuggestionItem({ item, onSelect: selectDestination })}
                    style={styles.suggestionsList}
                    nestedScrollEnabled={true}
                  />
                </View>
              )}
            </View>
          </View>
        );

      case 'date':
        return (
          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>{item.title}</Text>
            <TextInput
              style={styles.filterInput}
              placeholder={item.placeholder}
              value={selectedDate}
              onChangeText={setSelectedDate}
            />
          </View>
        );

      case 'sort':
        return (
          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>{item.title}</Text>
            <View style={styles.radioContainer}>
              <TouchableOpacity
                style={styles.radioOption}
                onPress={() => setSelectedFilter('earliest')}
              >
                <View style={[styles.radioButton, selectedFilter === 'earliest' && styles.radioButtonSelected]} />
                <Text style={styles.radioLabel}>Départ le plus tôt</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.radioOption}
                onPress={() => setSelectedFilter('lowestPrice')}
              >
                <View style={[styles.radioButton, selectedFilter === 'lowestPrice' && styles.radioButtonSelected]} />
                <Text style={styles.radioLabel}>Prix le plus bas</Text>
              </TouchableOpacity>
            </View>
          </View>
        );

      case 'equipment':
        return (
          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>{item.title}</Text>
            <TouchableOpacity
              style={styles.checkboxOption}
              onPress={() => setAllowBaggage(!allowBaggage)}
            >
              <View style={[styles.checkbox, allowBaggage && styles.checkboxSelected]} />
              <Ionicons name="briefcase-outline" size={20} color="#666" />
              <Text style={styles.checkboxLabel}>Bagages autorisés</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.checkboxOption}
              onPress={() => setAllowAnimals(!allowAnimals)}
            >
              <View style={[styles.checkbox, allowAnimals && styles.checkboxSelected]} />
              <Ionicons name="paw-outline" size={20} color="#666" />
              <Text style={styles.checkboxLabel}>Animaux autorisés</Text>
            </TouchableOpacity>
          </View>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Chargement des trajets...</Text>
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
        <Text style={styles.title}>Rechercher un trajet</Text>
      </View>

      {/* Barre de recherche principale */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher par ville, destination..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
              <Ionicons name="close-circle" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>
        
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setShowFilters(true)}
        >
          <Ionicons name="options" size={20} color="#fff" />
          <Text style={styles.filterButtonText}>Filtres</Text>
        </TouchableOpacity>
      </View>

      {/* Informations sur les résultats */}
      <View style={styles.resultsInfo}>
        <Text style={styles.resultsText}>
          {filteredTrajets.length} trajet{filteredTrajets.length > 1 ? 's' : ''} trouvé{filteredTrajets.length > 1 ? 's' : ''}
          {totalPages > 1 && (
            <Text> (page {currentPage} sur {totalPages})</Text>
          )}
        </Text>
      </View>

      <ScrollView style={styles.trajetsContainer}>
        {currentTrajets.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>
              {searchQuery || departure || destination ? 'Aucun trajet trouvé pour vos critères' : 'Aucun trajet disponible pour le moment'}
            </Text>
            {user && (
              <TouchableOpacity style={styles.publishButton}>
                <Text style={styles.publishButtonText}>Publier un trajet ?</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <>
            {currentTrajets.map((trajet) => {
              const placesDisponibles = getPlacesDisponibles(trajet);
              const isComplet = placesDisponibles <= 0;

              return (
                <View key={trajet.id} style={styles.trajetCard}>
                  <View style={styles.trajetHeader}>
                    <Text style={styles.trajetRoute}>
                      {trajet.depart} → {trajet.destination}
                    </Text>
                    <Text style={styles.trajetPrix}>{trajet.prix} $CA</Text>
                  </View>

                  <View style={styles.trajetInfo}>
                    <View style={styles.infoRow}>
                      <Ionicons name="calendar-outline" size={16} color="#666" />
                      <Text style={styles.infoText}>
                        Départ: {formatDate(trajet.date)}
                      </Text>
                    </View>

                    <View style={styles.infoRow}>
                      <Ionicons name="people-outline" size={16} color="#666" />
                      <Text style={styles.infoText}>
                        {isComplet ? (
                          <Text style={styles.completText}>Complet</Text>
                        ) : (
                          `${placesDisponibles} libre${placesDisponibles > 1 ? 's' : ''} / ${trajet.places}`
                        )}
                      </Text>
                    </View>

                    <View style={styles.infoRow}>
                      <Ionicons name="person-outline" size={16} color="#666" />
                      <Text style={styles.infoText}>
                        Conducteur: {trajet.conducteur?.nom || 'Anonyme'}
                      </Text>
                    </View>

                    <View style={styles.optionsRow}>
                      {trajet.animauxAcceptes && (
                        <View style={styles.option}>
                          <Ionicons name="paw-outline" size={16} color="#666" />
                          <Text style={styles.optionText}>Animaux</Text>
                        </View>
                      )}
                      {trajet.bagagesAcceptes && (
                        <View style={styles.option}>
                          <Ionicons name="briefcase-outline" size={16} color="#666" />
                          <Text style={styles.optionText}>Bagages</Text>
                        </View>
                      )}
                    </View>
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.actionButton,
                      isComplet && styles.disabledButton
                    ]}
                    disabled={isComplet}
                    onPress={() => router.push(`/trajet/${trajet.id}`)}
                  >
                    <Text style={[
                      styles.actionButtonText,
                      isComplet && styles.disabledButtonText
                    ]}>
                      {isComplet ? 'Complet' : 'Voir détails'}
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })}

            {/* Pagination */}
            {totalPages > 1 && (
              <View style={styles.paginationContainer}>
                <TouchableOpacity
                  onPress={goToPreviousPage}
                  disabled={currentPage === 1}
                  style={[styles.paginationButton, currentPage === 1 && styles.disabledPaginationButton]}
                >
                  <Ionicons name="chevron-back" size={20} color={currentPage === 1 ? "#ccc" : "#007AFF"} />
                </TouchableOpacity>
                
                <View style={styles.pageNumbers}>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNumber => (
                    <TouchableOpacity
                      key={pageNumber}
                      onPress={() => goToPage(pageNumber)}
                      style={[
                        styles.pageButton,
                        pageNumber === currentPage && styles.activePageButton
                      ]}
                    >
                      <Text style={[
                        styles.pageButtonText,
                        pageNumber === currentPage && styles.activePageButtonText
                      ]}>
                        {pageNumber}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                
                <TouchableOpacity
                  onPress={goToNextPage}
                  disabled={currentPage === totalPages}
                  style={[styles.paginationButton, currentPage === totalPages && styles.disabledPaginationButton]}
                >
                  <Ionicons name="chevron-forward" size={20} color={currentPage === totalPages ? "#ccc" : "#007AFF"} />
                </TouchableOpacity>
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* Modal des filtres */}
      <Modal
        visible={showFilters}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFilters(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filtres de recherche</Text>
              <TouchableOpacity onPress={() => setShowFilters(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={filterSections}
              keyExtractor={(item) => item.id}
              renderItem={renderFilterSection}
              style={styles.filtersContainer}
              showsVerticalScrollIndicator={false}
            />

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.clearFiltersButton} onPress={clearFilters}>
                <Text style={styles.clearFiltersText}>Effacer les filtres</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.applyFiltersButton}
                onPress={() => setShowFilters(false)}
              >
                <Text style={styles.applyFiltersText}>Appliquer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  searchContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    gap: 12,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  clearButton: {
    marginLeft: 8,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  filterButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  resultsInfo: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  resultsText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  trajetsContainer: {
    flex: 1,
    padding: 16,
    paddingBottom: 150, // Marge pour éviter que la barre de navigation cache le contenu
  },
  loadingText: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 50,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 20,
  },
  publishButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  publishButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  trajetCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  trajetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  trajetRoute: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  trajetPrix: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  trajetInfo: {
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  completText: {
    color: '#FF3B30',
    fontWeight: 'bold',
  },
  optionsRow: {
    flexDirection: 'row',
    marginTop: 8,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  optionText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  actionButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButtonText: {
    color: '#999',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    gap: 12,
  },
  paginationButton: {
    padding: 8,
  },
  disabledPaginationButton: {
    opacity: 0.5,
  },
  pageNumbers: {
    flexDirection: 'row',
    gap: 8,
  },
  pageButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activePageButton: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  pageButtonText: {
    fontSize: 14,
    color: '#666',
  },
  activePageButtonText: {
    color: '#fff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  filtersContainer: {
    padding: 20,
    maxHeight: 400,
  },
  filterSection: {
    marginBottom: 24,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  inputContainer: {
    position: 'relative',
  },
  filterInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
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
  suggestionsList: {
    maxHeight: 150,
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
  radioContainer: {
    gap: 12,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  radioButtonSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#007AFF',
  },
  radioLabel: {
    fontSize: 16,
    color: '#333',
  },
  checkboxOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 4,
  },
  checkboxSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#333',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    gap: 12,
  },
  clearFiltersButton: {
    flex: 1,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    alignItems: 'center',
  },
  clearFiltersText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  applyFiltersButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    alignItems: 'center',
  },
  applyFiltersText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 