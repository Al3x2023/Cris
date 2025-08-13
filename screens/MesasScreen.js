import React from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  Button, 
  TouchableOpacity 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppProvider, usePedidos, useConfig,ConfigContext } from '../context';
function MesasScreen({ navigation }) {
  const { config } = useConfig();
  const { pedidos } = usePedidos();

  const getEstadoMesa = (mesaNum) => {
    const pedido = pedidos[mesaNum];
    return pedido && pedido.length > 0 ? 'ocupada' : 'libre';
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Administración Taquería</Text>
      
      <View style={styles.mesasGrid}>
        {config.mesas.map((num) => (
          <TouchableOpacity
            key={num}
            style={[
              styles.mesaBtn,
              getEstadoMesa(num) === 'ocupada' && styles.mesaOcupada
            ]}
            onPress={() => navigation.navigate('Menu', { mesa: num })}
          >
            <Ionicons 
              name="restaurant" 
              size={30} 
              color={getEstadoMesa(num) === 'ocupada' ? '#fff' : '#841584'} 
            />
            <Text 
              style={[
                styles.mesaText,
                getEstadoMesa(num) === 'ocupada' && styles.mesaTextOcupada
              ]}
            >
              Mesa {num}
            </Text>
            {getEstadoMesa(num) === 'ocupada' && (
              <Text style={styles.mesaNota}>En uso</Text>
            )}
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.adminButtons}>
        <Button
          title="Reportes"
          onPress={() => navigation.navigate('Reportes')}
          color="#841584"
        />
        <Button
          title="Configuración"
          onPress={() => navigation.navigate('Configuracion')}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 25,
  },
  mesasGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  mesaBtn: {
    width: '48%',
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    padding: 20,
    marginBottom: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mesaOcupada: {
    backgroundColor: '#841584',
  },
  mesaText: {
    marginTop: 8,
    fontWeight: 'bold',
  },
  mesaTextOcupada: {
    color: '#fff',
  },
  mesaNota: {
    fontSize: 12,
    color: '#fff',
    marginTop: 4,
  },
  adminButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    marginBottom: 40,
  },
});

export default MesasScreen;