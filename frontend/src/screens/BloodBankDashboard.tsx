import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Alert } from 'react-native';
import { Card, Title, Button, Text, Chip, ActivityIndicator, DataTable } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { alertService } from '../services/alertService';
import { bloodBankService } from '../services/bloodBankService';

export default function BloodBankDashboard({ navigation }: any) {
  const { bloodBank, logout } = useAuth();
  const [alerts, setAlerts] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Charger les alertes
      const alertsResponse = await alertService.getBloodBankAlerts();
      setAlerts(alertsResponse.data.data?.alerts || []);
      
      // Charger l'inventaire
      const inventoryResponse = await bloodBankService.getInventory();
      setInventory(inventoryResponse.data.data?.inventory || {});
      
    } catch (error: any) {
      console.error('Error loading data:', error);
      Alert.alert('Erreur', error.response?.data?.message || 'Erreur lors du chargement des données');
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

  const handleNotifyDonors = async (alertId: string) => {
    try {
      await alertService.notifyDonors(alertId);
      Alert.alert('Succès', 'Donneurs notifiés avec succès');
      loadData();
    } catch (error: any) {
      Alert.alert('Erreur', error.response?.data?.message || 'Erreur lors de la notification');
    }
  };

  const handleUpdateInventory = async (bloodType: string, quantity: number) => {
    try {
      const currentQuantity = inventory[bloodType] || 0;
      const newQuantity = currentQuantity + quantity;
      
      if (newQuantity < 0) {
        Alert.alert('Erreur', 'La quantité ne peut pas être négative');
        return;
      }

      await bloodBankService.updateInventory(bloodType, quantity);
      Alert.alert('Succès', 'Inventaire mis à jour');
      loadData();
    } catch (error: any) {
      Alert.alert('Erreur', error.response?.data?.message || 'Erreur lors de la mise à jour de l\'inventaire');
    }
  };

  const getAlertStatusColor = (status: string) => {
    const colors: any = {
      pending: '#FFA000',
      approved: '#4CAF50',
      rejected: '#F44336',
      fulfilled: '#2196F3',
      cancelled: '#9E9E9E'
    };
    return colors[status] || '#666';
  };

  const getUrgencyColor = (urgency: string) => {
    const colors: any = {
      low: '#4CAF50',
      medium: '#FF9800',
      high: '#F44336',
      critical: '#B71C1C'
    };
    return colors[urgency] || '#666';
  };

  const getStockColor = (quantity: number) => {
    if (quantity === 0) return '#F44336';
    if (quantity <= 2) return '#FF9800';
    return '#4CAF50';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={['#dc2626']}
          />
        }
      >
        
        {/* En-tête */}
        <Card style={styles.headerCard}>
          <Card.Content>
            <View style={styles.header}>
              <View style={styles.headerInfo}>
                <Title style={styles.welcomeTitle}>Banque de Sang</Title>
                <Text style={styles.hospitalText}>{bloodBank?.hospitalName}</Text>
                <Text style={styles.addressText}>{bloodBank?.address}</Text>
                <Text style={styles.contactText}>📞 {bloodBank?.phone}</Text>
                <Text style={styles.contactText}>✉️ {bloodBank?.email}</Text>
              </View>
              <Button 
                mode="outlined" 
                onPress={() => logout(navigation)}
                style={styles.logoutButton}
                labelStyle={styles.logoutButtonLabel}
              >
                Déconnexion
              </Button>
            </View>
          </Card.Content>
        </Card>

        {/* Inventaire de sang */}
        <Card style={styles.inventoryCard}>
          <Card.Content>
            <View style={styles.sectionHeader}>
              <Title style={styles.sectionTitle}>Stock de Sang</Title>
              <Button 
                mode="text" 
                onPress={loadData}
                loading={loading}
                compact
              >
                Actualiser
              </Button>
            </View>
            
            <DataTable>
              <DataTable.Header>
                <DataTable.Title style={styles.tableHeader}>Type</DataTable.Title>
                <DataTable.Title numeric style={styles.tableHeader}>Quantité</DataTable.Title>
                <DataTable.Title style={styles.tableHeader}>Actions</DataTable.Title>
              </DataTable.Header>
              
              {bloodTypes.map(type => (
                <DataTable.Row key={type} style={styles.tableRow}>
                  <DataTable.Cell>
                    <View style={styles.bloodTypeBadge}>
                      <Text style={styles.bloodTypeText}>{type}</Text>
                    </View>
                  </DataTable.Cell>
                  <DataTable.Cell numeric>
                    <Text style={[
                      styles.quantity, 
                      { color: getStockColor(inventory[type] || 0) }
                    ]}>
                      {inventory[type] || 0} unité(s)
                    </Text>
                  </DataTable.Cell>
                  <DataTable.Cell>
                    <View style={styles.inventoryActions}>
                      <Button 
                        mode="outlined" 
                        compact
                        onPress={() => handleUpdateInventory(type, -1)}
                        disabled={(inventory[type] || 0) <= 0}
                        style={styles.inventoryButton}
                        labelStyle={styles.inventoryButtonLabel}
                      >
                        -1
                      </Button>
                      <Button 
                        mode="contained" 
                        compact
                        onPress={() => handleUpdateInventory(type, 1)}
                        style={styles.inventoryButton}
                        labelStyle={styles.inventoryButtonLabel}
                      >
                        +1
                      </Button>
                    </View>
                  </DataTable.Cell>
                </DataTable.Row>
              ))}
            </DataTable>

            {/* Légende du stock */}
            <View style={styles.legendContainer}>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: '#F44336' }]} />
                <Text style={styles.legendText}>Stock épuisé</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: '#FF9800' }]} />
                <Text style={styles.legendText}>Stock faible</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: '#4CAF50' }]} />
                <Text style={styles.legendText}>Stock bon</Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Alertes en attente */}
        <Card style={styles.alertsCard}>
          <Card.Content>
            <View style={styles.sectionHeader}>
              <Title style={styles.sectionTitle}>Demandes de Sang</Title>
              <Text style={styles.alertsCount}>
                {alerts.length} demande(s)
              </Text>
            </View>
            
            {loading ? (
              <ActivityIndicator style={styles.loader} size="large" color="#dc2626" />
            ) : alerts.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateIcon}>🩸</Text>
                <Text style={styles.emptyStateTitle}>Aucune demande</Text>
                <Text style={styles.emptyStateText}>
                  Aucune demande de sang en attente pour le moment
                </Text>
              </View>
            ) : (
              alerts.map(alert => {
                const acceptedResponses = alert.responses?.filter((r: any) => r.status === 'accepted') || [];
                const canNotifyDonors = (!inventory[alert.bloodType] || inventory[alert.bloodType] < alert.quantity) && 
                                       alert.status === 'pending';

                return (
                  <Card key={alert._id} style={styles.alertItem} mode="outlined">
                    <Card.Content>
                      <View style={styles.alertHeader}>
                        <View style={styles.alertBloodType}>
                          <Text style={styles.alertBloodTypeText}>{alert.bloodType}</Text>
                        </View>
                        <View style={styles.alertStatusContainer}>
                          <Chip 
                            mode="outlined"
                            style={[
                              styles.urgencyChip, 
                              { borderColor: getUrgencyColor(alert.urgency) }
                            ]}
                            textStyle={{ color: getUrgencyColor(alert.urgency) }}
                          >
                            {alert.urgency}
                          </Chip>
                          <Chip 
                            mode="outlined"
                            style={[
                              styles.statusChip, 
                              { borderColor: getAlertStatusColor(alert.status) }
                            ]}
                            textStyle={{ color: getAlertStatusColor(alert.status) }}
                          >
                            {alert.status}
                          </Chip>
                        </View>
                      </View>
                      
                      <Text style={styles.alertDoctor}>
                        🩺 Dr {alert.doctor?.name} - {alert.doctor?.hospital}
                      </Text>
                      <Text style={styles.alertQuantity}>
                        📦 Quantité demandée: {alert.quantity} unité(s)
                      </Text>
                      
                      {alert.patientInfo?.name && (
                        <Text style={styles.alertPatient}>
                          👤 Patient: {alert.patientInfo.name}
                          {alert.patientInfo.condition && ` - ${alert.patientInfo.condition}`}
                        </Text>
                      )}
                      
                      <Text style={styles.alertDate}>
                        📅 Créée le: {formatDate(alert.createdAt)}
                      </Text>
                      
                      {/* Actions */}
                      <View style={styles.alertActions}>
                        {canNotifyDonors && (
                          <Button 
                            mode="contained" 
                            onPress={() => handleNotifyDonors(alert._id)}
                            style={styles.notifyButton}
                            labelStyle={styles.notifyButtonLabel}
                            icon="bell"
                          >
                            Notifier Donneurs
                          </Button>
                        )}
                        
                        {alert.status === 'fulfilled' && (
                          <View style={styles.fulfilledBadge}>
                            <Text style={styles.fulfilledText}>✅ Demande satisfaite</Text>
                          </View>
                        )}
                      </View>
                      
                      {/* Réponses des donneurs */}
                      {acceptedResponses.length > 0 && (
                        <View style={styles.responsesContainer}>
                          <Text style={styles.responsesTitle}>
                            {acceptedResponses.length} donneur(s) ont accepté
                          </Text>
                          <View style={styles.donorsList}>
                            {acceptedResponses.map((response: any, index: number) => (
                              <Text key={index} style={styles.donorText}>
                                • Donneur disponible
                              </Text>
                            ))}
                          </View>
                        </View>
                      )}
                    </Card.Content>
                  </Card>
                );
              })
            )}
          </Card.Content>
        </Card>

        {/* Statistiques */}
        <Card style={styles.statsCard}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Aperçu</Title>
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {alerts.filter(a => a.status === 'pending').length}
                </Text>
                <Text style={styles.statLabel}>En attente</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {alerts.filter(a => a.status === 'fulfilled').length}
                </Text>
                <Text style={styles.statLabel}>Satisfaites</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {Object.values(inventory).reduce((sum: number, qty: any) => sum + (qty || 0), 0)}
                </Text>
                <Text style={styles.statLabel}>Stock total</Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Espace en bas */}
        <View style={styles.bottomSpace} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f8fafc' 
  },
  headerCard: { 
    margin: 16, 
    marginBottom: 8, 
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'flex-start' 
  },
  headerInfo: {
    flex: 1,
  },
  welcomeTitle: { 
    fontSize: 22, 
    fontWeight: '700',
    color: '#dc2626',
    marginBottom: 4,
  },
  hospitalText: { 
    fontSize: 16, 
    color: '#1f2937', 
    fontWeight: '600',
    marginBottom: 2,
  },
  addressText: { 
    fontSize: 14, 
    color: '#6b7280', 
    marginBottom: 2,
  },
  contactText: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 1,
  },
  logoutButton: {
    borderColor: '#dc2626',
  },
  logoutButtonLabel: {
    color: '#dc2626',
    fontSize: 12,
  },
  inventoryCard: { 
    margin: 16, 
    marginVertical: 8, 
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: { 
    fontSize: 18, 
    fontWeight: '600',
    color: '#1f2937',
  },
  tableHeader: {
    backgroundColor: '#f3f4f6',
  },
  tableRow: {
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  bloodTypeBadge: {
    backgroundColor: '#fef2f2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  bloodTypeText: { 
    fontSize: 14, 
    fontWeight: '700', 
    color: '#dc2626' 
  },
  quantity: { 
    fontWeight: '600',
    fontSize: 14,
  },
  inventoryActions: { 
    flexDirection: 'row', 
    gap: 8,
  },
  inventoryButton: {
    minWidth: 50,
  },
  inventoryButtonLabel: {
    fontSize: 12,
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 10,
    color: '#6b7280',
  },
  alertsCard: { 
    margin: 16, 
    marginVertical: 8, 
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  alertsCount: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  loader: { 
    marginVertical: 40 
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
    color: '#6b7280',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 20,
  },
  alertItem: { 
    marginBottom: 12, 
    borderRadius: 12,
    borderColor: '#e5e7eb',
  },
  alertHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  alertBloodType: { 
    backgroundColor: '#fef2f2', 
    paddingHorizontal: 16, 
    paddingVertical: 8, 
    borderRadius: 8 
  },
  alertBloodTypeText: { 
    fontSize: 16, 
    fontWeight: '700', 
    color: '#dc2626' 
  },
  alertStatusContainer: {
    alignItems: 'flex-end',
    gap: 4,
  },
  urgencyChip: {
    height: 28,
  },
  statusChip: {
    height: 28,
  },
  alertDoctor: { 
    fontSize: 14, 
    color: '#374151', 
    marginBottom: 4,
    fontWeight: '500',
  },
  alertQuantity: { 
    fontSize: 14, 
    color: '#374151', 
    marginBottom: 4,
  },
  alertPatient: { 
    fontSize: 14, 
    color: '#374151', 
    marginBottom: 4,
  },
  alertDate: { 
    fontSize: 12, 
    color: '#9ca3af', 
    marginBottom: 12,
  },
  alertActions: {
    marginTop: 8,
  },
  notifyButton: {
    backgroundColor: '#dc2626',
  },
  notifyButtonLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  fulfilledBadge: {
    backgroundColor: '#f0fdf4',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  fulfilledText: {
    color: '#059669',
    fontWeight: '600',
    fontSize: 14,
  },
  responsesContainer: { 
    marginTop: 12, 
    paddingTop: 12, 
    borderTopWidth: 1, 
    borderTopColor: '#f3f4f6' 
  },
  responsesTitle: { 
    fontSize: 12, 
    color: '#6b7280',
    fontWeight: '600',
    marginBottom: 6,
  },
  donorsList: {
    gap: 2,
  },
  donorText: {
    fontSize: 12,
    color: '#059669',
  },
  statsCard: { 
    margin: 16, 
    marginVertical: 8, 
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  statsContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-around' 
  },
  statItem: { 
    alignItems: 'center' 
  },
  statNumber: { 
    fontSize: 24, 
    fontWeight: '700', 
    color: '#dc2626' 
  },
  statLabel: { 
    fontSize: 12, 
    color: '#6b7280', 
    marginTop: 4,
    fontWeight: '500',
  },
  bottomSpace: {
    height: 20,
  },
});