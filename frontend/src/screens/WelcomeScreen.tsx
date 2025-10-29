// screens/WelcomeScreen.tsx
import React from 'react';
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { Button, Text, Card, useTheme } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function WelcomeScreen({ navigation }: any) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#d32f2f', '#f44336']}
        style={styles.gradient}
      >
        
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoIcon}>🩸</Text>
            <Text style={styles.logoText}>BloodLink</Text>
          </View>
          <Text style={styles.tagline}>Sauvez des vies, donnez votre sang</Text>
        </View>

        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>Donnez du sang,{'\n'}Sauvez des vies</Text>
          <Text style={styles.heroSubtitle}>
            Rejoignez notre communauté de héros du quotidien. 
            Votre don peut faire la différence.
          </Text>
        </View>

        {/* Stats Section */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>10K+</Text>
            <Text style={styles.statLabel}>Vies sauvées</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>5K+</Text>
            <Text style={styles.statLabel}>Donneurs actifs</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>50+</Text>
            <Text style={styles.statLabel}>Hôpitaux partenaires</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Roles Selection */}
      <ScrollView 
        style={styles.rolesContainer}
        contentContainerStyle={styles.rolesContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Donneur Card */}
        <Card style={[styles.roleCard, styles.donorCard]} elevation={4}>
          <Card.Content style={styles.cardContent}>
            <View style={styles.roleIconContainer}>
              <Text style={styles.roleIcon}>🦸</Text>
            </View>
            <Text style={styles.roleTitle}>Donneur</Text>
            <Text style={styles.roleDescription}>
              Recevez des alertes urgentes et sauvez des vies près de chez vous. 
              Soyez un héros anonyme.
            </Text>
            <View style={styles.features}>
              <Text style={styles.feature}>✓ Alertes personnalisées</Text>
              <Text style={styles.feature}>✓ Historique de dons</Text>
              <Text style={styles.feature}>✓ Badges de reconnaissance</Text>
            </View>
            <Button 
              mode="contained" 
              onPress={() => navigation.navigate('Register', { role: 'donor' })}
              style={styles.roleButton}
              labelStyle={styles.buttonLabel}
              contentStyle={styles.buttonContent}
            >
              Devenir Donneur
            </Button>
          </Card.Content>
        </Card>

        {/* Médecin Card */}
        <Card style={[styles.roleCard, styles.doctorCard]} elevation={4}>
          <Card.Content style={styles.cardContent}>
            <View style={styles.roleIconContainer}>
              <Text style={styles.roleIcon}>👨‍⚕️</Text>
            </View>
            <Text style={styles.roleTitle}>Médecin</Text>
            <Text style={styles.roleDescription}>
              Lancez des alertes pour trouver des donneurs compatibles 
              et sauvez vos patients en urgence.
            </Text>
            <View style={styles.features}>
              <Text style={styles.feature}>✓ Alertes rapides</Text>
              <Text style={styles.feature}>✓ Donneurs géolocalisés</Text>
              <Text style={styles.feature}>✓ Suivi en temps réel</Text>
            </View>
            <Button 
              mode="contained" 
              onPress={() => navigation.navigate('Register', { role: 'doctor' })}
              style={styles.roleButton}
              labelStyle={styles.buttonLabel}
              contentStyle={styles.buttonContent}
            >
              Espace Médecin
            </Button>
          </Card.Content>
        </Card>

        {/* Banque de Sang Card */}
        <Card style={[styles.roleCard, styles.bloodbankCard]} elevation={4}>
          <Card.Content style={styles.cardContent}>
            <View style={styles.roleIconContainer}>
              <Text style={styles.roleIcon}>🏥</Text>
            </View>
            <Text style={styles.roleTitle}>Banque de Sang</Text>
            <Text style={styles.roleDescription}>
              Gérez votre stock, coordonnez les dons et connectez 
              médecins avec donneurs compatibles.
            </Text>
            <View style={styles.features}>
              <Text style={styles.feature}>✓ Gestion des stocks</Text>
              <Text style={styles.feature}>✓ Coordination des dons</Text>
              <Text style={styles.feature}>✓ Tableaux de bord</Text>
            </View>
            <Button 
              mode="contained" 
              onPress={() => navigation.navigate('Register', { role: 'bloodbank' })}
              style={styles.roleButton}
              labelStyle={styles.buttonLabel}
              contentStyle={styles.buttonContent}
            >
              Espace Banque
            </Button>
          </Card.Content>
        </Card>

        {/* Auth Links */}
        <View style={styles.authSection}>
          <Text style={styles.authText}>Déjà un compte ?</Text>
          <View style={styles.authButtons}>
            <Button 
              mode="text" 
              onPress={() => navigation.navigate('Login')}
              style={styles.authButton}
              labelStyle={styles.authButtonLabel}
            >
              Se connecter
            </Button>
            <Text style={styles.separator}>•</Text>
            <Button 
              mode="text" 
              onPress={() => navigation.navigate('Register')}
              style={styles.authButton}
              labelStyle={styles.authButtonLabel}
            >
              S'inscrire
            </Button>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            💡 Chaque don de sang peut sauver jusqu'à 3 vies
          </Text>
          <Text style={styles.footerSubtext}>
            Plateforme sécurisée • Don 100% anonyme • Impact réel
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  gradient: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
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
    color: '#ffffff',
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
    textAlign: 'center',
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 34,
  },
  heroSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 300,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    padding: 20,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  rolesContainer: {
    flex: 1,
  },
  rolesContent: {
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 40,
  },
  roleCard: {
    borderRadius: 24,
    marginBottom: 20,
    overflow: 'hidden',
  },
  donorCard: {
    backgroundColor: '#ffffff',
    borderLeftWidth: 6,
    borderLeftColor: '#2563eb',
  },
  doctorCard: {
    backgroundColor: '#ffffff',
    borderLeftWidth: 6,
    borderLeftColor: '#dc2626',
  },
  bloodbankCard: {
    backgroundColor: '#ffffff',
    borderLeftWidth: 6,
    borderLeftColor: '#059669',
  },
  cardContent: {
    padding: 24,
  },
  roleIconContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  roleIcon: {
    fontSize: 48,
  },
  roleTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 12,
  },
  roleDescription: {
    fontSize: 15,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  features: {
    marginBottom: 24,
  },
  feature: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 6,
    fontWeight: '500',
  },
  roleButton: {
    borderRadius: 16,
    elevation: 2,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  buttonContent: {
    height: 52,
  },
  authSection: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  authText: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 12,
  },
  authButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authButton: {
    marginHorizontal: 8,
  },
  authButtonLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#d32f2f',
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
    fontSize: 14,
    color: '#374151',
    fontWeight: '600',
    marginBottom: 6,
    textAlign: 'center',
  },
  footerSubtext: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});