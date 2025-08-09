import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

type Voiture = { marque: string; modele: string };
type Conducteur = { id: string; nom: string; voitures?: Voiture[] };
type Avis = { id: string; note: number; commentaire: string; date: string } | null;
type Trajet = { id: string; depart: string; destination: string; date: string; prix: number; effectue: boolean; conducteur: Conducteur };
type Reservation = { id: string; nbPlaces: number; statut: 'EN_ATTENTE' | 'CONFIRMEE' | 'ANNULEE'; trajet: Trajet; avis?: Avis };

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function StarRating({ value, onChange, size = 22, disabled = false }: { value: number; onChange?: (v: number) => void; size?: number; disabled?: boolean }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <TouchableOpacity key={n} disabled={disabled} onPress={() => onChange && onChange(n)}>
          <Ionicons name={n <= value ? 'star' : 'star-outline'} size={size} color={n <= value ? '#F59E0B' : '#D1D5DB'} />
        </TouchableOpacity>
      ))}
    </View>
  );
}

function ReservationCard({ reservation, onEvaluation, submitting }: { reservation: Reservation; onEvaluation: (reservationId: string, conducteurId: string, note: number, commentaire: string) => Promise<void>; submitting: boolean; }) {
  const voiture = reservation.trajet.conducteur.voitures?.[0];
  const [localNote, setLocalNote] = useState<number>(0);
  const [localComment, setLocalComment] = useState<string>('');
  const [evaluationActive, setEvaluationActive] = useState<boolean>(false);

  const canEvaluate = reservation.statut === 'CONFIRMEE' && reservation.trajet.effectue === true && !reservation.avis;

  const submit = async () => {
    if (localNote > 0 && localComment.trim()) {
      await onEvaluation(reservation.id, reservation.trajet.conducteur.id, localNote, localComment.trim());
      setLocalNote(0);
      setLocalComment('');
      setEvaluationActive(false);
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.rowBetween}>
        <View style={{ flex: 1, paddingRight: 8 }}>
          <View style={styles.routeRow}>
            <Ionicons name="location-outline" size={18} color="#10B981" />
            <Text numberOfLines={1} style={styles.routeText}>{reservation.trajet.depart}</Text>
            <Text style={styles.arrow}>→</Text>
            <Ionicons name="flag-outline" size={18} color="#EF4444" />
            <Text numberOfLines={1} style={styles.routeText}>{reservation.trajet.destination}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={16} color="#666" />
            <Text style={styles.infoText}>{formatDate(reservation.trajet.date)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="person-outline" size={16} color="#666" />
            <Text style={styles.infoText}>{reservation.trajet.conducteur.nom}</Text>
          </View>
          {!!voiture && (
            <View style={styles.infoRow}>
              <Ionicons name="car-outline" size={16} color="#666" />
              <Text style={styles.infoText}>{voiture.marque} {voiture.modele}</Text>
            </View>
          )}
        </View>
        <View style={{ alignItems: 'flex-end', minWidth: 130 }}>
          <Text style={[styles.badge, reservation.statut === 'CONFIRMEE' ? styles.badgeOk : reservation.statut === 'EN_ATTENTE' ? styles.badgeWait : styles.badgeCancel]}>
            {reservation.statut}
          </Text>
          <Text style={styles.priceText}>{reservation.trajet.prix * reservation.nbPlaces} $CA</Text>
          <Text style={styles.muted}>{reservation.nbPlaces} place(s)</Text>
        </View>
      </View>

      {canEvaluate && (
        <View style={styles.evalBox}>
          {evaluationActive ? (
            <View>
              <Text style={styles.evalTitle}>Évaluer le conducteur</Text>
              <StarRating value={localNote} onChange={setLocalNote} />
              <TextInput
                placeholder="Laissez un commentaire sur votre expérience..."
                value={localComment}
                onChangeText={setLocalComment}
                style={styles.textArea}
                multiline
              />
              <View style={styles.evalActions}>
                <TouchableOpacity disabled={submitting || localNote === 0 || !localComment.trim()} onPress={submit} style={[styles.primaryButton, (submitting || localNote === 0 || !localComment.trim()) && styles.disabled]}>
                  <Text style={styles.primaryButtonText}>{submitting ? 'Envoi…' : "Envoyer l'évaluation"}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => { setEvaluationActive(false); setLocalNote(0); setLocalComment(''); }} style={styles.secondaryButton}>
                  <Text style={styles.secondaryText}>Annuler</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity onPress={() => setEvaluationActive(true)}>
              <Text style={styles.link}>Évaluer le conducteur</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {!!reservation.avis && (
        <View style={styles.evalBox}>
          <Text style={styles.evalTitle}>Votre évaluation</Text>
          <StarRating value={reservation.avis.note} disabled size={18} />
          <Text style={styles.infoText}>{reservation.avis.commentaire}</Text>
          <Text style={[styles.muted, { marginTop: 4 }]}>Donné le {new Date(reservation.avis.date).toLocaleDateString('fr-FR')}</Text>
        </View>
      )}
    </View>
  );
}

export default function ReservationsScreen() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        setLoading(true);
        setError(null);

        // Vérifier session
        const sessionRes = await fetch('http://192.168.1.70:5000/check-session', { credentials: 'include' });
        const sessionData = await sessionRes.json();
        if (!sessionData?.isAuthenticated) {
          Alert.alert('Connexion requise', 'Veuillez vous connecter');
          router.push('/(tabs)/connexion');
          return;
        }

        // Récupérer réservations
        const res = await fetch('http://192.168.1.70:5000/mes-reservations', { credentials: 'include' });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || 'Erreur lors de la récupération des réservations');
        if (mounted) setReservations(Array.isArray(data) ? data : []);
      } catch (e: any) {
        if (mounted) setError(e?.message || 'Erreur inconnue');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  const handleEvaluation = async (reservationId: string, conducteurId: string, note: number, commentaire: string) => {
    try {
      setSubmitting(true);
      setError(null);
      const res = await fetch('http://192.168.1.70:5000/avis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ note, commentaire, conducteurId, reservationId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Erreur lors de l'envoi de l'avis");
      // Recharger les réservations pour refléter l'avis
      const refRes = await fetch('http://192.168.1.70:5000/mes-reservations', { credentials: 'include' });
      const refData = await refRes.json();
      if (refRes.ok) setReservations(Array.isArray(refData) ? refData : []);
    } catch (e: any) {
      setError(e?.message || "Erreur d'évaluation");
    } finally {
      setSubmitting(false);
    }
  };

  const { enCours, effectuees } = useMemo(() => {
    const now = new Date();
    const enCours = reservations.filter(r => !r.trajet.effectue && new Date(r.trajet.date) >= now);
    const effectuees = reservations.filter(r => r.trajet.effectue || new Date(r.trajet.date) < now);
    return { enCours, effectuees };
  }, [reservations]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Chargement…</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      <Text style={styles.title}>Mes réservations</Text>

      {!!error && (
        <View style={[styles.feedbackBox, styles.feedbackErr]}>
          <Text style={styles.feedbackErrText}>{error}</Text>
        </View>
      )}

      {reservations.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>Vous n'avez pas encore de réservations.</Text>
          <TouchableOpacity style={styles.primaryButton} onPress={() => router.push('/(tabs)/recherche')}>
            <Text style={styles.primaryButtonText}>Rechercher un trajet</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeaderRow}>
              <Ionicons name="time-outline" size={18} color="#2563EB" />
              <Text style={styles.sectionHeaderText}>Trajets à venir et en cours</Text>
              <View style={styles.counterChip}><Text style={styles.counterText}>{enCours.length}</Text></View>
            </View>
            {enCours.length === 0 ? (
              <Text style={styles.muted}>Aucune réservation en cours ou à venir</Text>
            ) : (
              enCours.map(r => (
                <ReservationCard key={r.id} reservation={r} onEvaluation={handleEvaluation} submitting={submitting} />
              ))
            )}
          </View>

          <View style={styles.sectionCard}>
            <View style={styles.sectionHeaderRow}>
              <Ionicons name="checkmark-done-outline" size={18} color="#16A34A" />
              <Text style={styles.sectionHeaderText}>Trajets effectués</Text>
              <View style={[styles.counterChip, { backgroundColor: '#DCFCE7' }]}><Text style={[styles.counterText, { color: '#16A34A' }]}>{effectuees.length}</Text></View>
            </View>
            {effectuees.length === 0 ? (
              <Text style={styles.muted}>Aucun trajet effectué</Text>
            ) : (
              effectuees.map(r => (
                <ReservationCard key={r.id} reservation={r} onEvaluation={handleEvaluation} submitting={submitting} />
              ))
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
  title: { fontSize: 20, fontWeight: '700', color: '#333' },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 12, marginTop: 8, borderWidth: 1, borderColor: '#f0f0f0' },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between' },
  routeRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  routeText: { fontSize: 16, fontWeight: '700', color: '#333', maxWidth: 120 },
  arrow: { color: '#999' },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  infoText: { color: '#666' },
  priceText: { color: '#16A34A', fontWeight: '700', marginTop: 6 },
  muted: { color: '#777' },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, overflow: 'hidden', color: '#fff', fontWeight: '700', textTransform: 'capitalize', textAlign: 'center' },
  badgeOk: { backgroundColor: '#16A34A' },
  badgeWait: { backgroundColor: '#D97706' },
  badgeCancel: { backgroundColor: '#DC2626' },
  evalBox: { backgroundColor: '#F9FAFB', marginTop: 12, padding: 10, borderRadius: 10 },
  evalTitle: { fontWeight: '700', color: '#333', marginBottom: 8 },
  textArea: { borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 8, padding: 12, fontSize: 16, backgroundColor: '#f8f9fa', color: '#333', minHeight: 90, marginTop: 8 },
  evalActions: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 10 },
  link: { color: '#2563EB', fontWeight: '700' },
  sectionCard: { backgroundColor: '#fff', borderRadius: 12, padding: 12, marginTop: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  sectionHeaderText: { fontSize: 16, fontWeight: '700', color: '#333', flex: 1 },
  counterChip: { backgroundColor: '#DBEAFE', borderRadius: 12, paddingHorizontal: 8, paddingVertical: 2 },
  counterText: { color: '#2563EB', fontWeight: '700' },
  emptyBox: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginTop: 16, alignItems: 'center' },
  emptyText: { color: '#666', marginBottom: 10 },
  primaryButton: { backgroundColor: '#007AFF', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 10, alignItems: 'center' },
  primaryButtonText: { color: '#fff', fontWeight: '700' },
  secondaryButton: { backgroundColor: '#F3F4F6', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 10 },
  secondaryText: { color: '#2563EB', fontWeight: '700' },
  feedbackBox: { borderRadius: 10, padding: 12, marginTop: 10 },
  feedbackErr: { backgroundColor: '#FEE2E2', borderColor: '#FCA5A5', borderWidth: 1 },
  feedbackErrText: { color: '#991B1B', fontWeight: '700' },
  disabled: { opacity: 0.5 },
});


