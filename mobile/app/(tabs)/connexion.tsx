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

export default function ConnexionScreen() {
  const [formData, setFormData] = useState({ email: '', motDePasse: '' });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [banni, setBanni] = useState(false);

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
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Image
          source={require('../../assets/cocologo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>Connexion</Text>
      </View>

      <View style={styles.formContainer}>
        <View style={styles.inputContainer}>
          <Ionicons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={formData.email}
            onChangeText={(text) => setFormData({ ...formData, email: text })}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Mot de passe"
            value={formData.motDePasse}
            onChangeText={(text) => setFormData({ ...formData, motDePasse: text })}
            secureTextEntry
          />
        </View>

        {message ? (
          <View style={styles.messageContainer}>
            <Text style={[
              styles.messageText,
              message.includes('réussie') ? styles.successMessage : styles.errorMessage
            ]}>
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
            <Text style={styles.submitButtonText}>Se connecter</Text>
          )}
        </TouchableOpacity>

        <View style={styles.linkContainer}>
          <Text style={styles.linkText}>Pas encore de compte ? </Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/inscription')}>
            <Text style={styles.link}>S'inscrire</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f5f5f5',
    paddingBottom: 150, // Marge pour éviter que la barre de navigation cache le contenu
  },
  header: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#fff',
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  formContainer: {
    padding: 20,
  },
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
    marginBottom: 16,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
  },
  messageText: {
    fontSize: 14,
    textAlign: 'center',
  },
  successMessage: {
    color: '#28a745',
  },
  errorMessage: {
    color: '#dc3545',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
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