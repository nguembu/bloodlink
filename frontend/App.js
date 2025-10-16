import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider as PaperProvider } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';

// Contexts
import { AuthProvider } from './src/context/AuthContext';
import { LocationProvider } from './src/context/LocationContext';
import { NotificationProvider } from './src/context/NotificationContext';

// Screens
import WelcomeScreen from './src/screens/WelcomeScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import DoctorDashboard from './src/screens/DoctorDashboard';
import DonorDashboard from './src/screens/DonorDashboard';

const Stack = createStackNavigator();

export default function App() {
  return (
    <PaperProvider>
      <AuthProvider>
        <LocationProvider>
          <NotificationProvider>
            <NavigationContainer>
              <StatusBar style="auto" />
              <Stack.Navigator 
                initialRouteName="Welcome"
                screenOptions={{
                  headerStyle: {
                    backgroundColor: '#d32f2f',
                  },
                  headerTintColor: '#fff',
                  headerTitleStyle: {
                    fontWeight: 'bold',
                  },
                }}
              >
                <Stack.Screen 
                  name="Welcome" 
                  component={WelcomeScreen} 
                  options={{ headerShown: false }}
                />
                <Stack.Screen 
                  name="Login" 
                  component={LoginScreen}
                  options={{ title: 'Connexion' }}
                />
                <Stack.Screen 
                  name="Register" 
                  component={RegisterScreen}
                  options={{ title: 'Inscription' }}
                />
                <Stack.Screen 
                  name="DoctorDashboard" 
                  component={DoctorDashboard}
                  options={{ title: 'Tableau de Bord Médecin' }}
                />
                <Stack.Screen 
                  name="DonorDashboard" 
                  component={DonorDashboard}
                  options={{ title: 'Tableau de Bord Donneur' }}
                />
              </Stack.Navigator>
            </NavigationContainer>
          </NotificationProvider>
        </LocationProvider>
      </AuthProvider>
    </PaperProvider>
  );
}