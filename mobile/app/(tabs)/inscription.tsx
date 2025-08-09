import React, { useState } from 'react';
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

export default function InscriptionScreen() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    birthdate: '',
    phone: '',
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const insets = useSafeAreaInsets();

  const loginAfterRegistration = async (email, password) => {
    try {
      const res = await fetch('http://192.168.1.70:5000/login', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          motDePasse: password,
        }),
      });

      if (!res.ok) {
        throw new Error('Erreur de connexion automatique');
      }

      const data = await res.json();
      console.log('Connexion automatique réussie:', data);
      
      // Vérifier la session
      const sessionRes = await fetch('http://192.168.1.70:5000/check-session', {
        credentials: 'include',
      });
      const sessionData = await sessionRes.json();
      console.log('Session après connexion:', sessionData);

      return true;
    } catch (error) {
      console.error('Erreur lors de la connexion automatique:', error);
      return false;
    }
  };

  const handleSubmit = async () => {
    setMessage('');
    setLoading(true);

    try {
      console.log('Tentative d\'inscription...');
      
      // Formatage de la date de naissance
      const dateNaissance = formData.birthdate ? new Date(formData.birthdate).toISOString() : null;
      
      const res = await fetch('http://192.168.1.70:5000/register', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nom: formData.username,
          email: formData.email,
          motDePasse: formData.password,
          dateNaissance: dateNaissance,
          numero: formData.phone || null,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        console.log('Inscription réussie, tentative de connexion automatique...');
        setMessage('Inscription réussie ! Connexion en cours...');
        
        const loginSuccess = await loginAfterRegistration(formData.email, formData.password);
        
        if (loginSuccess) {
          setMessage('Inscription et connexion réussies !');
          router.replace('/(tabs)/index');
        } else {
          setMessage('Inscription réussie mais erreur de connexion automatique. Veuillez vous connecter manuellement.');
          router.replace('/(tabs)/connexion');
        }
      } else {
        setMessage(data.error || 'Erreur lors de l\'inscription.');
      }
    } catch (error) {
      console.error('Erreur d\'inscription:', error);
      setMessage('Erreur de connexion au serveur.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { paddingTop: insets.top + 16 }]}>
      {/* Hero background */}
      <View style={styles.heroBg}>
        <View style={styles.bgCircleA} />
        <View style={styles.bgCircleB} />
        <View style={styles.heroHeader}>
          <Text style={styles.heroTitle}>Rejoignez Cocovoit</Text>
          <Text style={styles.heroSubtitle}>Créez un compte pour commencer</Text>
        </View>
      </View>

      {/* Form card */}
      <BlurView intensity={30} tint="light" style={styles.formCardWrapper}>
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Inscription</Text>

          <View style={styles.inputContainer}>
            <Ionicons name="person-outline" size={20} color="#64748b" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Nom d'utilisateur"
              placeholderTextColor="#9ca3af"
              value={formData.username}
              onChangeText={(text) => setFormData({ ...formData, username: text })}
              autoCapitalize="words"
            />
          </View>

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
              value={formData.password}
              onChangeText={(text) => setFormData({ ...formData, password: text })}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword((v) => !v)}>
              <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="#64748b" />
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="calendar-outline" size={20} color="#64748b" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Date de naissance (YYYY-MM-DD)"
              placeholderTextColor="#9ca3af"
              value={formData.birthdate}
              onChangeText={(text) => setFormData({ ...formData, birthdate: text })}
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="call-outline" size={20} color="#64748b" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Numéro de téléphone (optionnel)"
              placeholderTextColor="#9ca3af"
              value={formData.phone}
              onChangeText={(text) => setFormData({ ...formData, phone: text })}
              keyboardType="phone-pad"
            />
          </View>

          {message ? (
            <View style={[styles.messageContainer, message.includes('réussie') ? styles.successBg : styles.errorBg]}>
              <Ionicons name={message.includes('réussie') ? 'checkmark-circle-outline' : 'alert-circle-outline'} size={18} color={message.includes('réussie') ? '#15803d' : '#b91c1c'} style={{ marginRight: 6 }} />
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
                <Ionicons name="person-add-outline" size={18} color="#fff" />
                <Text style={[styles.submitButtonText, { marginLeft: 8 }]}>S'inscrire</Text>
              </>
            )}
          </TouchableOpacity>

          <View style={styles.linkContainer}>
            <Text style={styles.linkText}>Déjà un compte ? </Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/connexion')}>
              <Text style={styles.link}>Se connecter</Text>
            </TouchableOpacity>
          </View>
        </View>
      </BlurView>

      {/* Logo en bas */}
      <View style={styles.bottomLogoContainer}>
        <Image source={require('../../assets/cocologo.png')} style={styles.bottomLogo} resizeMode="contain" />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#f5f7fb', paddingBottom: 140 },
  heroBg: { height: 200, backgroundColor: '#0ea5e9', borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },
  bgCircleA: { position: 'absolute', width: 160, height: 160, borderRadius: 80, backgroundColor: '#22d3ee', top: -40, right: -20, opacity: 0.4 },
  bgCircleB: { position: 'absolute', width: 140, height: 140, borderRadius: 70, backgroundColor: '#38bdf8', bottom: -30, left: -20, opacity: 0.35 },
  heroHeader: { alignItems: 'center', paddingTop: 24 },
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
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
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
  bottomLogoContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 16, marginBottom: 8 },
  bottomLogo: { width: 160, height: 60, opacity: 0.9 },
}); 