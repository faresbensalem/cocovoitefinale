import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';

type Trajet = {
  id: string;
  depart: string;
  adresseDepart: string;
  destination: string;
  adresseArrivee: string;
  date: string;
  places: number;
  prix: number;
  animauxAcceptes: boolean;
  bagagesAcceptes: boolean;
  conducteurId: string;
  conducteur?: { id: string; nom: string; email: string };
  reservations?: Array<{ id: string; nbPlaces: number }>; 
};

export default function TrajetDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [trajet, setTrajet] = useState<Trajet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  // Réservation
  const [nbPlaces, setNbPlaces] = useState<number>(1);
  const [showPayment, setShowPayment] = useState<boolean>(false);
  const [processing, setProcessing] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [paymentInfo, setPaymentInfo] = useState({
    cardName: '',
    cardNumber: '',
    expiry: '',
    cvc: '',
  });

  useEffect(() => {
    let isMounted = true;
    async function fetchTrajet() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`http://192.168.1.70:5000/trajets/${id}`);
        if (!res.ok) {
          throw new Error('Impossible de charger le trajet');
        }
        const data = await res.json();
        if (isMounted) setTrajet(data);
      } catch (e: any) {
        if (isMounted) setError(e?.message || 'Erreur inconnue');
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    async function checkSession() {
      try {
        const res = await fetch('http://192.168.1.70:5000/check-session', {
          credentials: 'include',
        });
        const data = await res.json();
        if (isMounted && data?.isAuthenticated) {
          setUser(data.user);
        } else if (isMounted) {
          setUser(null);
        }
      } catch {
        if (isMounted) setUser(null);
      }
    }
    if (id) fetchTrajet();
    checkSession();
    return () => {
      isMounted = false;
    };
  }, [id]);

  const placesDisponibles = useMemo(() => {
    if (!trajet) return 0;
    const reservees = (trajet.reservations || []).reduce((sum, r) => sum + (r.nbPlaces || 0), 0);
    return Math.max(0, trajet.places - reservees);
  }, [trajet]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    try {
      return date.toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return date.toString();
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Chargement du trajet…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={20} color="#fff" />
          <Text style={styles.backButtonText}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!trajet) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Trajet introuvable</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={20} color="#fff" />
          <Text style={styles.backButtonText}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Paiement réussi
  if (success) {
    return (
      <View style={styles.centered}>
        <View style={styles.successCircle}><Text style={styles.successCheck}>✓</Text></View>
        <Text style={styles.successTitle}>Réservation confirmée !</Text>
        <Text style={styles.successText}>Vous allez être redirigé…</Text>
      </View>
    );
  }

  // Affichage du formulaire de paiement
  if (showPayment && trajet) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 24 }}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => setShowPayment(false)} style={styles.iconButton}>
            <Ionicons name="arrow-back" size={22} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Paiement</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Informations de paiement</Text>
          <View style={styles.infoRow}>
            <Ionicons name="card-outline" size={18} color="#666" />
            <Text style={styles.infoText}>Montant: {(trajet.prix * nbPlaces).toFixed(2)} $CA</Text>
          </View>

          <View style={styles.hintBox}>
            <Text style={styles.hintStrong}>Paiement factice:</Text>
            <Text style={styles.hintText}>• Carte: 4242 4242 4242 4242</Text>
            <Text style={styles.hintText}>• Exp: 12/25</Text>
            <Text style={styles.hintText}>• CVC: 123</Text>
          </View>

          <View style={styles.formField}>
            <Text style={styles.label}>Nom sur la carte</Text>
            <TextInput
              value={paymentInfo.cardName}
              onChangeText={(v) => setPaymentInfo({ ...paymentInfo, cardName: v })}
              placeholder="John Doe"
              style={styles.input}
            />
          </View>
          <View style={styles.formField}>
            <Text style={styles.label}>Numéro de carte</Text>
            <TextInput
              value={paymentInfo.cardNumber}
              onChangeText={(v) => setPaymentInfo({ ...paymentInfo, cardNumber: v })}
              placeholder="4242 4242 4242 4242"
              keyboardType="number-pad"
              style={styles.input}
            />
          </View>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={[styles.formField, { flex: 1 }] }>
              <Text style={styles.label}>Expiration (MM/AA)</Text>
              <TextInput
                value={paymentInfo.expiry}
                onChangeText={(v) => setPaymentInfo({ ...paymentInfo, expiry: v })}
                placeholder="12/25"
                style={styles.input}
              />
            </View>
            <View style={[styles.formField, { flex: 1 }] }>
              <Text style={styles.label}>CVC</Text>
              <TextInput
                value={paymentInfo.cvc}
                onChangeText={(v) => setPaymentInfo({ ...paymentInfo, cvc: v })}
                placeholder="123"
                keyboardType="number-pad"
                style={styles.input}
              />
            </View>
          </View>

          {!!error && (
            <Text style={styles.errorText}>{error}</Text>
          )}

          <TouchableOpacity
            style={[styles.primaryButton, processing && styles.disabledButton]}
            disabled={processing}
            onPress={async () => {
              setError(null);
              setProcessing(true);
              try {
                // Vérifications simples
                if (!user) {
                  throw new Error('Veuillez vous connecter');
                }
                if (!trajet) throw new Error('Trajet invalide');
                if (trajet.conducteurId === user.id) {
                  throw new Error("Vous ne pouvez pas réserver votre propre trajet");
                }
                if (nbPlaces < 1 || nbPlaces > placesDisponibles) {
                  throw new Error('Nombre de places indisponible');
                }

                // Créer la réservation
                const resReservation = await fetch('http://192.168.1.70:5000/reservations', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  credentials: 'include',
                  body: JSON.stringify({ trajetId: trajet.id, nbPlaces }),
                });
                if (!resReservation.ok) {
                  const errData = await resReservation.json().catch(() => ({}));
                  throw new Error(errData.error || 'Échec de la réservation');
                }
                const reservation = await resReservation.json();

                // Créer le paiement
                const resPaiement = await fetch('http://192.168.1.70:5000/paiements', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  credentials: 'include',
                  body: JSON.stringify({
                    reservationId: reservation.id,
                    montant: trajet.prix * nbPlaces,
                    fournisseur: 'STRIPE',
                    cardInfo: paymentInfo,
                  }),
                });
                if (!resPaiement.ok) {
                  const errData = await resPaiement.json().catch(() => ({}));
                  throw new Error(errData.error || 'Échec du paiement');
                }

                setSuccess(true);
                setTimeout(() => {
                  router.replace('/(tabs)');
                }, 1600);
              } catch (e: any) {
                setError(e?.message || 'Erreur lors du paiement');
              } finally {
                setProcessing(false);
              }
            }}
          >
            {processing ? (
              <>
                <ActivityIndicator color="#fff" />
                <Text style={[styles.primaryButtonText, { marginLeft: 8 }]}>Traitement…</Text>
              </>
            ) : (
              <>
                <Ionicons name="card-outline" size={18} color="#fff" />
                <Text style={[styles.primaryButtonText, { marginLeft: 8 }]}>Payer {(trajet.prix * nbPlaces).toFixed(2)} $CA</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 32 }}>
      {/* Header avec bouton retour */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
          <Ionicons name="arrow-back" size={22} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Détails du trajet</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Carte principale */}
      <View style={styles.card}>
        <View style={styles.routeRow}>
          <Ionicons name="navigate" size={18} color="#10B981" />
          <Text style={styles.routeText}>
            {trajet.depart} → {trajet.destination}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="time-outline" size={18} color="#666" />
          <Text style={styles.infoText}>Départ: {formatDate(trajet.date)}</Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={18} color="#10B981" />
          <Text style={styles.infoText}>Adresse de départ: {trajet.adresseDepart}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="flag-outline" size={18} color="#EF4444" />
          <Text style={styles.infoText}>Adresse d'arrivée: {trajet.adresseArrivee}</Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="person-outline" size={18} color="#666" />
          <Text style={styles.infoText}>Conducteur: {trajet.conducteur?.nom || 'Anonyme'}</Text>
        </View>

        <View style={[styles.infoRow, { marginTop: 8 }] }>
          {trajet.animauxAcceptes && (
            <View style={styles.badge}>
              <Ionicons name="paw-outline" size={14} color="#666" />
              <Text style={styles.badgeText}>Animaux</Text>
            </View>
          )}
          {trajet.bagagesAcceptes && (
            <View style={styles.badge}>
              <Ionicons name="briefcase-outline" size={14} color="#666" />
              <Text style={styles.badgeText}>Bagages</Text>
            </View>
          )}
        </View>
      </View>

      {/* Carte réservation */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Disponibilités & prix</Text>
        <View style={styles.infoRow}>
          <Ionicons name="people-outline" size={18} color="#666" />
          <Text style={styles.infoText}>
            {placesDisponibles > 0 ? `${placesDisponibles} libre${placesDisponibles > 1 ? 's' : ''} / ${trajet.places}` : 'Complet'}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="cash-outline" size={18} color="#10B981" />
          <Text style={styles.infoText}>Prix par place: {trajet.prix} $CA</Text>
        </View>

        <View style={[styles.infoRow, { justifyContent: 'space-between', marginTop: 12 }]}>
          <Text style={styles.label}>Nombre de places</Text>
          <View style={styles.counterRow}>
            <TouchableOpacity
              onPress={() => setNbPlaces((v) => Math.max(1, v - 1))}
              disabled={nbPlaces <= 1}
              style={[styles.counterButton, nbPlaces <= 1 && styles.disabledButton]}
            >
              <Ionicons name="remove" size={18} color={nbPlaces <= 1 ? '#999' : '#007AFF'} />
            </TouchableOpacity>
            <Text style={styles.counterValue}>{nbPlaces}</Text>
            <TouchableOpacity
              onPress={() => setNbPlaces((v) => Math.min(Math.min(8, placesDisponibles), v + 1))}
              disabled={nbPlaces >= Math.min(8, placesDisponibles)}
              style={[styles.counterButton, nbPlaces >= Math.min(8, placesDisponibles) && styles.disabledButton]}
            >
              <Ionicons name="add" size={18} color={nbPlaces >= Math.min(8, placesDisponibles) ? '#999' : '#007AFF'} />
            </TouchableOpacity>
          </View>
        </View>
        <View style={[styles.infoRow, { justifyContent: 'space-between' }]}>
          <Text style={styles.label}>Total</Text>
          <Text style={styles.totalText}>{(trajet.prix * nbPlaces).toFixed(2)} $CA</Text>
        </View>

        {!!error && (
          <Text style={styles.errorText}>{error}</Text>
        )}

        <TouchableOpacity
          style={[styles.primaryButton, (placesDisponibles <= 0) && styles.disabledButton]}
          disabled={placesDisponibles <= 0}
          onPress={() => {
            // Vérifications préliminaires
            setError(null);
            if (!user) {
              setError('Veuillez vous connecter');
              router.push('/(tabs)/connexion');
              return;
            }
            if (trajet.conducteurId === user.id) {
              setError("Vous ne pouvez pas réserver votre propre trajet");
              return;
            }
            if (nbPlaces < 1 || nbPlaces > placesDisponibles) {
              setError('Nombre de places indisponible');
              return;
            }
            setShowPayment(true);
          }}
        >
          <Ionicons name="card-outline" size={18} color="#fff" />
          <Text style={[styles.primaryButtonText, { marginLeft: 8 }]}>Continuer vers le paiement</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    color: '#666',
  },
  errorText: {
    color: '#FF3B30',
    fontWeight: '600',
    marginBottom: 12,
  },
  successCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E7F9EF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  successCheck: {
    color: '#10B981',
    fontSize: 28,
    fontWeight: '900',
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  successText: {
    color: '#666',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    marginLeft: 6,
    fontWeight: '600',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f0f0',
  },
  card: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  routeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    flexShrink: 1,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
  },
  badgeText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 6,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  hintBox: {
    backgroundColor: '#F0F7FF',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 12,
  },
  hintStrong: { color: '#2563EB', fontWeight: '700', marginBottom: 4 },
  hintText: { color: '#2563EB' },
  label: { fontSize: 14, color: '#333', fontWeight: '600' },
  formField: { marginTop: 12 },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
    color: '#333',
  },
  primaryButton: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 10,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  counterButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  counterValue: { fontSize: 16, fontWeight: '700', color: '#333' },
  totalText: { fontSize: 16, fontWeight: '700', color: '#333' },
  disabledButton: { opacity: 0.5 },
});


