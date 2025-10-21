import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text, Card, useTheme, HelperText } from 'react-native-paper';

export default function DoctorRegisterScreen({ navigation }) {
  const theme = useTheme();
  const [formData, setFormData] = useState({
    email: '',
    hospital: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Effacer l'erreur quand l'utilisateur tape
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'L\'email professionnel est requis';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Format d\'email invalide';
    }

    if (!formData.hospital) {
      newErrors.hospital = 'Le nom de l\'hôpital est requis';
    }

    if (!formData.password) {
      newErrors.password = 'Le mot de passe est requis';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = () => {
    if (validateForm()) {
      // Logique d'inscription
      console.log('Inscription médecin:', formData);
      navigation.navigate('DoctorDashboard');
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.backIcon}>👨‍⚕️</Text>
          <Text style={styles.title}>Inscription Médecin</Text>
          <Text style={styles.subtitle}>
            Créez votre compte professionnel pour gérer les alertes de don de sang
          </Text>
        </View>

        {/* Formulaire */}
        <Card style={styles.formCard}>
          <Card.Content style={styles.formContent}>
            {/* Email professionnel */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email professionnel</Text>
              <TextInput
                value={formData.email}
                onChangeText={(value) => handleChange('email', value)}
                mode="outlined"
                style={styles.input}
                placeholder="votre.email@hopital.fr"
                keyboardType="email-address"
                autoCapitalize="none"
                error={!!errors.email}
                left={<TextInput.Icon icon="email" size={20} />}
                outlineColor="#e5e7eb"
                activeOutlineColor="#dc2626"
              />
              <HelperText type="error" visible={!!errors.email}>
                {errors.email}
              </HelperText>
            </View>

            {/* Hôpital */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Établissement médical</Text>
              <TextInput
                value={formData.hospital}
                onChangeText={(value) => handleChange('hospital', value)}
                mode="outlined"
                style={styles.input}
                placeholder="Nom de votre hôpital ou clinique"
                error={!!errors.hospital}
                left={<TextInput.Icon icon="hospital-building" size={20} />}
                outlineColor="#e5e7eb"
                activeOutlineColor="#dc2626"
              />
              <HelperText type="error" visible={!!errors.hospital}>
                {errors.hospital}
              </HelperText>
            </View>

            {/* Mot de passe */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Mot de passe</Text>
              <TextInput
                value={formData.password}
                onChangeText={(value) => handleChange('password', value)}
                mode="outlined"
                style={styles.input}
                placeholder="Minimum 6 caractères"
                secureTextEntry={!showPassword}
                error={!!errors.password}
                left={<TextInput.Icon icon="lock" size={20} />}
                right={
                  <TextInput.Icon 
                    icon={showPassword ? "eye-off" : "eye"} 
                    onPress={() => setShowPassword(!showPassword)}
                  />
                }
                outlineColor="#e5e7eb"
                activeOutlineColor="#dc2626"
              />
              <HelperText type="error" visible={!!errors.password}>
                {errors.password}
              </HelperText>
            </View>

            {/* Confirmation mot de passe */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Confirmer le mot de passe</Text>
              <TextInput
                value={formData.confirmPassword}
                onChangeText={(value) => handleChange('confirmPassword', value)}
                mode="outlined"
                style={styles.input}
                placeholder="Retapez votre mot de passe"
                secureTextEntry={!showPassword}
                error={!!errors.confirmPassword}
                left={<TextInput.Icon icon="lock-check" size={20} />}
                outlineColor="#e5e7eb"
                activeOutlineColor="#dc2626"
              />
              <HelperText type="error" visible={!!errors.confirmPassword}>
                {errors.confirmPassword}
              </HelperText>
            </View>

            {/* Bouton d'inscription */}
            <Button 
              mode="contained" 
              onPress={handleRegister}
              style={styles.registerButton}
              labelStyle={styles.registerButtonLabel}
              contentStyle={styles.buttonContent}
            >
              Créer mon compte médecin
            </Button>

            {/* Informations de sécurité */}
            <View style={styles.securityInfo}>
              <Text style={styles.securityIcon}>🔒</Text>
              <Text style={styles.securityText}>
                Vos données sont sécurisées et confidentielles
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* Lien de connexion */}
        <View style={styles.loginLinkContainer}>
          <Text style={styles.loginText}>Déjà un compte ? </Text>
          <Button 
            mode="text" 
            onPress={() => navigation.navigate('Login')}
            style={styles.loginLink}
            labelStyle={styles.loginLinkLabel}
          >
            Se connecter
          </Button>
        </View>
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
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  backIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 300,
  },
  formCard: {
    borderRadius: 16,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    marginBottom: 24,
  },
  formContent: {
    padding: 24,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#ffffff',
  },
  registerButton: {
    backgroundColor: '#dc2626',
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 24,
  },
  registerButtonLabel: {
    fontSize: 16,
    fontWeight: '600',
    paddingVertical: 4,
  },
  buttonContent: {
    height: 48,
  },
  securityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fef2f2',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#dc2626',
  },
  securityIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  securityText: {
    fontSize: 12,
    color: '#dc2626',
    fontWeight: '500',
    flex: 1,
  },
  loginLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    fontSize: 15,
    color: '#6b7280',
  },
  loginLink: {
    marginLeft: -8,
  },
  loginLinkLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#dc2626',
  },
});