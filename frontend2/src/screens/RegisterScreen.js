import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Title, Card, RadioButton, Text, HelperText } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';

export default function RegisterScreen({ navigation, route }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    role: route.params?.role || 'donor',
    name: '',
    bloodType: 'A+',
    hospital: '',
    hospitalName: '',
    address: '',
    phone: '',
    cni: '',
    licenseNumber: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const { register, loading } = useAuth();

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Effacer l'erreur quand l'utilisateur tape
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validation email
    if (!formData.email) {
      newErrors.email = 'L\'email est requis';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Format d\'email invalide';
    }

    // Validation mot de passe
    if (!formData.password) {
      newErrors.password = 'Le mot de passe est requis';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères';
    }

    // Validation confirmation mot de passe
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }

    // Validation selon le rôle
    if (formData.role === 'donor') {
      if (!formData.name) {
        newErrors.name = 'Le nom est requis pour les donneurs';
      }
      if (!formData.bloodType) {
        newErrors.bloodType = 'Le type sanguin est requis';
      }
    }

    if (formData.role === 'doctor') {
      if (!formData.name) {
        newErrors.name = 'Le nom est requis pour les médecins';
      }
      if (!formData.hospital) {
        newErrors.hospital = 'Le nom de l\'hôpital est requis';
      }
      if (!formData.cni) {
        newErrors.cni = 'Le numéro CNI est requis';
      }
      if (!formData.licenseNumber) {
        newErrors.licenseNumber = 'Le numéro de licence est requis';
      }
    }

    if (formData.role === 'bloodbank') {
      if (!formData.hospitalName) {
        newErrors.hospitalName = 'Le nom de l\'hôpital est requis';
      }
      if (!formData.address) {
        newErrors.address = 'L\'adresse est requise';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) {
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
                  <View style={styles.radioItem}>
                    <RadioButton value="bloodbank" color="#059669" />
                    <Text style={styles.radioLabel}>Banque de Sang</Text>
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
                error={!!errors.email}
                left={<TextInput.Icon icon="email" />}
                outlineColor="#e5e7eb"
                activeOutlineColor="#dc2626"
              />
              <HelperText type="error" visible={!!errors.email}>
                {errors.email}
              </HelperText>
              
              <TextInput
                label="Mot de passe"
                value={formData.password}
                onChangeText={value => handleChange('password', value)}
                mode="outlined"
                style={styles.input}
                secureTextEntry={!showPassword}
                error={!!errors.password}
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
              <HelperText type="error" visible={!!errors.password}>
                {errors.password}
              </HelperText>

              <TextInput
                label="Confirmer le mot de passe"
                value={formData.confirmPassword}
                onChangeText={value => handleChange('confirmPassword', value)}
                mode="outlined"
                style={styles.input}
                secureTextEntry={!showPassword}
                error={!!errors.confirmPassword}
                left={<TextInput.Icon icon="lock-check" />}
                outlineColor="#e5e7eb"
                activeOutlineColor="#dc2626"
              />
              <HelperText type="error" visible={!!errors.confirmPassword}>
                {errors.confirmPassword}
              </HelperText>
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
                  error={!!errors.name}
                  left={<TextInput.Icon icon="account" />}
                  outlineColor="#e5e7eb"
                  activeOutlineColor="#2563eb"
                />
                <HelperText type="error" visible={!!errors.name}>
                  {errors.name}
                </HelperText>

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
                <HelperText type="error" visible={!!errors.bloodType}>
                  {errors.bloodType}
                </HelperText>
              </View>
            )}

            {/* Champs spécifiques aux médecins */}
            {formData.role === 'doctor' && (
              <View style={styles.section}>
                <TextInput
                  label="Nom complet"
                  value={formData.name}
                  onChangeText={value => handleChange('name', value)}
                  mode="outlined"
                  style={styles.input}
                  error={!!errors.name}
                  left={<TextInput.Icon icon="account" />}
                  outlineColor="#e5e7eb"
                  activeOutlineColor="#dc2626"
                />
                <HelperText type="error" visible={!!errors.name}>
                  {errors.name}
                </HelperText>

                <TextInput
                  label="Hôpital / Clinique"
                  value={formData.hospital}
                  onChangeText={value => handleChange('hospital', value)}
                  mode="outlined"
                  style={styles.input}
                  error={!!errors.hospital}
                  left={<TextInput.Icon icon="hospital-building" />}
                  outlineColor="#e5e7eb"
                  activeOutlineColor="#dc2626"
                />
                <HelperText type="error" visible={!!errors.hospital}>
                  {errors.hospital}
                </HelperText>

                <TextInput
                  label="Numéro CNI"
                  value={formData.cni}
                  onChangeText={value => handleChange('cni', value)}
                  mode="outlined"
                  style={styles.input}
                  error={!!errors.cni}
                  left={<TextInput.Icon icon="card-account-details" />}
                  outlineColor="#e5e7eb"
                  activeOutlineColor="#dc2626"
                />
                <HelperText type="error" visible={!!errors.cni}>
                  {errors.cni}
                </HelperText>

                <TextInput
                  label="Numéro de licence médicale"
                  value={formData.licenseNumber}
                  onChangeText={value => handleChange('licenseNumber', value)}
                  mode="outlined"
                  style={styles.input}
                  error={!!errors.licenseNumber}
                  left={<TextInput.Icon icon="certificate" />}
                  outlineColor="#e5e7eb"
                  activeOutlineColor="#dc2626"
                />
                <HelperText type="error" visible={!!errors.licenseNumber}>
                  {errors.licenseNumber}
                </HelperText>
              </View>
            )}

            {/* Champs spécifiques aux banques de sang */}
            {formData.role === 'bloodbank' && (
              <View style={styles.section}>
                <TextInput
                  label="Nom de l'hôpital"
                  value={formData.hospitalName}
                  onChangeText={value => handleChange('hospitalName', value)}
                  mode="outlined"
                  style={styles.input}
                  error={!!errors.hospitalName}
                  left={<TextInput.Icon icon="hospital-building" />}
                  outlineColor="#e5e7eb"
                  activeOutlineColor="#059669"
                />
                <HelperText type="error" visible={!!errors.hospitalName}>
                  {errors.hospitalName}
                </HelperText>

                <TextInput
                  label="Adresse complète"
                  value={formData.address}
                  onChangeText={value => handleChange('address', value)}
                  mode="outlined"
                  style={styles.input}
                  error={!!errors.address}
                  multiline
                  numberOfLines={2}
                  left={<TextInput.Icon icon="map-marker" />}
                  outlineColor="#e5e7eb"
                  activeOutlineColor="#059669"
                />
                <HelperText type="error" visible={!!errors.address}>
                  {errors.address}
                </HelperText>
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
              style={[
                styles.registerButton,
                formData.role === 'donor' && styles.donorButton,
                formData.role === 'doctor' && styles.doctorButton,
                formData.role === 'bloodbank' && styles.bloodbankButton
              ]}
              labelStyle={styles.registerButtonLabel}
              contentStyle={styles.buttonContent}
            >
              {formData.role === 'donor' && 'Devenir Donneur'}
              {formData.role === 'doctor' && 'Créer Compte Médecin'}
              {formData.role === 'bloodbank' && 'Créer Compte Banque de Sang'}
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
    marginBottom: 8,
    backgroundColor: '#ffffff',
  },
  radioContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
  },
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
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
    borderRadius: 12,
    marginTop: 8,
  },
  donorButton: {
    backgroundColor: '#2563eb',
  },
  doctorButton: {
    backgroundColor: '#dc2626',
  },
  bloodbankButton: {
    backgroundColor: '#059669',
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