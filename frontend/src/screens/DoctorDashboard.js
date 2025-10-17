import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Card, Title, Button, Text, Chip, ActivityIndicator, TextInput } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { useLocation } from '../context/LocationContext';
import { alertService } from '../services/alertService';

export default function DoctorDashboard({ navigation }) {
  const { user, logout } = useAuth();
  const { location, getCurrentLocation } = useLocation();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateAlert, setShowCreateAlert] = useState(false);
  const [newAlert, setNewAlert] = useState({
    bloodType: 'A+',
    urgency: 'medium',
    description: ''
  });

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const urgencyLevels = [
    { value: 'low', label: 'Faible', color: '#4CAF50' },
    { value: 'medium', label: 'Moyenne', color: '#FF9800' },
    { value: 'high', label: 'Élevée', color: '#F44336' },
    { value: 'critical', label: 'Critique', color: '#B71C1C' }
  ];

  const loadAlerts = async () => {
    try {
      setLoading(true);
      const response = await alertService.getMyAlerts();
      setAlerts(response.data.data.alerts || []);
    } catch (error) {
      console.error('Error loading alerts:', error);
      setAlerts([]); // Retrait des données de test
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadAlerts();
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  const createAlert = async () => {
    if (!location) {
      alert('Localisation requise pour créer une alerte');
      await getCurrentLocation();
      return;
    }

    try {
      setLoading(true);
      const alertData = {
        bloodType: newAlert.bloodType,
        hospital: user.hospital,
        location: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude
        },
        urgency: newAlert.urgency,
        description: newAlert.description
      };

      await alertService.createAlert(alertData);
      setShowCreateAlert(false);
      setNewAlert({ bloodType: 'A+', urgency: 'medium', description: '' });
      loadAlerts();
      alert('Alerte créée avec succès !');
    } catch (error) {
      console.error('Error creating alert:', error);
      alert('Erreur lors de la création de l\'alerte');
    } finally {
      setLoading(false);
    }
  };

  const cancelAlert = async (alertId) => {
    try {
      await alertService.cancelAlert(alertId);
      loadAlerts();
      alert('Alerte annulée avec succès');
    } catch (error) {
      console.error('Error cancelling alert:', error);
      alert('Erreur lors de l\'annulation de l\'alerte');
    }
  };

  const getUrgencyColor = (urgency) => {
    const level = urgencyLevels.find(u => u.value === urgency);
    return level ? level.color : '#666';
  };

  const getUrgencyLabel = (urgency) => {
    const level = urgencyLevels.find(u => u.value === urgency);
    return level ? level.label : 'Inconnue';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR') + ' à ' + date.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', minute: '2-digit' 
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        {/* Header */}
        <Card style={styles.headerCard}>
          <Card.Content>
            <View style={styles.header}>
              <View>
                <Title style={styles.welcomeTitle}>Bonjour, {user?.name || 'Docteur'}</Title>
                <Text style={styles.hospitalText}>{user?.hospital || 'Hôpital'}</Text>
              </View>
              <Button mode="outlined" onPress={() => logout(navigation)} style={styles.logoutButton}>
                Déconnexion
              </Button>
            </View>
          </Card.Content>
        </Card>

        {/* Statistiques */}
        <Card style={styles.statsCard}>
          <Card.Content>
            <Title style={styles.statsTitle}>Aperçu</Title>
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{alerts.length}</Text>
                <Text style={styles.statLabel}>Alertes actives</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {alerts.reduce((acc, alert) => acc + (alert.responses?.filter(r => r.status === 'accepted').length || 0), 0)}
                </Text>
                <Text style={styles.statLabel}>Dons confirmés</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {alerts.reduce((acc, alert) => acc + (alert.responses?.length || 0), 0)}
                </Text>
                <Text style={styles.statLabel}>Réponses totales</Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Alertes actives */}
        <Card style={styles.alertsCard}>
          <Card.Content>
            <View style={styles.alertsHeader}>
              <Title style={styles.alertsTitle}>Mes Alertes Actives</Title>
              <Button mode="contained" onPress={() => setShowCreateAlert(true)} style={styles.createAlertButton} icon="plus">
                Nouvelle Alerte
              </Button>
            </View>

            {loading ? (
              <ActivityIndicator style={styles.loader} size="large" color="#dc2626" />
            ) : alerts.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateIcon}>🩸</Text>
                <Text style={styles.emptyStateTitle}>Aucune alerte active</Text>
                <Text style={styles.emptyStateText}>Créez votre première alerte pour trouver des donneurs compatibles</Text>
              </View>
            ) : (
              alerts.map(alert => (
                <Card key={alert._id} style={styles.alertItem} mode="outlined">
                  <Card.Content>
                    <View style={styles.alertHeader}>
                      <View style={styles.alertBloodType}>
                        <Text style={styles.bloodTypeText}>{alert.bloodType}</Text>
                      </View>
                      <Chip mode="outlined" textStyle={{ color: getUrgencyColor(alert.urgency), fontWeight: '600' }} style={[styles.urgencyChip, { borderColor: getUrgencyColor(alert.urgency) }]}>
                        {getUrgencyLabel(alert.urgency)}
                      </Chip>
                    </View>
                    <Text style={styles.alertHospital}>{alert.hospital}</Text>
                    <Text style={styles.alertDate}>Créée le {formatDate(alert.createdAt)}</Text>
                    {alert.description && <Text style={styles.alertDescription}>{alert.description}</Text>}
                    <View style={styles.alertStats}>
                      <Text style={styles.alertStat}>✅ {alert.responses?.filter(r => r.status === 'accepted').length || 0} acceptés</Text>
                      <Text style={styles.alertStat}>⏳ {alert.responses?.filter(r => r.status === 'pending').length || 0} en attente</Text>
                    </View>
                    <Button mode="outlined" onPress={() => cancelAlert(alert._id)} style={styles.cancelButton} textColor="#dc2626">Annuler l'alerte</Button>
                  </Card.Content>
                </Card>
              ))
            )}
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Modal création */}
      {showCreateAlert && (
        <View style={styles.modalOverlay}>
          <Card style={styles.modalCard}>
            <Card.Content>
              <Title style={styles.modalTitle}>Nouvelle Alerte</Title>

              <Text style={styles.modalLabel}>Type sanguin requis</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.bloodTypeContainer}>
                  {bloodTypes.map(type => (
                    <Button key={type} mode={newAlert.bloodType === type ? "contained" : "outlined"} onPress={() => setNewAlert(prev => ({ ...prev, bloodType: type }))} style={styles.bloodTypeOption} compact>
                      {type}
                    </Button>
                  ))}
                </View>
              </ScrollView>

              <Text style={styles.modalLabel}>Niveau d'urgence</Text>
              <View style={styles.urgencyContainer}>
                {urgencyLevels.map(level => (
                  <Button key={level.value} mode={newAlert.urgency === level.value ? "contained" : "outlined"} onPress={() => setNewAlert(prev => ({ ...prev, urgency: level.value }))} style={[styles.urgencyOption, { borderColor: level.color }]} labelStyle={newAlert.urgency === level.value ? { color: '#fff' } : { color: level.color }} compact>
                    {level.label}
                  </Button>
                ))}
              </View>

              <Text style={styles.modalLabel}>Description (optionnel)</Text>
              <TextInput value={newAlert.description} onChangeText={(text) => setNewAlert(prev => ({ ...prev, description: text }))} mode="outlined" placeholder="Détails supplémentaires..." multiline numberOfLines={3} style={styles.descriptionInput} />

              <View style={styles.modalActions}>
                <Button mode="outlined" onPress={() => setShowCreateAlert(false)} style={styles.modalButton}>Annuler</Button>
                <Button mode="contained" onPress={createAlert} loading={loading} style={styles.modalButton}>Créer l'Alerte</Button>
              </View>
            </Card.Content>
          </Card>
        </View>
      )}
    </View>
  );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  headerCard: {
    margin: 16,
    borderRadius: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
  },
  hospitalText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 4,
  },
  logoutButton: {
    borderColor: '#dc2626',
  },
  statsCard: {
    margin: 16,
    marginTop: 0,
    borderRadius: 12,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#dc2626',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  alertsCard: {
    margin: 16,
    marginTop: 0,
    borderRadius: 12,
  },
  alertsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  alertsTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  createAlertButton: {
    backgroundColor: '#dc2626',
  },
  loader: {
    marginVertical: 20,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  alertItem: {
    marginBottom: 12,
    borderRadius: 8,
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  alertBloodType: {
    backgroundColor: '#fef2f2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  bloodTypeText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#dc2626',
  },
  urgencyChip: {
    height: 32,
  },
  alertHospital: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  alertDate: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 8,
  },
  alertDescription: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 12,
    lineHeight: 20,
  },
  alertStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  alertStat: {
    fontSize: 12,
    color: '#6b7280',
  },
  cancelButton: {
    borderColor: '#dc2626',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    borderRadius: 16,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    marginTop: 12,
  },
  bloodTypeContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  bloodTypeOption: {
    marginRight: 8,
  },
  urgencyContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  urgencyOption: {
    marginRight: 8,
    marginBottom: 8,
  },
  descriptionInput: {
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalButton: {
    flex: 1,
  },
});