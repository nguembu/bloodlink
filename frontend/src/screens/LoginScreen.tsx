// screens/LoginScreen.tsx
import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Dimensions } from 'react-native';
import { TextInput, Button, Text, Card, SegmentedButtons, useTheme } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function LoginScreen({ navigation, route }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [userType, setUserType] = useState<'user' | 'bloodbank'>('user');
  const [loading, setLoading] = useState(false);
  const theme = useTheme();

  const role = route.params?.role;

  const handleLogin = async () => {
    if (!email || !password) {
      alert('Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);
    // Simuler une connexion
    setTimeout(() => {
      setLoading(false);
      alert('Fonction de connexion à implémenter');
    }, 1500);
  };

  const getButtonColor = () => {
    return userType === 'bloodbank' ? '#059669' : '#d32f2f';
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#d32f2f', '#f44336']}
        style={styles.gradientHeader}
      >
        <View style={styles.header}>
          <Text style={styles.headerIcon}>🔐</Text>
          <Text style={styles.headerTitle}>
            Connexion {role ? `- ${role === 'doctor' ? 'Médecin' : role === 'donor' ? 'Donneur' : 'Banque de Sang'}` : ''}
          </Text>
          <Text style={styles.headerSubtitle}>
            Accédez à votre espace sécurisé
          </Text>
        </View>
      </LinearGradient>

      <KeyboardAvoidingView 
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Card style={styles.loginCard} elevation={4}>
            <Card.Content>
              {/* Type de compte */}
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Type de compte</Text>
                <SegmentedButtons
                  value={userType}
                  onValueChange={setUserType}
                  buttons={[
                    {
                      value: 'user',
                      label: '👤 Utilisateur',
                      style: userType === 'user' ? styles.selectedSegment : {},
                      checkedColor: '#d32f2f',
                    },
                    {
                      value: 'bloodbank',
                      label: '🏥 Banque de Sang',
                      style: userType === 'bloodbank' ? styles.selectedSegment : {},
                      checkedColor: '#059669',
                    },
                  ]}
                  style={styles.segmentedButtons}
                />
              </View>

              {/* Formulaire */}
              <View style={styles.formSection}>
                <TextInput
                  label="Email"
                  value={email}
                  onChangeText={setEmail}
                  mode="outlined"
                  style={styles.input}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  left={<TextInput.Icon icon="email" color="#6b7280" />}
                  outlineColor="#e5e7eb"
                  activeOutlineColor={getButtonColor()}
                  theme={{ roundness: 12 }}
                />
                
                <TextInput
                  label="Mot de passe"
                  value={password}
                  onChangeText={setPassword}
                  mode="outlined"
                  style={styles.input}
                  secureTextEntry={!showPassword}
                  left={<TextInput.Icon icon="lock" color="#6b7280" />}
                  right={
                    <TextInput.Icon 
                      icon={showPassword ? "eye-off" : "eye"} 
                      onPress={() => setShowPassword(!showPassword)}
                      color="#6b7280"
                    />
                  }
                  outlineColor="#e5e7eb"
                  activeOutlineColor={getButtonColor()}
                  theme={{ roundness: 12 }}
                />

                <Button 
                  mode="contained" 
                  onPress={handleLogin}
                  loading={loading}
                  disabled={loading}
                  style={[styles.loginButton, { backgroundColor: getButtonColor() }]}
                  labelStyle={styles.loginButtonLabel}
                  contentStyle={styles.loginButtonContent}
                >
                  {userType === 'bloodbank' ? 'Connexion Banque de Sang' : 'Se connecter'}
                </Button>

                <Button 
                  mode="text" 
                  onPress={() => {}}
                  style={styles.forgotPassword}
                  labelStyle={styles.forgotPasswordLabel}
                >
                  Mot de passe oublié ?
                </Button>
              </View>

              {/* Séparateur */}
              <View style={styles.separatorContainer}>
                <View style={styles.separatorLine} />
                <Text style={styles.separatorText}>ou</Text>
                <View style={styles.separatorLine} />
              </View>

              {/* Inscription */}
              <View style={styles.registerSection}>
                <Text style={styles.registerText}>Pas encore de compte ?</Text>
                <Button 
                  mode="outlined" 
                  onPress={() => navigation.navigate('Register')}
                  style={styles.registerButton}
                  labelStyle={styles.registerButtonLabel}
                  contentStyle={styles.registerButtonContent}
                >
                  Créer un compte
                </Button>
              </View>

              {/* Info sécurité */}
              <View style={styles.securityInfo}>
                <Text style={styles.securityIcon}>🔒</Text>
                <Text style={styles.securityText}>
                  Vos données sont sécurisées et confidentielles
                </Text>
              </View>
            </Card.Content>
          </Card>

          {/* Features */}
          <View style={styles.featuresContainer}>
            <Text style={styles.featuresTitle}>Pourquoi nous choisir ?</Text>
            <View style={styles.featuresGrid}>
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>🛡️</Text>
                <Text style={styles.featureTitle}>Sécurisé</Text>
                <Text style={styles.featureDesc}>Données cryptées</Text>
              </View>
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>⚡</Text>
                <Text style={styles.featureTitle}>Rapide</Text>
                <Text style={styles.featureDesc}>Alertes instantanées</Text>
              </View>
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>❤️</Text>
                <Text style={styles.featureTitle}>Impact</Text>
                <Text style={styles.featureDesc}>Vies sauvées</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  gradientHeader: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 40,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  header: {
    alignItems: 'center',
  },
  headerIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  loginCard: {
    borderRadius: 24,
    marginBottom: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  segmentedButtons: {
    borderRadius: 12,
  },
  selectedSegment: {
    backgroundColor: 'rgba(211, 47, 47, 0.1)',
  },
  formSection: {
    marginBottom: 24,
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#ffffff',
  },
  loginButton: {
    borderRadius: 16,
    marginTop: 8,
    elevation: 2,
  },
  loginButtonLabel: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  loginButtonContent: {
    height: 52,
  },
  forgotPassword: {
    marginTop: 16,
  },
  forgotPasswordLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  separatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e5e7eb',
  },
  separatorText: {
    marginHorizontal: 16,
    color: '#9ca3af',
    fontWeight: '500',
  },
  registerSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  registerText: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 16,
  },
  registerButton: {
    borderColor: '#d32f2f',
    borderWidth: 1,
    borderRadius: 16,
  },
  registerButtonLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#d32f2f',
  },
  registerButtonContent: {
    height: 48,
  },
  securityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0fdf4',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#059669',
  },
  securityIcon: {
    marginRight: 8,
  },
  securityText: {
    fontSize: 14,
    color: '#059669',
    fontWeight: '500',
  },
  featuresContainer: {
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 20,
    elevation: 2,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 20,
  },
  featuresGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  featureItem: {
    alignItems: 'center',
    flex: 1,
  },
  featureIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  featureDesc: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
});