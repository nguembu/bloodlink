import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Title, Card, Text, SegmentedButtons } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen({ navigation, route }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [userType, setUserType] = useState<'user' | 'bloodbank'>('user');
  const { login, loading } = useAuth();

  const role = route.params?.role;

  const handleLogin = async () => {
    if (!email || !password) {
      alert('Veuillez remplir tous les champs');
      return;
    }

    await login(email, password, userType, navigation);
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.header}>
              <Text style={styles.headerIcon}>🔐</Text>
              <Title style={styles.title}>
                Connexion
              </Title>
              <Text style={styles.subtitle}>
                Accédez à votre compte BloodLink
              </Text>
            </View>

            {/* Sélection du type d'utilisateur */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Type de compte :</Text>
              <SegmentedButtons
                value={userType}
                onValueChange={setUserType}
                buttons={[
                  {
                    value: 'user',
                    label: 'Utilisateur',
                    icon: 'account',
                    style: userType === 'user' ? styles.selectedSegment : {}
                  },
                  {
                    value: 'bloodbank',
                    label: 'Banque de Sang',
                    icon: 'hospital',
                    style: userType === 'bloodbank' ? styles.selectedSegment : {}
                  },
                ]}
                style={styles.segmentedButtons}
              />
            </View>
            
            <TextInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              mode="outlined"
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
              left={<TextInput.Icon icon="email" />}
              outlineColor="#e5e7eb"
              activeOutlineColor="#dc2626"
            />
            
            <TextInput
              label="Mot de passe"
              value={password}
              onChangeText={setPassword}
              mode="outlined"
              style={styles.input}
              secureTextEntry={!showPassword}
              left={<TextInput.Icon icon="lock" />}
              right={
                <TextInput.Icon 
                  icon={showPassword ? "eye-off" : "eye"} 
                  onPress={() => setShowPassword(!showPassword)}
                />
              }
              outlineColor="#e5e7eb"
              activeOutlineColor="#dc2626"
            />
            
            <Button 
              mode="contained" 
              onPress={handleLogin}
              loading={loading}
              disabled={loading}
              style={[
                styles.loginButton,
                userType === 'bloodbank' ? styles.bloodbankButton : styles.userButton
              ]}
              labelStyle={styles.buttonLabel}
              contentStyle={styles.buttonContent}
            >
              {userType === 'bloodbank' ? 'Connexion Banque de Sang' : 'Se connecter'}
            </Button>

            <View style={styles.registerSection}>
              <Text style={styles.registerText}>Pas de compte ?</Text>
              <Button 
                mode="text" 
                onPress={() => navigation.navigate('Register')}
                style={styles.registerButton}
                labelStyle={styles.registerButtonLabel}
              >
                S'inscrire
              </Button>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    borderRadius: 16,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  headerIcon: {
    fontSize: 40,
    marginBottom: 16,
  },
  title: {
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    fontSize: 16,
    color: '#6b7280',
    lineHeight: 22,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  segmentedButtons: {
    marginBottom: 8,
  },
  selectedSegment: {
    backgroundColor: '#dc2626',
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#ffffff',
  },
  loginButton: {
    marginTop: 10,
    borderRadius: 12,
  },
  userButton: {
    backgroundColor: '#2563eb',
  },
  bloodbankButton: {
    backgroundColor: '#059669',
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  buttonContent: {
    height: 48,
  },
  registerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  registerText: {
    fontSize: 15,
    color: '#6b7280',
    marginRight: 8,
  },
  registerButton: {
    marginLeft: -8,
  },
  registerButtonLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#dc2626',
  }
});