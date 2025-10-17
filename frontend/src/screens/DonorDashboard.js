import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Linking } from 'react-native';
import { Card, Title, Button, Text, Chip, ActivityIndicator } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { useLocation } from '../context/LocationContext';
import { alertService } from '../services/alertService';

export default function DonorDashboard({ navigation }) {
  const { user, logout } = useAuth();
  const { location, getCurrentLocation } = useLocation();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalDonations: 0,
    activeAlerts: 0,
    responseRate: 0
  });

  const loadAlerts = async () => {
    try {
      setLoading(true);
      if (location) {
        const response = await alertService.getNearbyAlerts(
          location.coords.latitude,
          location.coords.longitude
        );
        setAlerts(response.data.data.alerts || []);
      }
    } catch (error) {
      console.error('❌ Error loading alerts:', error.response?.data || error.message);
      setAlerts([]); // pas de simulation → juste vider la liste
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await alertService.getDonorStats();
      setStats(response.data.data || {
        totalDonations: 0,
        activeAlerts: 0,
        responseRate: 0
      });
    } catch (error) {
      console.error('❌ Error loading stats:', error.response?.data || error.message);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadAlerts();
    loadStats();
  };

  useEffect(() => {
    loadAlerts();
    loadStats();
  }, [location]);

  const respondToAlert = async (alertId, status) => {
    try {
      await alertService.respondToAlert(alertId, { status });
      await loadAlerts();
      await loadStats();

      if (status === 'accepted') {
        alert('Merci ! Vous avez accepté de donner votre sang. Rendez-vous à l\'hôpital indiqué.');
      } else {
        alert('Réponse enregistrée. Merci pour votre honnêteté.');
      }
    } catch (error) {
      console.error('❌ Error responding to alert:', error.response?.data || error.message);
      alert('Erreur lors de l\'envoi de votre réponse');
    }
  };

  const openMaps = (hospital) => {
    const query = encodeURIComponent(hospital);
    const url = `https://www.google.com/maps/search/?api=1&query=${query}`;
    Linking.openURL(url).catch(() => {
      alert('Impossible d\'ouvrir l\'application de cartes');
    });
  };

  const getUrgencyColor = (urgency) => {
    const colors = {
      low: '#4CAF50',
      medium: '#FF9800',
      high: '#F44336',
      critical: '#B71C1C'
    };
    return colors[urgency] || '#666';
  };

  const getUrgencyLabel = (urgency) => {
    const labels = {
      low: 'Faible',
      medium: 'Moyenne',
      high: 'Élevée',
      critical: 'Critique'
    };
    return labels[urgency] || 'Inconnue';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours} h`;
    return date.toLocaleDateString('fr-FR');
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* En-tête */}
        <Card style={styles.headerCard}>
          <Card.Content>
            <View style={styles.header}>
              <View>
                <Title style={styles.welcomeTitle}>
                  Bonjour, {user?.name || 'Donneur'}
                </Title>
                <View style={styles.bloodTypeBadge}>
                  <Text style={styles.bloodTypeText}>{user?.bloodType}</Text>
                </View>
              </View>
              <Button 
                mode="outlined" 
                onPress={() => logout(navigation)}
                style={styles.logoutButton}
              >
                Déconnexion
              </Button>
            </View>
            {location ? (
              <Text style={styles.locationText}>
                📍 Localisé à {location.address || 'proximité'}
              </Text>
            ) : (
              <Button 
                mode="text" 
                onPress={getCurrentLocation}
                style={styles.locationButton}
              >
                Activer la localisation
              </Button>
            )}
          </Card.Content>
        </Card>

        {/* Statistiques */}
        <Card style={styles.statsCard}>
          <Card.Content>
            <Title style={styles.statsTitle}>Votre Impact</Title>
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.totalDonations}</Text>
                <Text style={styles.statLabel}>Dons effectués</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.activeAlerts}</Text>
                <Text style={styles.statLabel}>Alertes actives</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.responseRate}%</Text>
                <Text style={styles.statLabel}>Taux de réponse</Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Alertes à proximité */}
        <Card style={styles.alertsCard}>
          <Card.Content>
            <View style={styles.alertsHeader}>
              <Title style={styles.alertsTitle}>Alertes à Proximité</Title>
              <Button 
                mode="text" 
                onPress={loadAlerts}
                icon="refresh"
                loading={loading}
              >
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
                <Button 
                  mode="contained" 
                  onPress={getCurrentLocation}
                  style={styles.enableLocationButton}
                >
                  Activer la Localisation
                </Button>
              </View>
            ) : loading ? (
              <ActivityIndicator style={styles.loader} size="large" color="#2563eb" />
            ) : alerts.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateIcon}>🎉</Text>
                <Text style={styles.emptyStateTitle}>Aucune alerte urgente</Text>
                <Text style={styles.emptyStateText}>
                  Aucun besoin urgent de votre type sanguin dans votre zone pour le moment
                </Text>
              </View>
            ) : (
              alerts.map(alert => (
                <Card key={alert._id} style={styles.alertItem} mode="outlined">
                  <Card.Content>
                    <View style={styles.alertHeader}>
                      <View style={styles.alertBloodType}>
                        <Text style={styles.bloodTypeText}>{alert.bloodType}</Text>
                      </View>
                      <Chip 
                        mode="outlined"
                        textStyle={{ 
                          color: getUrgencyColor(alert.urgency), 
                          fontWeight: '600',
                          fontSize: 12 
                        }}
                        style={[styles.urgencyChip, { borderColor: getUrgencyColor(alert.urgency) }]}
                      >
                        {getUrgencyLabel(alert.urgency)}
                      </Chip>
                    </View>
                    
                    <Text style={styles.alertHospital}>{alert.hospital}</Text>
                    <Text style={styles.alertDoctor}>
                      par {alert.doctor?.name || 'Médecin'}
                    </Text>
                    
                    <View style={styles.alertDetails}>
                      <Text style={styles.alertDistance}>
                        📍 {alert.distance} km
                      </Text>
                      <Text style={styles.alertTime}>
                        ⏰ {formatDate(alert.createdAt)}
                      </Text>
                    </View>

                    {alert.hasResponded ? (
                      <View style={styles.responseStatus}>
                        <Text style={[
                          styles.responseText,
                          alert.myResponse?.status === 'accepted' ? styles.acceptedText : styles.declinedText
                        ]}>
                          {alert.myResponse?.status === 'accepted' ? '✅ Vous avez accepté' : '❌ Vous avez décliné'}
                        </Text>
                        {alert.myResponse?.status === 'accepted' && (
                          <Button 
                            mode="contained" 
                            onPress={() => openMaps(alert.hospital)}
                            style={styles.directionsButton}
                            icon="map-marker"
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
                          textColor="#6b7280"
                        >
                          Indisponible
                        </Button>
                        <Button 
                          mode="contained" 
                          onPress={() => respondToAlert(alert._id, 'accepted')}
                          style={styles.acceptButton}
                        >
                          Je peux donner
                        </Button>
                      </View>
                    )}
                  </Card.Content>
                </Card>
              ))
            )}
          </Card.Content>
        </Card>

        {/* Informations don */}
        <Card style={styles.infoCard}>
          <Card.Content>
            <Title style={styles.infoTitle}>💡 À Savoir</Title>
            <Text style={styles.infoText}>
              • Vous pouvez donner votre sang tous les 2 mois pour les hommes, 3 mois pour les femmes
            </Text>
            <Text style={styles.infoText}>
              • Pensez à vous hydrater avant et après le don
            </Text>
            <Text style={styles.infoText}>
              • Apportez une pièce d'identité lors de votre don
            </Text>
          </Card.Content>
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  headerCard: { margin: 16, borderRadius: 12 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  welcomeTitle: { fontSize: 20, fontWeight: '700', color: '#1f2937' },
  bloodTypeBadge: { backgroundColor: '#dbeafe', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 6, marginTop: 8, alignSelf: 'flex-start' },
  bloodTypeText: { fontSize: 14, fontWeight: '700', color: '#2563eb' },
  logoutButton: { borderColor: '#2563eb' },
  locationText: { fontSize: 14, color: '#6b7280', marginTop: 4 },
  locationButton: { marginTop: 8 },
  statsCard: { margin: 16, marginTop: 0, borderRadius: 12 },
  statsTitle: { fontSize: 18, fontWeight: '600', marginBottom: 16 },
  statsContainer: { flexDirection: 'row', justifyContent: 'space-around' },
  statItem: { alignItems: 'center' },
  statNumber: { fontSize: 24, fontWeight: '700', color: '#2563eb' },
  statLabel: { fontSize: 12, color: '#6b7280', marginTop: 4, textAlign: 'center' },
  alertsCard: { margin: 16, marginTop: 0, borderRadius: 12 },
  alertsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  alertsTitle: { fontSize: 18, fontWeight: '600' },
  loader: { marginVertical: 20 },
  emptyState: { alignItems: 'center', padding: 40 },
  emptyStateIcon: { fontSize: 48, marginBottom: 16 },
  emptyStateTitle: { fontSize: 18, fontWeight: '600', color: '#374151', marginBottom: 8 },
  emptyStateText: { fontSize: 14, color: '#6b7280', textAlign: 'center', lineHeight: 20, marginBottom: 16 },
  enableLocationButton: { backgroundColor: '#2563eb' },
  alertItem: { marginBottom: 12, borderRadius: 8 },
  alertHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  alertBloodType: { backgroundColor: '#fef2f2', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  urgencyChip: { height: 28 },
  alertHospital: { fontSize: 16, fontWeight: '600', color: '#1f2937', marginBottom: 2 },
  alertDoctor: { fontSize: 14, color: '#6b7280', marginBottom: 8 },
  alertDetails: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  alertDistance: { fontSize: 12, color: '#6b7280' },
  alertTime: { fontSize: 12, color: '#6b7280' },
  responseStatus: { alignItems: 'center' },
  responseText: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  acceptedText: { color: '#059669' },
  declinedText: { color: '#dc2626' },
  directionsButton: { backgroundColor: '#2563eb', width: '100%' },
  responseActions: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  declineButton: { flex: 1, borderColor: '#d1d5db' },
  acceptButton: { flex: 2, backgroundColor: '#2563eb' },
  infoCard: { margin: 16, marginTop: 0, borderRadius: 12 },
  infoTitle: { fontSize: 18, fontWeight: '600', marginBottom: 12 },
  infoText: { fontSize: 14, color: '#4b5563', marginBottom: 8, lineHeight: 20 },
});
