import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AppProvider } from './context'; // Asegúrate de que la ruta sea correcta

// Importa todas las pantallas
import MesasScreen from './screens/MesasScreen';
import MenuScreen from './screens/MenuScreen';
import CuentaScreen from './screens/CuentaScreen';
import ReportesScreen from './screens/ReportesScreen';
import ConfiguracionScreen from './screens/ConfiguracionScreen';
import HistorialVentasScreen from './screens/HistorialVentasScreen';
import DetalleTicketScreen from './screens/DetalleTicketScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <AppProvider>
      <NavigationContainer>
        <Stack.Navigator 
          initialRouteName="Mesas"
          screenOptions={{
            headerShown: false,
            cardStyle: { backgroundColor: '#fff' }
          }}
        >
          {/* Pantalla principal */}
          <Stack.Screen 
            name="Mesas" 
            component={MesasScreen} 
            options={{ title: 'Administración de Mesas' }}
          />
          
          {/* Pantallas de flujo principal */}
          <Stack.Screen 
            name="Menu" 
            component={MenuScreen} 
            options={{ title: 'Menú' }}
          />
          <Stack.Screen 
            name="Cuenta" 
            component={CuentaScreen} 
            options={{ title: 'Cuenta de Mesa' }}
          />
          
          {/* Pantallas de reportes e historial */}
          <Stack.Screen 
            name="Reportes" 
            component={ReportesScreen} 
            options={{ title: 'Reportes' }}
          />
          <Stack.Screen 
            name="HistorialVentas" 
            component={HistorialVentasScreen} 
            options={{ title: 'Historial de Ventas' }}
          />
          <Stack.Screen 
            name="DetalleTicket" 
            component={DetalleTicketScreen} 
            options={{ title: 'Detalle de Ticket' }}
          />
          
          {/* Pantalla de configuración */}
          <Stack.Screen 
            name="Configuracion" 
            component={ConfiguracionScreen} 
            options={{ title: 'Configuración' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </AppProvider>
  );
}