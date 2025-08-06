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
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Image
          source={require('../../assets/cocologo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>Inscription</Text>
      </View>

      <View style={styles.formContainer}>
        <View style={styles.inputContainer}>
          <Ionicons name="person-outline" size={20} color="#666" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Nom d'utilisateur"
            value={formData.username}
            onChangeText={(text) => setFormData({ ...formData, username: text })}
            autoCapitalize="words"
          />
        </View>

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
            value={formData.password}
            onChangeText={(text) => setFormData({ ...formData, password: text })}
            secureTextEntry
          />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="calendar-outline" size={20} color="#666" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Date de naissance (YYYY-MM-DD)"
            value={formData.birthdate}
            onChangeText={(text) => setFormData({ ...formData, birthdate: text })}
          />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="call-outline" size={20} color="#666" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Numéro de téléphone (optionnel)"
            value={formData.phone}
            onChangeText={(text) => setFormData({ ...formData, phone: text })}
            keyboardType="phone-pad"
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
            <Text style={styles.submitButtonText}>S'inscrire</Text>
          )}
        </TouchableOpacity>

        <View style={styles.linkContainer}>
          <Text style={styles.linkText}>Déjà un compte ? </Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/connexion')}>
            <Text style={styles.link}>Se connecter</Text>
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
}); 