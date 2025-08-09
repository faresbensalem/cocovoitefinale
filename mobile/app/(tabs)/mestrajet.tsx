import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

type Passager = {
  id: string;
  nom: string;
  email?: string;
  numero?: string | null;
  dateNaissance?: string | null;
};

type Reservation = {
  id: string;
  nbPlaces: number;
  statut: 'EN_ATTENTE' | 'CONFIRMEE' | 'ANNULEE';
  passager: Passager;
};

type Trajet = {
  id: string;
  depart: string;
  destination: string;
  date: string;
  places: number;
  prix: number;
  effectue: boolean;
  reservations: Reservation[];
};

export default function MesTrajetsScreen() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trajets, setTrajets] = useState<Trajet[]>([]);
  const [expandedTrajetId, setExpandedTrajetId] = useState<string | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        setLoading(true);
        setError(null);

        const sessionRes = await fetch('http://192.168.1.70:5000/check-session', { credentials: 'include' });
        const sessionData = await sessionRes.json();
        if (!sessionData?.isAuthenticated) {
          Alert.alert('Connexion requise', 'Veuillez vous connecter');
          if (mounted) router.push('/(tabs)/connexion');
          return;
        }

        const res = await fetch('http://192.168.1.70:5000/mes-trajets', { credentials: 'include' });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data?.error || "Erreur lors de la récupération des trajets");
        }
        const sorted = (Array.isArray(data) ? data : []).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        if (mounted) setTrajets(sorted);
      } catch (e: any) {
        if (mounted) setError(e?.message || 'Erreur inconnue');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const now = new Date();
  const { enCours, effectues } = useMemo(() => {
    const enCours = trajets.filter(t => !t.effectue && new Date(t.date) >= now);
    const effectues = trajets.filter(t => t.effectue || new Date(t.date) < now);
    return { enCours, effectues };
  }, [trajets]);

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const calculateAge = (dateNaissance?: string | null) => {
    if (!dateNaissance) return 'Non spécifié';
    const today = new Date();
    const birth = new Date(dateNaissance);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return `${age} ans`;
  };

  const isTrajetPasse = (date: string) => new Date(date) < new Date();

  const handleConfirmTrajet = async (trajetId: string) => {
    try {
      setConfirmingId(trajetId);
      setFeedback(null);
      const res = await fetch(`http://192.168.1.70:5000/trajets/${trajetId}/confirmer`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Erreur lors de la confirmation du trajet');
      setTrajets(prev => prev.map(t => (t.id === trajetId ? data : t)));
      setFeedback({ type: 'success', message: 'Trajet confirmé avec succès !' });
      setTimeout(() => setFeedback(null), 3000);
    } catch (e: any) {
      setFeedback({ type: 'error', message: e?.message || 'Erreur lors de la confirmation' });
    } finally {
      setConfirmingId(null);
    }
  };

  const renderTrajetCard = (trajet: Trajet) => (
    <View key={trajet.id} style={styles.card}>
      <View style={styles.rowBetween}>
        <View style={{ flex: 1, paddingRight: 8 }}>
          <View style={styles.routeRow}>
            <Ionicons name="location-outline" size={18} color="#10B981" />
            <Text numberOfLines={1} style={styles.routeText}>{trajet.depart}</Text>
            <Text style={styles.arrow}>→</Text>
            <Ionicons name="flag-outline" size={18} color="#EF4444" />
            <Text numberOfLines={1} style={styles.routeText}>{trajet.destination}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={16} color="#666" />
            <Text style={styles.infoText}>{formatDate(trajet.date)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="people-outline" size={16} color="#666" />
            <Text style={styles.infoText}>{trajet.places} places</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="cash-outline" size={16} color="#10B981" />
            <Text style={styles.infoText}>{trajet.prix} $CA</Text>
          </View>
        </View>

        <View style={styles.actionsCol}>
          {isTrajetPasse(trajet.date) && !trajet.effectue ? (
            <TouchableOpacity
              onPress={() => handleConfirmTrajet(trajet.id)}
              disabled={confirmingId === trajet.id}
              style={[styles.confirmButton, confirmingId === trajet.id && styles.disabled]}
            >
              {confirmingId === trajet.id ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle-outline" size={18} color="#fff" />
                  <Text style={styles.confirmText}>Confirmer</Text>
                </>
              )}
            </TouchableOpacity>
          ) : trajet.effectue ? (
            <View style={styles.doneBadge}>
              <Ionicons name="checkmark-circle" size={16} color="#16A34A" />
              <Text style={styles.doneText}>Trajet effectué</Text>
            </View>
          ) : null}

          <TouchableOpacity
            onPress={() => setExpandedTrajetId(expandedTrajetId === trajet.id ? null : trajet.id)}
            style={[styles.secondaryButton, trajet.reservations.length === 0 && styles.disabled]}
            disabled={trajet.reservations.length === 0}
          >
            <Ionicons name="people" size={16} color={trajet.reservations.length === 0 ? '#999' : '#2563EB'} />
            <Text style={[styles.secondaryText, { color: trajet.reservations.length === 0 ? '#999' : '#2563EB' }]}>
              {trajet.reservations.length > 0 ? `Réservations (${trajet.reservations.length})` : 'Aucune réservation'}
            </Text>
            <Ionicons name={expandedTrajetId === trajet.id ? 'chevron-up' : 'chevron-down'} size={16} color={trajet.reservations.length === 0 ? '#999' : '#2563EB'} />
          </TouchableOpacity>
        </View>
      </View>

      {expandedTrajetId === trajet.id && trajet.reservations.length > 0 && (
        <View style={styles.reservationsBox}>
          <Text style={styles.sectionTitle}>Passagers</Text>
          {trajet.reservations.map((r) => (
            <View key={r.id} style={styles.reservationItem}>
              <View style={styles.reservationLeft}>
                <View style={styles.avatar}><Ionicons name="person" size={18} color="#fff" /></View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.passagerName} numberOfLines={1}>{r.passager.nom}</Text>
                  <View style={styles.passagerMetaRow}>
                    <Text style={styles.passagerMeta} numberOfLines={1}>Covoitureur de {calculateAge(r.passager.dateNaissance)}</Text>
                    {!!r.passager.numero && (
                      <View style={styles.phoneRow}>
                        <Ionicons name="call-outline" size={14} color="#2563EB" />
                        <Text style={styles.phoneText} numberOfLines={1}>{r.passager.numero}</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
              <View style={styles.reservationRight}>
                <Text style={styles.placesText}>{r.nbPlaces} place(s)</Text>
                <Text style={[styles.statutText,
                  r.statut === 'CONFIRMEE' ? styles.statutOk : r.statut === 'EN_ATTENTE' ? styles.statutWait : styles.statutCancel
                ]}>{r.statut}</Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Chargement…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.primaryButton} onPress={() => router.replace('/(tabs)')}>
          <Text style={styles.primaryButtonText}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      <View style={styles.header}>
        <Text style={styles.title}>Mes trajets publiés</Text>
      </View>

      {feedback && (
        <View style={[styles.feedbackBox, feedback.type === 'success' ? styles.feedbackOk : styles.feedbackErr]}>
          <Text style={feedback.type === 'success' ? styles.feedbackOkText : styles.feedbackErrText}>{feedback.message}</Text>
        </View>
      )}

      {trajets.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>Vous n'avez pas encore publié de trajets.</Text>
          <TouchableOpacity style={styles.primaryButton} onPress={() => router.push('/(tabs)/publier')}>
            <Text style={styles.primaryButtonText}>Publier un trajet</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeaderRow}>
              <Ionicons name="time-outline" size={18} color="#2563EB" />
              <Text style={styles.sectionHeaderText}>En cours et à venir</Text>
              <View style={styles.counterChip}><Text style={styles.counterText}>{enCours.length}</Text></View>
            </View>
            {enCours.length === 0 ? (
              <Text style={styles.muted}>Aucun trajet en cours ou à venir</Text>
            ) : (
              enCours.map(renderTrajetCard)
            )}
          </View>

          <View style={styles.sectionCard}>
            <View style={styles.sectionHeaderRow}>
              <Ionicons name="checkmark-done-outline" size={18} color="#16A34A" />
              <Text style={styles.sectionHeaderText}>Trajets effectués</Text>
              <View style={[styles.counterChip, { backgroundColor: '#DCFCE7' }]}><Text style={[styles.counterText, { color: '#16A34A' }]}>{effectues.length}</Text></View>
            </View>
            {effectues.length === 0 ? (
              <Text style={styles.muted}>Aucun trajet effectué</Text>
            ) : (
              effectues.map(renderTrajetCard)
            )}
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f5f5f5', padding: 24 },
  loadingText: { marginTop: 12, color: '#666' },
  errorText: { color: '#FF3B30', fontWeight: '600', marginBottom: 12 },
  header: { paddingHorizontal: 4, paddingBottom: 8 },
  title: { fontSize: 20, fontWeight: '700', color: '#333' },
  sectionCard: { backgroundColor: '#fff', borderRadius: 12, padding: 12, marginTop: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  sectionHeaderText: { fontSize: 16, fontWeight: '700', color: '#333', flex: 1 },
  counterChip: { backgroundColor: '#DBEAFE', borderRadius: 12, paddingHorizontal: 8, paddingVertical: 2 },
  counterText: { color: '#2563EB', fontWeight: '700' },
  muted: { color: '#777' },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 12, marginTop: 8, borderWidth: 1, borderColor: '#f0f0f0' },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between' },
  routeRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  routeText: { fontSize: 16, fontWeight: '700', color: '#333', maxWidth: 120 },
  arrow: { color: '#999' },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  infoText: { color: '#666' },
  actionsCol: { justifyContent: 'flex-start', alignItems: 'flex-end', gap: 8, minWidth: 170 },
  confirmButton: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#16A34A', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  confirmText: { color: '#fff', fontWeight: '700' },
  doneBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#E7F9EF', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
  doneText: { color: '#16A34A', fontWeight: '600' },
  secondaryButton: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#F3F4F6', paddingHorizontal: 10, paddingVertical: 8, borderRadius: 10 },
  secondaryText: { fontWeight: '700' },
  reservationsBox: { backgroundColor: '#F9FAFB', marginTop: 12, padding: 10, borderRadius: 10 },
  sectionTitle: { fontWeight: '700', color: '#333', marginBottom: 8 },
  reservationItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#F3F4F6', marginBottom: 8 },
  reservationLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#3B82F6', alignItems: 'center', justifyContent: 'center' },
  passagerName: { fontWeight: '700', color: '#333' },
  passagerMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 4 },
  passagerMeta: { color: '#666' },
  phoneRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  phoneText: { color: '#2563EB' },
  reservationRight: { alignItems: 'flex-end', minWidth: 110 },
  placesText: { color: '#16A34A', fontWeight: '700' },
  statutText: { marginTop: 2, fontWeight: '700' },
  statutOk: { color: '#16A34A' },
  statutWait: { color: '#D97706' },
  statutCancel: { color: '#DC2626' },
  primaryButton: { marginTop: 12, backgroundColor: '#007AFF', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 10, alignItems: 'center' },
  primaryButtonText: { color: '#fff', fontWeight: '700' },
  feedbackBox: { borderRadius: 10, padding: 12, marginTop: 10 },
  feedbackOk: { backgroundColor: '#DCFCE7', borderColor: '#86EFAC', borderWidth: 1 },
  feedbackErr: { backgroundColor: '#FEE2E2', borderColor: '#FCA5A5', borderWidth: 1 },
  feedbackOkText: { color: '#166534', fontWeight: '700' },
  feedbackErrText: { color: '#991B1B', fontWeight: '700' },
  disabled: { opacity: 0.5 },
});


