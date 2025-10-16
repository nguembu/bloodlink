import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🚑 BloodLink</Text>
      <Text style={styles.subtitle}>Don de sang urgent</Text>
      <Text>Application en cours de développement</Text>
      <Text>Bienvenue !</Text>
    </View>
  );
}
import DoctorRegisterScreen from './src/screens/DoctorRegisterScreen';

// Ajoutez cette route dans le Stack.Navigator :
<Stack.Screen 
  name="DoctorRegister" 
  component={DoctorRegisterScreen}
  options={{ title: 'Inscription Médecin' }}
/>

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#d32f2f',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 20,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
  },
});
