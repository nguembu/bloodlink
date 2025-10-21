import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Card, Title, Button, Text, Chip, ActivityIndicator, DataTable } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { alertService } from '../services/alertService';
import { bloodBankService } from '../services/bloodBankService';

export default function BloodBankDashboard({ navigation }) {
  const { user, bloodBank, logout } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [inventory, setInventory] = useState({});
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Charger les alertes
      const alertsResponse = await alertService.getBloodBankAlerts();
      setAlerts(alertsResponse.data.data.alerts || []);
      
      // Charger l'inventaire
      const inventoryResponse = await bloodBankService.getInventory();
      setInventory(inventoryResponse.data.data.inventory || {});
      
    } catch (error) {
      console.error('Erreur chargement données:', error);
      alert('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  useEffect(() => {
    loadData();
  }, []);

  const handlePropagateAlert = async (alertId) => {
    try {
      await alertService.propagateAlert(alertId);
      alert('Alerte propagée aux banques de sang voisines');
      loadData();
    } catch (error) {
      alert('Erreur lors de la propagation');
    }
  };

  const handleValidateReception = async (alertId) => {
    try {
      await alertService.validateReception(alertId);
      alert('Réception de sang validée');
      loadData();
    } catch (error) {
      alert('Erreur lors de la validation');
    }
  };

  const handleNotifyDonors = async (alertId) => {
    try {
      await alertService.notifyDonors(alertId);
      alert('Donneurs notifiés avec succès');
    } catch (error) {
      alert('Erreur lors de la notification des donneurs');
    }
  };

  const handleUpdateInventory = async (bloodType, quantity) => {
    try {
      await bloodBankService.updateInventory(bloodType, quantity);
      alert('Inventaire mis à jour');
      loadData();
    } catch (error) {
      alert('Erreur mise à jour inventaire');
    }
  };

  const getAlertStatusColor = (status) => {
    const colors = {
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
        
        {/* En-tête */}
        <Card style={styles.headerCard}>
          <Card.Content>
            <View style={styles.header}>
              <View>
                <Title style={styles.welcomeTitle}>Banque de Sang</Title>
                <Text style={styles.hospitalText}>{bloodBank?.hospitalName || user?.name}</Text>
                <Text style={styles.addressText}>{bloodBank?.address}</Text>
              </View>
              <Button mode="outlined" onPress={() => logout(navigation)}>
                Déconnexion
              </Button>
            </View>
          </Card.Content>
        </Card>

        {/* Inventaire de sang */}
        <Card style={styles.inventoryCard}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Stock de Sang</Title>
            <DataTable>
              <DataTable.Header>
                <DataTable.Title>Type</DataTable.Title>
                <DataTable.Title numeric>Quantité</DataTable.Title>
                <DataTable.Title>Action</DataTable.Title>
              </DataTable.Header>
              
              {bloodTypes.map(type => (
                <DataTable.Row key={type}>
                  <DataTable.Cell>
                    <Text style={styles.bloodType}>{type}</Text>
                  </DataTable.Cell>
                  <DataTable.Cell numeric>
                    <Text style={[
                      styles.quantity,
                      inventory[type] <= 2 && styles.lowStock
                    ]}>
                      {inventory[type] || 0} unités
                    </Text>
                  </DataTable.Cell>
                  <DataTable.Cell>
                    <Button 
                      mode="text" 
                      compact
                      onPress={() => handleUpdateInventory(type, 1)}
                    >
                      +1
                    </Button>
                  </DataTable.Cell>
                </DataTable.Row>
              ))}
            </DataTable>
          </Card.Content>
        </Card>

        {/* Alertes en attente */}
        <Card style={styles.alertsCard}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Alertes en Cours</Title>
            
            {loading ? (
              <ActivityIndicator style={styles.loader} />
            ) : alerts.length === 0 ? (
              <Text style={styles.emptyText}>Aucune alerte en cours</Text>
            ) : (
              alerts.map(alert => (
                <Card key={alert._id} style={styles.alertItem} mode="outlined">
                  <Card.Content>
                    <View style={styles.alertHeader}>
                      <View style={styles.alertBloodType}>
                        <Text style={styles.bloodTypeText}>{alert.bloodType}</Text>
                      </View>
                      <Chip 
                        textStyle={{ color: getAlertStatusColor(alert.status) }}
                        style={[styles.statusChip, { borderColor: getAlertStatusColor(alert.status) }]}
                      >
                        {alert.status}
                      </Chip>
                    </View>
                    
                    <Text style={styles.alertInfo}>
                      Médecin: {alert.doctor?.name} - {alert.doctor?.hospital}
                    </Text>
                    <Text style={styles.alertQuantity}>
                      Quantité: {alert.quantity} unité(s)
                    </Text>
                    
                    <View style={styles.alertActions}>
                      {alert.status === 'pending' && (
                        <>
                          <Button 
                            mode="outlined" 
                            onPress={() => handlePropagateAlert(alert._id)}
                            style={styles.actionButton}
                          >
                            Propager
                          </Button>
                          <Button 
                            mode="contained" 
                            onPress={() => handleNotifyDonors(alert._id)}
                            style={styles.actionButton}
                          >
                            Notifier Donneurs
                          </Button>
                        </>
                      )}
                      
                      {alert.status === 'approved' && (
                        <Button 
                          mode="contained" 
                          onPress={() => handleValidateReception(alert._id)}
                          style={styles.actionButton}
                        >
                          Valider Réception
                        </Button>
                      )}
                    </View>
                    
                    {/* Réponses des donneurs */}
                    {alert.responses && alert.responses.length > 0 && (
                      <View style={styles.responsesContainer}>
                        <Text style={styles.responsesTitle}>
                          Réponses: {alert.responses.filter(r => r.status === 'accepted').length} acceptées
                        </Text>
                      </View>
                    )}
                  </Card.Content>
                </Card>
              ))
            )}
          </Card.Content>
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  headerCard: { margin: 16, borderRadius: 12 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  welcomeTitle: { fontSize: 20, fontWeight: '700' },
  hospitalText: { fontSize: 16, color: '#666', marginTop: 4 },
  addressText: { fontSize: 14, color: '#999', marginTop: 2 },
  inventoryCard: { margin: 16, marginTop: 0, borderRadius: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 16 },
  bloodType: { fontWeight: '600' },
  quantity: { fontWeight: '600' },
  lowStock: { color: '#F44336' },
  alertsCard: { margin: 16, marginTop: 0, borderRadius: 12 },
  loader: { marginVertical: 20 },
  emptyText: { textAlign: 'center', color: '#666', fontStyle: 'italic' },
  alertItem: { marginBottom: 12, borderRadius: 8 },
  alertHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  alertBloodType: { backgroundColor: '#fef2f2', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  bloodTypeText: { fontSize: 16, fontWeight: '700', color: '#dc2626' },
  statusChip: { height: 32 },
  alertInfo: { fontSize: 14, color: '#666', marginBottom: 4 },
  alertQuantity: { fontSize: 14, color: '#666', marginBottom: 12 },
  alertActions: { flexDirection: 'row', gap: 8 },
  actionButton: { flex: 1 },
  responsesContainer: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#f0f0f0' },
  responsesTitle: { fontSize: 12, color: '#666' }
});