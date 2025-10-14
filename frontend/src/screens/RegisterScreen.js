import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Title, Card, RadioButton, Text, useTheme } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';

export default function RegisterScreen({ navigation, route }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    role: 'donor',
    name: '',
    bloodType: 'A+',
    hospital: '',
    phone: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const { register, loading } = useAuth();
  const theme = useTheme();

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleRegister = async () => {
    // Validation basique
    if (!formData.email || !formData.password) {
      alert('Email et mot de passe sont requis');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      alert('Les mots de passe ne correspondent pas');
      return;
    }

    if (formData.role === 'donor' && (!formData.name || !formData.bloodType)) {
      alert('Nom et type sanguin sont requis pour les donneurs');
      return;
    }

    if (formData.role === 'doctor' && !formData.hospital) {
      alert('Le nom de l\'hôpital est requis pour les médecins');
      return;
    }

    const userData = { ...formData };
    delete userData.confirmPassword;

    await register(userData, navigation);
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
              <Text style={styles.headerIcon}>👤</Text>
              <Title style={styles.title}>Créer un compte</Title>
              <Text style={styles.subtitle}>
                Rejoignez la communauté BloodLink
              </Text>
            </View>

            {/* Sélection du rôle */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Je suis :</Text>
              <RadioButton.Group
                value={formData.role}
                onValueChange={value => handleChange('role', value)}
              >
                <View style={styles.radioContainer}>
                  <View style={styles.radioItem}>
                    <RadioButton value="donor" color="#2563eb" />
                    <Text style={styles.radioLabel}>Donneur</Text>
                  </View>
                  <View style={styles.radioItem}>
                    <RadioButton value="doctor" color="#dc2626" />
                    <Text style={styles.radioLabel}>Médecin</Text>
                  </View>
                </View>
              </RadioButton.Group>
            </View>

            {/* Informations de base */}
            <View style={styles.section}>
              <TextInput
                label="Email"
                value={formData.email}
                onChangeText={value => handleChange('email', value)}
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
                value={formData.password}
                onChangeText={value => handleChange('password', value)}
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

              <TextInput
                label="Confirmer le mot de passe"
                value={formData.confirmPassword}
                onChangeText={value => handleChange('confirmPassword', value)}
                mode="outlined"
                style={styles.input}
                secureTextEntry={!showPassword}
                left={<TextInput.Icon icon="lock-check" />}
                outlineColor="#e5e7eb"
                activeOutlineColor="#dc2626"
              />
            </View>

            {/* Champs spécifiques aux donneurs */}
            {formData.role === 'donor' && (
              <View style={styles.section}>
                <TextInput
                  label="Nom complet"
                  value={formData.name}
                  onChangeText={value => handleChange('name', value)}
                  mode="outlined"
                  style={styles.input}
                  left={<TextInput.Icon icon="account" />}
                  outlineColor="#e5e7eb"
                  activeOutlineColor="#2563eb"
                />

                <Text style={styles.sectionTitle}>Type sanguin :</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.bloodTypeScroll}>
                  <View style={styles.bloodTypeContainer}>
                    {bloodTypes.map(type => (
                      <Button
                        key={type}
                        mode={formData.bloodType === type ? "contained" : "outlined"}
                        onPress={() => handleChange('bloodType', type)}
                        style={[
                          styles.bloodTypeButton,
                          formData.bloodType === type && styles.bloodTypeSelected
                        ]}
                        labelStyle={styles.bloodTypeLabel}
                        compact
                      >
                        {type}
                      </Button>
                    ))}
                  </View>
                </ScrollView>
              </View>
            )}

            {/* Champs spécifiques aux médecins */}
            {formData.role === 'doctor' && (
              <View style={styles.section}>
                <TextInput
                  label="Hôpital / Clinique"
                  value={formData.hospital}
                  onChangeText={value => handleChange('hospital', value)}
                  mode="outlined"
                  style={styles.input}
                  left={<TextInput.Icon icon="hospital-building" />}
                  outlineColor="#e5e7eb"
                  activeOutlineColor="#dc2626"
                />
              </View>
            )}

            {/* Téléphone (optionnel pour tous) */}
            <View style={styles.section}>
              <TextInput
                label="Téléphone (optionnel)"
                value={formData.phone}
                onChangeText={value => handleChange('phone', value)}
                mode="outlined"
                style={styles.input}
                keyboardType="phone-pad"
                left={<TextInput.Icon icon="phone" />}
                outlineColor="#e5e7eb"
                activeOutlineColor="#dc2626"
              />
            </View>

            <Button 
              mode="contained" 
              onPress={handleRegister}
              loading={loading}
              disabled={loading}
              style={styles.registerButton}
              labelStyle={styles.registerButtonLabel}
              contentStyle={styles.buttonContent}
            >
              Créer mon compte
            </Button>

            <View style={styles.loginSection}>
              <Text style={styles.loginText}>Déjà un compte ?</Text>
              <Button 
                mode="text" 
                onPress={() => navigation.navigate('Login')}
                style={styles.loginButton}
                labelStyle={styles.loginButtonLabel}
              >
                Se connecter
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
    marginBottom: 24,
  },
  headerIcon: {
    fontSize: 48,
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
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#ffffff',
  },
  radioContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioLabel: {
    fontSize: 16,
    marginLeft: 8,
  },
  bloodTypeScroll: {
    marginHorizontal: -4,
  },
  bloodTypeContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 4,
  },
  bloodTypeButton: {
    borderRadius: 8,
  },
  bloodTypeSelected: {
    backgroundColor: '#2563eb',
  },
  bloodTypeLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  registerButton: {
    backgroundColor: '#dc2626',
    borderRadius: 12,
    marginTop: 8,
  },
  registerButtonLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  buttonContent: {
    height: 48,
  },
  loginSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  loginText: {
    fontSize: 15,
    color: '#6b7280',
    marginRight: 8,
  },
  loginButton: {
    marginLeft: -8,
  },
  loginButtonLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#dc2626',
  },
});