import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ConnexionScreen() {
  const [formData, setFormData] = useState({ email: '', motDePasse: '' });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [banni, setBanni] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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
      if (data.isAuthenticated && data.user) {
        if (data.user.banni) {
          setBanni(true);
          return;
        }
        // Rediriger vers la page d'accueil si déjà connecté
        router.replace('/(tabs)/index');
      }
    } catch (error) {
      console.error('Erreur de vérification de session:', error);
    }
  };

  const handleSubmit = async () => {
    setMessage('');
    setLoading(true);

    try {
      const res = await fetch('http://192.168.1.70:5000/login', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          motDePasse: formData.motDePasse,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage('Connexion réussie !');
        // Vérifier la session après connexion
        const sessionRes = await fetch('http://192.168.1.70:5000/check-session', {
          credentials: 'include',
        });
        const sessionData = await sessionRes.json();
        
        if (sessionData.isAuthenticated && sessionData.user) {
          if (sessionData.user.type === 'ADMIN') {
            Alert.alert('Admin', 'Redirection vers l\'interface admin');
            // router.replace('/admin');
          } else {
            router.replace('/(tabs)/index');
          }
        } else {
          setMessage('Erreur lors de la vérification de session. Veuillez réessayer.');
        }
      } else {
        setMessage(data.error || 'Erreur lors de la connexion.');
      }
    } catch (error) {
      console.error('Erreur de connexion:', error);
      setMessage('Erreur de connexion au serveur.');
    } finally {
      setLoading(false);
    }
  };

  if (banni) {
    return (
      <View style={styles.container}>
        <View style={styles.banniContainer}>
          <Ionicons name="close-circle" size={64} color="#ef4444" />
          <Text style={styles.banniTitle}>Compte banni</Text>
          <Text style={styles.banniText}>
            Votre compte a été banni par un administrateur.{'\n'}
            Contactez le support si besoin.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={[styles.container, { paddingTop: insets.top + 16 }]}>
      {/* Hero background */}
      <View style={styles.heroBg}>
        <View style={styles.bgCircleA} />
        <View style={styles.bgCircleB} />
        <View style={[styles.heroHeader, { paddingTop: insets.top + 28 }]}>
          <Text style={styles.heroTitle}>Heureux de vous revoir</Text>
          <Text style={styles.heroSubtitle}>Connectez-vous pour continuer</Text>
        </View>
      </View>

      {/* Form card overlapping the hero */}
      <BlurView intensity={30} tint="light" style={styles.formCardWrapper}>
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Connexion</Text>

          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={20} color="#64748b" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#9ca3af"
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color="#64748b" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Mot de passe"
              placeholderTextColor="#9ca3af"
              value={formData.motDePasse}
              onChangeText={(text) => setFormData({ ...formData, motDePasse: text })}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword((v) => !v)}>
              <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="#64748b" />
            </TouchableOpacity>
          </View>

          {message ? (
            <View style={[styles.messageContainer, message.includes('réussie') ? styles.successBg : styles.errorBg]}>
              <Ionicons
                name={message.includes('réussie') ? 'checkmark-circle-outline' : 'alert-circle-outline'}
                size={18}
                color={message.includes('réussie') ? '#15803d' : '#b91c1c'}
                style={{ marginRight: 6 }}
              />
              <Text style={[styles.messageText, message.includes('réussie') ? styles.successMessage : styles.errorMessage]}>
                {message}
              </Text>
            </View>
          ) : null}

          <TouchableOpacity
            style={[styles.submitButton, loading && styles.disabledButton]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="log-in-outline" size={18} color="#fff" />
                <Text style={[styles.submitButtonText, { marginLeft: 8 }]}>Se connecter</Text>
              </>
            )}
          </TouchableOpacity>

          <View style={styles.linkContainer}>
            <Text style={styles.linkText}>Pas encore de compte ? </Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/inscription')}>
              <Text style={styles.link}>S'inscrire</Text>
            </TouchableOpacity>
          </View>
        </View>
      </BlurView>

      {/* Logo en bas, entre le formulaire et la barre de navigation */}
      <View style={styles.bottomLogoContainer}>
        <Image
          source={require('../../assets/cocologo.png')}
          style={styles.bottomLogo}
          resizeMode="contain"
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f5f7fb',
    paddingBottom: 140,
  },
  heroBg: { height: 200, backgroundColor: '#0ea5e9', borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },
  bgCircleA: { position: 'absolute', width: 160, height: 160, borderRadius: 80, backgroundColor: '#22d3ee', top: -40, right: -20, opacity: 0.4 },
  bgCircleB: { position: 'absolute', width: 140, height: 140, borderRadius: 70, backgroundColor: '#38bdf8', bottom: -30, left: -20, opacity: 0.35 },
  heroHeader: { alignItems: 'center', paddingTop: 12 },
  heroTitle: { color: '#0f172a', fontSize: 20, fontWeight: '800' },
  heroSubtitle: { color: '#1f2937', marginTop: 4 },
  formCardWrapper: { marginTop: -30, marginHorizontal: 16, borderRadius: 16, overflow: 'hidden' },
  formCard: { backgroundColor: 'rgba(255,255,255,0.85)', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.6)' },
  formTitle: { fontSize: 18, fontWeight: '800', color: '#0f172a', marginBottom: 12 },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    padding: 10,
    borderRadius: 10,
  },
  successBg: { backgroundColor: '#ecfdf5', borderWidth: 1, borderColor: '#86efac' },
  errorBg: { backgroundColor: '#fee2e2', borderWidth: 1, borderColor: '#fca5a5' },
  messageText: {
    fontSize: 14,
    textAlign: 'center',
  },
  successMessage: { color: '#166534', fontWeight: '700' },
  errorMessage: { color: '#991b1b', fontWeight: '700' },
  submitButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center', flexDirection: 'row', justifyContent: 'center',
    marginBottom: 20,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  bottomLogoContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 16, marginBottom: 8 },
  bottomLogo: { width: 160, height: 60, opacity: 0.9 },
  linkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  linkText: {
    fontSize: 16,
    color: '#666',
  },
  link: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  banniContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  banniTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ef4444',
    marginTop: 16,
    marginBottom: 12,
  },
  banniText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
}); 