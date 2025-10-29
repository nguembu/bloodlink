// screens/DonorDashboard.tsx
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Linking } from 'react-native';
import { Card, Title, Button, Text, Chip, ActivityIndicator, Avatar, Menu, Divider } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { useLocation } from '../context/LocationContext';
import { alertService } from '../services/alertService';

interface DonationHistory {
  date: string;
  bloodType: string;
  location: string;
  status: string;
}

export default function DonorDashboard({ navigation }: any) {
  const { user, logout } = useAuth();
  const { location, getCurrentLocation } = useLocation();
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [donationHistory, setDonationHistory] = useState<DonationHistory[]>([]);
  const [canDonate, setCanDonate] = useState(true);
  const [nextDonationDate, setNextDonationDate] = useState<string>('');

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const loadData = async () => {
    try {
      setLoading(true);
      
      if (location) {
        const response = await alertService.getNearbyAlerts(
          location.coords.latitude,
          location.coords.longitude
        );
        setAlerts(response.data.data?.alerts || []);
      }

      // Simulation des données de don
      const mockHistory: DonationHistory[] = [
        { date: '2024-06-15', bloodType: user?.bloodType || 'O+', location: 'Hôpital Central', status: 'completed' },
        { date: '2024-03-10', bloodType: user?.bloodType || 'O+', location: 'Centre de Don', status: 'completed' },
      ];
      setDonationHistory(mockHistory);
      
      // Calculer si le donneur peut donner
      calculateDonationEligibility();
      
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const calculateDonationEligibility = () => {
    // Simulation - En réalité, vous devriez avoir cette info dans la base de données
    const lastDonation = new Date('2024-06-15');
    const today = new Date();
    const monthsDiff = (today.getTime() - lastDonation.getTime()) / (1000 * 60 * 60 * 24 * 30);
    
    // Hommes: 4 mois, Femmes: 3 mois (simulation)
    const requiredMonths = 4; // Supposons que c'est un homme
    setCanDonate(monthsDiff >= requiredMonths);
    
    if (!canDonate) {
      const nextDate = new Date(lastDonation);
      nextDate.setMonth(nextDate.getMonth() + requiredMonths);
      setNextDonationDate(nextDate.toLocaleDateString('fr-FR'));
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  useEffect(() => {
    loadData();
  }, [location]);

  const respondToAlert = async (alertId: string, status: string) => {
    try {
      await alertService.respondToAlert(alertId, { status });
      await loadData();
      
      if (status === 'accepted') {
        alert('🎉 Merci ! Vous avez accepté de donner votre sang.\n\nVous serez contacté par la banque de sang.');
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erreur lors de l\'envoi de votre réponse');
    }
  };

  const openMaps = (hospital: string) => {
    const query = encodeURIComponent(hospital);
    const url = `https://www.google.com/maps/search/?api=1&query=${query}`;
    Linking.openURL(url).catch(() => {
      alert('Impossible d\'ouvrir l\'application de cartes');
    });
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours} h`;
    return date.toLocaleDateString('fr-FR');
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={['#d32f2f']}
          />
        }
      >
        {/* Header avec profil */}
        <Card style={styles.headerCard}>
          <Card.Content>
            <View style={styles.header}>
              <View style={styles.profileSection}>
                <View style={styles.avatarContainer}>
                  <Avatar.Text 
                    size={70} 
                    label={getInitials(user?.name || 'U')} 
                    style={styles.avatar}
                  />
                  <View style={[styles.statusDot, { backgroundColor: canDonate ? '#4CAF50' : '#FF9800' }]} />
                </View>
                <View style={styles.profileInfo}>
                  <Title style={styles.userName}>{user?.name}</Title>
                  <View style={styles.bloodTypeBadge}>
                    <Text style={styles.bloodTypeText}>{user?.bloodType}</Text>
                  </View>
                  <View style={styles.availabilityStatus}>
                    <Text style={[
                      styles.availabilityText,
                      { color: canDonate ? '#4CAF50' : '#FF9800' }
                    ]}>
                      {canDonate ? '✅ Prêt à donner' : `⏳ Prochain don: ${nextDonationDate}`}
                    </Text>
                  </View>
                </View>
              </View>
              
              <Menu
                visible={menuVisible}
                onDismiss={() => setMenuVisible(false)}
                anchor={
                  <Button 
                    mode="text" 
                    onPress={() => setMenuVisible(true)}
                    icon="dots-vertical"
                  >
                    
                  </Button>
                }
              >
                <Menu.Item onPress={() => navigation.navigate('DonorProfile')} title="📋 Mon Profil" />
                <Menu.Item onPress={() => navigation.navigate('DonationHistory')} title="📊 Historique" />
                <Divider />
                <Menu.Item onPress={() => logout(navigation)} title="🚪 Déconnexion" />
              </Menu>
            </View>

            {location ? (
              <Text style={styles.locationText}>
                📍 {location.address || 'Localisation active'}
              </Text>
            ) : (
              <Button mode="text" onPress={getCurrentLocation} icon="map-marker">
                Activer la localisation
              </Button>
            )}
          </Card.Content>
        </Card>

        {/* Statistiques rapides */}
        <Card style={styles.statsCard}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Mes Statistiques</Title>
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{donationHistory.length}</Text>
                <Text style={styles.statLabel}>Dons effectués</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {alerts.filter(a => a.responses?.some((r: any) => r.donor === user?.id && r.status === 'accepted')).length}
                </Text>
                <Text style={styles.statLabel}>Vies sauvées</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {canDonate ? '✅' : '⏳'}
                </Text>
                <Text style={styles.statLabel}>Disponible</Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Alertes à proximité */}
        <Card style={styles.alertsCard}>
          <Card.Content>
            <View style={styles.alertsHeader}>
              <Title style={styles.sectionTitle}>🩸 Alertes Urgentes</Title>
              <Button mode="text" onPress={loadData} loading={loading}>
                Actualiser
              </Button>
            </View>

            {!location ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateIcon}>📍</Text>
                <Text style={styles.emptyStateTitle}>Localisation requise</Text>
                <Text style={styles.emptyStateText}>
                  Activez votre localisation pour voir les alertes près de chez vous
                </Text>
                <Button mode="contained" onPress={getCurrentLocation}>
                  Activer la Localisation
                </Button>
              </View>
            ) : loading ? (
              <ActivityIndicator style={styles.loader} size="large" color="#d32f2f" />
            ) : alerts.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateIcon}>🎉</Text>
                <Text style={styles.emptyStateTitle}>Aucune alerte urgente</Text>
                <Text style={styles.emptyStateText}>
                  Aucun besoin urgent de votre type sanguin dans votre zone
                </Text>
              </View>
            ) : (
              alerts.map(alert => {
                const hasResponded = alert.responses?.some((r: any) => r.donor === user?.id);
                const myResponse = alert.responses?.find((r: any) => r.donor === user?.id);

                return (
                  <Card key={alert._id} style={styles.alertItem} mode="outlined">
                    <Card.Content>
                      <View style={styles.alertHeader}>
                        <View style={styles.alertBloodType}>
                          <Text style={styles.alertBloodTypeText}>{alert.bloodType}</Text>
                        </View>
                        <Chip 
                          textStyle={{ color: getUrgencyColor(alert.urgency) }}
                          style={[styles.urgencyChip, { borderColor: getUrgencyColor(alert.urgency) }]}
                        >
                          {alert.urgency}
                        </Chip>
                      </View>
                      
                      <Text style={styles.alertHospital}>{alert.bloodBank?.hospitalName}</Text>
                      <Text style={styles.alertInfo}>
                        📦 {alert.quantity} unité(s) nécessaire(s)
                      </Text>
                      <Text style={styles.alertTime}>
                        🕒 {formatDate(alert.createdAt)}
                      </Text>

                      {hasResponded ? (
                        <View style={styles.responseStatus}>
                          <Text style={[
                            styles.responseText,
                            myResponse?.status === 'accepted' ? styles.acceptedText : styles.declinedText
                          ]}>
                            {myResponse?.status === 'accepted' ? 
                              '✅ Vous avez accepté de donner' : 
                              '❌ Vous avez décliné'
                            }
                          </Text>
                          {myResponse?.status === 'accepted' && (
                            <Button 
                              mode="contained" 
                              onPress={() => openMaps(alert.bloodBank?.hospitalName)}
                              icon="map-marker"
                              style={styles.directionsButton}
                            >
                              Itinéraire
                            </Button>
                          )}
                        </View>
                      ) : (
                        <View style={styles.responseActions}>
                          <Button 
                            mode="outlined" 
                            onPress={() => respondToAlert(alert._id, 'declined')}
                            style={styles.declineButton}
                            disabled={!canDonate}
                          >
                            Indisponible
                          </Button>
                          <Button 
                            mode="contained" 
                            onPress={() => respondToAlert(alert._id, 'accepted')}
                            style={styles.acceptButton}
                            disabled={!canDonate}
                          >
                            Je peux donner
                          </Button>
                        </View>
                      )}
                    </Card.Content>
                  </Card>
                );
              })
            )}
          </Card.Content>
        </Card>

        {/* Dernier don */}
        {donationHistory.length > 0 && (
          <Card style={styles.historyCard}>
            <Card.Content>
              <Title style={styles.sectionTitle}>📊 Mon Dernier Don</Title>
              <View style={styles.lastDonation}>
                <Text style={styles.donationDate}>
                  {new Date(donationHistory[0].date).toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </Text>
                <Text style={styles.donationLocation}>{donationHistory[0].location}</Text>
                <View style={styles.donationStatus}>
                  <Chip mode="outlined" style={styles.completedChip}>
                    ✅ Don complété
                  </Chip>
                </View>
              </View>
              <Button 
                mode="text" 
                onPress={() => navigation.navigate('DonationHistory')}
                icon="history"
              >
                Voir l'historique complet
              </Button>
            </Card.Content>
          </Card>
        )}

        {/* Actions rapides */}
        <Card style={styles.actionsCard}>
          <Card.Content>
            <Title style={styles.sectionTitle}>⚡ Actions Rapides</Title>
            <View style={styles.actionsGrid}>
              <Button 
                mode="outlined" 
                onPress={() => navigation.navigate('DonationCenters')}
                style={styles.actionButton}
                icon="hospital-building"
              >
                Centres de don
              </Button>
              <Button 
                mode="outlined" 
                onPress={() => navigation.navigate('HealthTips')}
                style={styles.actionButton}
                icon="heart-pulse"
              >
                Conseils santé
              </Button>
              <Button 
                mode="outlined" 
                onPress={() => navigation.navigate('Badges')}
                style={styles.actionButton}
                icon="trophy"
              >
                Mes badges
              </Button>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  headerCard: { margin: 16, borderRadius: 20, elevation: 4 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  profileSection: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  avatarContainer: { position: 'relative', marginRight: 16 },
  avatar: { backgroundColor: '#d32f2f' },
  statusDot: { 
    position: 'absolute', 
    bottom: 2, 
    right: 2, 
    width: 16, 
    height: 16, 
    borderRadius: 8, 
    borderWidth: 2, 
    borderColor: 'white' 
  },
  profileInfo: { flex: 1 },
  userName: { fontSize: 20, fontWeight: '700', marginBottom: 4 },
  bloodTypeBadge: { 
    backgroundColor: '#ffebee', 
    paddingHorizontal: 12, 
    paddingVertical: 4, 
    borderRadius: 12, 
    alignSelf: 'flex-start',
    marginBottom: 8
  },
  bloodTypeText: { fontSize: 14, fontWeight: '700', color: '#d32f2f' },
  availabilityStatus: { marginTop: 4 },
  availabilityText: { fontSize: 12, fontWeight: '600' },
  locationText: { fontSize: 14, color: '#666', marginTop: 12 },
  statsCard: { margin: 16, marginTop: 0, borderRadius: 20, elevation: 2 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 16, color: '#1f2937' },
  statsContainer: { flexDirection: 'row', justifyContent: 'space-around' },
  statItem: { alignItems: 'center' },
  statNumber: { fontSize: 24, fontWeight: '700', color: '#d32f2f' },
  statLabel: { fontSize: 12, color: '#666', marginTop: 4, fontWeight: '500' },
  alertsCard: { margin: 16, marginTop: 0, borderRadius: 20, elevation: 2 },
  alertsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  loader: { marginVertical: 20 },
  emptyState: { alignItems: 'center', padding: 40 },
  emptyStateIcon: { fontSize: 48, marginBottom: 16 },
  emptyStateTitle: { fontSize: 18, fontWeight: '600', marginBottom: 8, color: '#6b7280' },
  emptyStateText: { fontSize: 14, color: '#9ca3af', textAlign: 'center', marginBottom: 16, lineHeight: 20 },
  alertItem: { marginBottom: 12, borderRadius: 16 },
  alertHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  alertBloodType: { backgroundColor: '#fef2f2', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12 },
  alertBloodTypeText: { fontSize: 16, fontWeight: '700', color: '#d32f2f' },
  urgencyChip: { height: 32 },
  alertHospital: { fontSize: 16, fontWeight: '600', marginBottom: 4, color: '#1f2937' },
  alertInfo: { fontSize: 14, color: '#666', marginBottom: 4 },
  alertTime: { fontSize: 12, color: '#999', marginBottom: 12 },
  responseStatus: { alignItems: 'center' },
  responseText: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  acceptedText: { color: '#059669' },
  declinedText: { color: '#dc2626' },
  directionsButton: { backgroundColor: '#2563eb' },
  responseActions: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  declineButton: { flex: 1, marginRight: 8 },
  acceptButton: { flex: 2, backgroundColor: '#d32f2f' },
  historyCard: { margin: 16, marginTop: 0, borderRadius: 20, elevation: 2 },
  lastDonation: { marginBottom: 16 },
  donationDate: { fontSize: 16, fontWeight: '600', color: '#1f2937', marginBottom: 4 },
  donationLocation: { fontSize: 14, color: '#666', marginBottom: 8 },
  donationStatus: { marginBottom: 8 },
  completedChip: { borderColor: '#059669', alignSelf: 'flex-start' },
  actionsCard: { margin: 16, marginTop: 0, borderRadius: 20, elevation: 2 },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 8 },
  actionButton: { flex: 1, minWidth: '30%', marginBottom: 8 },
});