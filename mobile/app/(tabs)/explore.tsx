import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Image } from 'expo-image';

export default function ExploreScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image
        source={require('../../assets/cocologo.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.title}>C'est quoi le covoiturage ?</Text>
      <Text style={styles.text}>
        Le covoiturage consiste à partager un trajet en voiture entre plusieurs personnes, généralement pour réduire les coûts, limiter l'impact environnemental et favoriser la convivialité. Une personne propose un trajet et d'autres peuvent réserver une place pour voyager ensemble.
      </Text>
      <Text style={styles.title}>Comment ça marche ?</Text>
      <Text style={styles.text}>
        1. Le conducteur publie un trajet avec les détails (départ, destination, date, etc.).{"\n"}
        2. Les passagers recherchent un trajet qui leur convient et réservent leur place.{"\n"}
        3. Le jour du départ, tout le monde se retrouve au point de rendez-vous et partage le trajet !
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    padding: 24,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  text: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 12,
  },
});
