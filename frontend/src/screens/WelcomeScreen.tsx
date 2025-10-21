import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Button, Text, Card } from 'react-native-paper';

export default function WelcomeScreen({ navigation }: any) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Header avec logo */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoIcon}>🩸</Text>
          <Text style={styles.logoText}>BloodLink</Text>
        </View>
        <Text style={styles.tagline}>Don de sang urgent</Text>
      </View>

      {/* Illustration */}
      <View style={styles.illustrationContainer}>
        <Text style={styles.illustration}>❤️</Text>
        <Text style={styles.illustrationText}>
          Sauvez des vies avec un simple geste
        </Text>
      </View>

      {/* Cartes de sélection de rôle */}
      <View style={styles.rolesContainer}>
        {/* Carte Médecin */}
        <Card 
          style={[styles.roleCard, styles.doctorCard]}
          onPress={() => navigation.navigate('Register', { role: 'doctor' })}
          mode="elevated"
        >
          <Card.Content style={styles.cardContent}>
            <Text style={styles.roleIcon}>👨‍⚕️</Text>
            <Text style={styles.roleTitle}>Médecin</Text>
            <Text style={styles.roleDescription}>
              Lancez des alertes pour trouver des donneurs compatibles auprès des banques de sang
            </Text>
            <Button 
              mode="contained" 
              style={styles.roleButton}
              labelStyle={styles.buttonLabel}
              onPress={() => navigation.navigate('Register', { role: 'doctor' })}
            >
              Continuer
            </Button>
          </Card.Content>
        </Card>

        {/* Carte Donneur */}
        <Card 
          style={[styles.roleCard, styles.donorCard]}
          onPress={() => navigation.navigate('Register', { role: 'donor' })}
          mode="elevated"
        >
          <Card.Content style={styles.cardContent}>
            <Text style={styles.roleIcon}>🦸</Text>
            <Text style={styles.roleTitle}>Donneur</Text>
            <Text style={styles.roleDescription}>
              Recevez des alertes des banques de sang et sauvez des vies près de chez vous
            </Text>
            <Button 
              mode="contained" 
              style={styles.roleButton}
              labelStyle={styles.buttonLabel}
              onPress={() => navigation.navigate('Register', { role: 'donor' })}
            >
              Continuer
            </Button>
          </Card.Content>
        </Card>

        {/* Carte Banque de Sang */}
        <Card 
          style={[styles.roleCard, styles.bloodbankCard]}
          onPress={() => navigation.navigate('Register', { role: 'bloodbank' })}
          mode="elevated"
        >
          <Card.Content style={styles.cardContent}>
            <Text style={styles.roleIcon}>🏥</Text>
            <Text style={styles.roleTitle}>Banque de Sang</Text>
            <Text style={styles.roleDescription}>
              Gérez votre stock de sang et coordonnez les dons entre médecins et donneurs
            </Text>
            <Button 
              mode="contained" 
              style={styles.roleButton}
              labelStyle={styles.buttonLabel}
              onPress={() => navigation.navigate('Register', { role: 'bloodbank' })}
            >
              Continuer
            </Button>
          </Card.Content>
        </Card>
      </View>

      {/* Liens d'authentification */}
      <View style={styles.authLinks}>
        <Button 
          mode="text" 
          onPress={() => navigation.navigate('Login')}
          style={styles.authLink}
          labelStyle={styles.authLinkLabel}
        >
          Connexion
        </Button>
        <Text style={styles.separator}>•</Text>
        <Button 
          mode="text" 
          onPress={() => navigation.navigate('Register')}
          style={styles.authLink}
          labelStyle={styles.authLinkLabel}
        >
          Inscription
        </Button>
      </View>

      {/* Informations supplémentaires */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Plateforme sécurisée de mise en relation donneurs - banques de sang - médecins
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
    minHeight: '100%',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  logoIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  logoText: {
    fontSize: 32,
    fontWeight: '800',
    color: '#dc2626',
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 18,
    color: '#6b7280',
    fontWeight: '500',
  },
  illustrationContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  illustration: {
    fontSize: 80,
    marginBottom: 16,
  },
  illustrationText: {
    fontSize: 16,
    color: '#4b5563',
    textAlign: 'center',
    fontWeight: '500',
    maxWidth: 200,
    lineHeight: 22,
  },
  rolesContainer: {
    gap: 20,
    marginBottom: 32,
  },
  roleCard: {
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  doctorCard: {
    backgroundColor: '#ffffff',
    borderLeftWidth: 4,
    borderLeftColor: '#dc2626',
  },
  donorCard: {
    backgroundColor: '#ffffff',
    borderLeftWidth: 4,
    borderLeftColor: '#2563eb',
  },
  bloodbankCard: {
    backgroundColor: '#ffffff',
    borderLeftWidth: 4,
    borderLeftColor: '#059669',
  },
  cardContent: {
    padding: 24,
    alignItems: 'center',
  },
  roleIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  roleTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
  },
  roleDescription: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  roleButton: {
    borderRadius: 12,
    paddingVertical: 6,
    minWidth: 120,
  },
  buttonLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  authLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  authLink: {
    marginHorizontal: 8,
  },
  authLinkLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
  },
  separator: {
    color: '#d1d5db',
    fontSize: 16,
    marginHorizontal: 4,
  },
  footer: {
    alignItems: 'center',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  footerText: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});