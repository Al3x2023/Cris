import React from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  ImageBackground,
  Dimensions,
  ScrollView
} from 'react-native';
import MaskedView from '@react-native-masked-view/masked-view';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { usePedidos, useConfig } from '../context';

const { width } = Dimensions.get('window');

function MesasScreen({ navigation }) {
  const { config } = useConfig();
  const { pedidos } = usePedidos();

  const getEstadoMesa = (mesaNum) => {
    const pedido = pedidos[mesaNum];
    return pedido && pedido.length > 0 ? 'ocupada' : 'libre';
  };

  return (
    <LinearGradient colors={['#ffffffc8', '#ffffffff', '#fcfcfcff']} style={styles.container}>
      <ScrollView>
        
        <View style={styles.mesasGrid}>
          {config.mesas.map((num) => (
            <TouchableOpacity
              key={num}
              style={styles.mesaContainer}
              onPress={() => navigation.navigate('Menu', { mesa: num })}
            >
              <ImageBackground
                source={require('../assets/icon1.png')} 
                style={styles.mesaBtn}
                imageStyle={{ borderRadius: 15 }}
              >
                <Ionicons
                  name="ellipse"
                  size={10}
                  color={getEstadoMesa(num) === 'ocupada' ? '#cc02ffff' : '#000000ff'} 
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
              </ImageBackground>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.adminButtons}>
          <TouchableOpacity 
            style={{ borderRadius: 12, overflow: 'hidden', borderColor: '#cdc8c8ff', borderWidth: 1 }}
            onPress={() => navigation.navigate('Reportes')}
          >
              <LinearGradient
    colors={['#070707ff', '#fbfbfbff']} // tus colores
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 0 }} // dirección del degradado
    style={{
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
    }}
  >
            <Text style={{ color: '#fafafaff', fontWeight: 'bold' }}>Reportes</Text>
            </LinearGradient>
          </TouchableOpacity>



          <TouchableOpacity 
            style={{ borderRadius: 12, overflow: 'hidden', borderColor: '#cdc8c8ff', borderWidth: 1 }}
            onPress={() => navigation.navigate('Configuracion')}
          >
            <LinearGradient
      colors={['#070707ff', '#fbfbfbff']} // tus colores
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }} // dirección del degradado
      style={{
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
              }}
               >

                    <Text 
                      style={{ color: '#fafafaff', fontWeight: 'bold' }}
                    >
                      Configuración
                    </Text>

              </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 20,
    backgroundColor: '#fff', // fondo blanco
  },
  titulo: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 25,
    color: '#ffffffff', // negro
    textShadowColor: 'rgba(255, 255, 255, 0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  mesasGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  mesaBtn: {
    width: 150,
    height: 150,
    marginBottom: 15,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: '#fafafaff', // gris claro
    borderRadius: 15,
  },
  mesaOcupada: {
    opacity: 0.7,
  },
  mesaText: {
    marginTop: 80,
    fontWeight: 'bold',
    color: '#ffffffff', // negro
    fontSize: 16,
  },
  mesaTextOcupada: {
    color: '#d103ffff', // gris oscuro
  },
  mesaNota: {
    fontSize: 12,
    color: '#da04fbff', // gris oscuro
    marginTop: 4,
  },
  adminButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    marginBottom: 40,
  },
  btnGold: {
    backgroundColor: '#1d1b1bff', // blanco
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#000', // negro
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  btnText: {
    color: '#000', // negro
    fontWeight: 'bold',
    fontSize: 16,
  },
  logoText: {
    fontSize: 40,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 2,
    textTransform: 'uppercase',
    fontFamily: 'serif',
    color: '#000', // negro
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});

export default MesasScreen;
