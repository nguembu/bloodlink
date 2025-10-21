import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Card, Title, Button, Text, Chip, ActivityIndicator, TextInput, DataTable } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { alertService } from '../services/alertService';

export default function DoctorDashboard({ navigation }: any) {
  const { user, logout } = useAuth();
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateAlert, setShowCreateAlert] = useState(false);
  const [newAlert, setNewAlert] = useState({
    bloodType: 'A+',
    quantity: 1,
    urgency: 'medium',
    patientInfo: {
      name: '',
      condition: ''
    }
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
      setAlerts(response.data.data?.alerts || []);
    } catch (error) {
      console.error('Error loading alerts:', error);
      setAlerts([]);
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
    try {
      setLoading(true);
      await alertService.createAlert(newAlert);
      setShowCreateAlert(false);
      setNewAlert({
        bloodType: 'A+',
        quantity: 1,
        urgency: 'medium',
        patientInfo: { name: '', condition: '' }
      });
      loadAlerts();
      alert('Alerte créée avec succès !');
    } catch (error: any) {
      console.error('Error creating alert:', error);
      alert(error.response?.data?.message || 'Erreur création alerte');
    } finally {
      setLoading(false);
    }
  };

  const cancelAlert = async (alertId: string) => {
    try {
      await alertService.cancelAlert(alertId);
      loadAlerts();
      alert('Alerte annulée avec succès');
    } catch (error) {
      console.error('Error cancelling alert:', error);
      alert('Erreur lors de l\'annulation');
    }
  };

  const getUrgencyColor = (urgency: string) => {
    const level = urgencyLevels.find(u => u.value === urgency);
    return level ? level.color : '#666';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const getStatusColor = (status: string) => {
    const colors: any = {
      pending: '#FFA000',
      approved: '#4CAF50',
      rejected: '#F44336',
      fulfilled: '#2196F3',
      cancelled: '#9E9E9E'
    };
    return colors[status] || '#666';
  };

  return (
    <View style={styles.container}>
      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        
        {/* Header */}
        <Card style={styles.headerCard}>
          <Card.Content>
            <View style={styles.header}>
              <View>
                <Title style={styles.welcomeTitle}>Bonjour, Dr {user?.name}</Title>
                <Text style={styles.hospitalText}>{user?.hospital}</Text>
              </View>
              <Button mode="outlined" onPress={() => logout(navigation)}>
                Déconnexion
              </Button>
            </View>
          </Card.Content>
        </Card>

        {/* Actions rapides */}
        <Card style={styles.actionsCard}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Actions Rapides</Title>
            <Button 
              mode="contained" 
              onPress={() => setShowCreateAlert(true)}
              style={styles.createButton}
              icon="alert"
            >
              Nouvelle Alerte
            </Button>
          </Card.Content>
        </Card>

        {/* Statistiques */}
        <Card style={styles.statsCard}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Statistiques</Title>
            <DataTable>
              <DataTable.Header>
                <DataTable.Title>Statut</DataTable.Title>
                <DataTable.Title numeric>Nombre</DataTable.Title>
              </DataTable.Header>
              <DataTable.Row>
                <DataTable.Cell>En attente</DataTable.Cell>
                <DataTable.Cell numeric>{alerts.filter(a => a.status === 'pending').length}</DataTable.Cell>
              </DataTable.Row>
              <DataTable.Row>
                <DataTable.Cell>Approuvées</DataTable.Cell>
                <DataTable.Cell numeric>{alerts.filter(a => a.status === 'approved').length}</DataTable.Cell>
              </DataTable.Row>
              <DataTable.Row>
                <DataTable.Cell>Réalisées</DataTable.Cell>
                <DataTable.Cell numeric>{alerts.filter(a => a.status === 'fulfilled').length}</DataTable.Cell>
              </DataTable.Row>
            </DataTable>
          </Card.Content>
        </Card>

        {/* Alertes récentes */}
        <Card style={styles.alertsCard}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Mes Alertes</Title>
            
            {loading ? (
              <ActivityIndicator style={styles.loader} />
            ) : alerts.length === 0 ? (
              <Text style={styles.emptyText}>Aucune alerte créée</Text>
            ) : (
              alerts.map(alert => (
                <Card key={alert._id} style={styles.alertItem} mode="outlined">
                  <Card.Content>
                    <View style={styles.alertHeader}>
                      <View style={styles.alertBloodType}>
                        <Text style={styles.bloodTypeText}>{alert.bloodType}</Text>
                      </View>
                      <Chip 
                        textStyle={{ color: getUrgencyColor(alert.urgency) }}
                        style={[styles.statusChip, { borderColor: getUrgencyColor(alert.urgency) }]}
                      >
                        {alert.urgency}
                      </Chip>
                      <Chip 
                        textStyle={{ color: getStatusColor(alert.status) }}
                        style={[styles.statusChip, { borderColor: getStatusColor(alert.status) }]}
                      >
                        {alert.status}
                      </Chip>
                    </View>
                    
                    <Text style={styles.alertInfo}>
                      Quantité: {alert.quantity} unité(s)
                    </Text>
                    <Text style={styles.alertDate}>
                      Créée le: {formatDate(alert.createdAt)}
                    </Text>
                    
                    {alert.status === 'pending' && (
                      <Button 
                        mode="outlined" 
                        onPress={() => cancelAlert(alert._id)}
                        style={styles.cancelButton}
                      >
                        Annuler
                      </Button>
                    )}
                  </Card.Content>
                </Card>
              ))
            )}
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Modal création d'alerte */}
      {showCreateAlert && (
        <View style={styles.modalOverlay}>
          <Card style={styles.modalCard}>
            <Card.Content>
              <Title style={styles.modalTitle}>Nouvelle Demande de Sang</Title>

              <Text style={styles.modalLabel}>Type sanguin requis</Text>
              <ScrollView horizontal>
                <View style={styles.bloodTypeContainer}>
                  {bloodTypes.map(type => (
                    <Button 
                      key={type}
                      mode={newAlert.bloodType === type ? "contained" : "outlined"}
                      onPress={() => setNewAlert(prev => ({ ...prev, bloodType: type }))}
                      style={styles.bloodTypeOption}
                    >
                      {type}
                    </Button>
                  ))}
                </View>
              </ScrollView>

              <TextInput
                label="Quantité (unités)"
                value={newAlert.quantity.toString()}
                onChangeText={(text) => setNewAlert(prev => ({ ...prev, quantity: parseInt(text) || 1 }))}
                mode="outlined"
                keyboardType="numeric"
                style={styles.input}
              />

              <Text style={styles.modalLabel}>Urgence</Text>
              <View style={styles.urgencyContainer}>
                {urgencyLevels.map(level => (
                  <Button
                    key={level.value}
                    mode={newAlert.urgency === level.value ? "contained" : "outlined"}
                    onPress={() => setNewAlert(prev => ({ ...prev, urgency: level.value }))}
                    style={styles.urgencyOption}
                  >
                    {level.label}
                  </Button>
                ))}
              </View>

              <TextInput
                label="Nom du patient"
                value={newAlert.patientInfo.name}
                onChangeText={(text) => setNewAlert(prev => ({ 
                  ...prev, 
                  patientInfo: { ...prev.patientInfo, name: text }
                }))}
                mode="outlined"
                style={styles.input}
              />

              <TextInput
                label="Condition du patient"
                value={newAlert.patientInfo.condition}
                onChangeText={(text) => setNewAlert(prev => ({ 
                  ...prev, 
                  patientInfo: { ...prev.patientInfo, condition: text }
                }))}
                mode="outlined"
                multiline
                style={styles.input}
              />

              <View style={styles.modalActions}>
                <Button mode="outlined" onPress={() => setShowCreateAlert(false)}>
                  Annuler
                </Button>
                <Button mode="contained" onPress={createAlert} loading={loading}>
                  Créer l'Alerte
                </Button>
              </View>
            </Card.Content>
          </Card>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  headerCard: { margin: 16, borderRadius: 12 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  welcomeTitle: { fontSize: 20, fontWeight: '700' },
  hospitalText: { fontSize: 16, color: '#666' },
  actionsCard: { margin: 16, marginTop: 0, borderRadius: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 16 },
  createButton: { backgroundColor: '#dc2626' },
  statsCard: { margin: 16, marginTop: 0, borderRadius: 12 },
  alertsCard: { margin: 16, marginTop: 0, borderRadius: 12 },
  loader: { marginVertical: 20 },
  emptyText: { textAlign: 'center', color: '#666', fontStyle: 'italic' },
  alertItem: { marginBottom: 12, borderRadius: 8 },
  alertHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  alertBloodType: { backgroundColor: '#fef2f2', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  bloodTypeText: { fontSize: 16, fontWeight: '700', color: '#dc2626' },
  statusChip: { height: 32 },
  alertInfo: { fontSize: 14, color: '#666', marginBottom: 4 },
  alertDate: { fontSize: 12, color: '#999', marginBottom: 8 },
  cancelButton: { borderColor: '#dc2626' },
  modalOverlay: { 
    position: 'absolute', 
    top: 0, left: 0, right: 0, bottom: 0, 
    backgroundColor: 'rgba(0,0,0,0.5)', 
    justifyContent: 'center', 
    padding: 20 
  },
  modalCard: { borderRadius: 16 },
  modalTitle: { fontSize: 20, fontWeight: '700', marginBottom: 20, textAlign: 'center' },
  modalLabel: { fontSize: 14, fontWeight: '600', marginBottom: 8, marginTop: 12 },
  bloodTypeContainer: { flexDirection: 'row', marginBottom: 16 },
  bloodTypeOption: { marginRight: 8 },
  input: { marginBottom: 16 },
  urgencyContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16 },
  urgencyOption: { marginRight: 8, marginBottom: 8 },
  modalActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 }
});