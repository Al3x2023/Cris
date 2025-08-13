import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Button,
  TouchableOpacity,
  Alert,
  ToastAndroid,
  Platform,
  ScrollView,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePedidos, useConfig } from '../context';

const { width, height } = Dimensions.get('window');
const isSmallScreen = width < 375;

function CuentaScreen({ navigation, route }) {
  const { mesa } = route.params || {};
  const { pedidos, setPedidos, historialVentas, setHistorialVentas } = usePedidos();
  const { config } = useConfig();

  const pedidoMesa = pedidos[mesa] || [];
  const subtotal = pedidoMesa.reduce((sum, item) => sum + (item.total || 0), 0);
  const impuesto = subtotal * (config.impuesto || 0);
  const totalFinal = subtotal + impuesto;

  const borrarItem = (id) => {
    Alert.alert(
      "Eliminar producto",
      "¿Seguro quieres eliminar este producto del pedido?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => {
            setPedidos((prev) => {
              const pedidoActual = prev[mesa] || [];
              const nuevoPedido = pedidoActual.filter(i => i.id !== id);
              return { ...prev, [mesa]: nuevoPedido };
            });
            showToast("Producto eliminado");
          }
        }
      ]
    );
  };

  const cobrarMesa = () => {
    if (isNaN(totalFinal)) {
      console.warn('Invalid totalFinal:', totalFinal);
      showToast('Error: No se puede cobrar debido a datos inválidos');
      return;
    }

    Alert.alert(
      "Cobrar Mesa",
      `Total a cobrar: ${formatCurrency(totalFinal)}\n\n¿Confirmar cobro?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Cobrar",
          onPress: () => {
            const ticket = {
              id: Date.now().toString(),
              mesa,
              fecha: new Date().toISOString(),
              productos: [...pedidoMesa],
              subtotal,
              impuesto,
              total: totalFinal
            };

            setHistorialVentas(prev => [ticket, ...prev]);

            setPedidos(prev => {
              const nuevosPedidos = { ...prev };
              delete nuevosPedidos[mesa];
              return nuevosPedidos;
            });

            showToast(`Mesa ${mesa} cobrada - ${formatCurrency(totalFinal)}`);
            navigation.goBack();
          }
        }
      ]
    );
  };

  const showToast = (message) => {
    if (Platform.OS === 'android') {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    } else {
      Alert.alert(message);
    }
  };

  const formatCurrency = (amount) => {
    if (typeof amount !== 'number' || isNaN(amount)) {
      return '$0.00';
    }
    return `$${amount.toFixed(2)}`;
  };

  return (
    <View style={styles.container}>
      {/* Header responsivo */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={styles.backButton}
        >
          <Ionicons 
            name="arrow-back" 
            size={isSmallScreen ? 20 : 24} 
          />
        </TouchableOpacity>
        <Text style={styles.titulo}>Cuenta Mesa {mesa}</Text>
        <View style={{ width: isSmallScreen ? 20 : 24 }} />
      </View>

      {pedidoMesa.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons 
            name="receipt" 
            size={isSmallScreen ? 40 : 50} 
            color="#ccc" 
          />
          <Text style={[styles.emptyText, isSmallScreen && styles.smallText]}>
            No hay productos en esta mesa
          </Text>
        </View>
      ) : (
        <ScrollView 
          style={styles.lista}
          contentContainerStyle={styles.listaContent}
        >
          {pedidoMesa.map((item) => (
            <TouchableOpacity
              key={item.id}
              onPress={() => borrarItem(item.id)}
              style={styles.itemContainer}
            >
              <View style={styles.itemTicket}>
                <View style={styles.itemInfo}>
                  <Text 
                    style={[styles.itemNombre, isSmallScreen && styles.smallText]}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {item.nombre}
                  </Text>
                  <Text style={[styles.itemDetalle, isSmallScreen && styles.smallDetail]}>
                    {formatCurrency(item.cantidad)} x {formatCurrency(item.precio)} • {item.hora}
                  </Text>
                </View>
                <Text style={[styles.itemTotal, isSmallScreen && styles.smallTotal]}>
                  {formatCurrency(item.total)}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Sección de totales */}
      <View style={styles.totalesContainer}>
        <View style={styles.totalLine}>
          <Text style={[styles.totalLabel, isSmallScreen && styles.smallText]}>Subtotal:</Text>
          <Text style={[styles.totalValue, isSmallScreen && styles.smallText]}>
            {formatCurrency(subtotal)}
          </Text>
        </View>
        <View style={styles.totalLine}>
          <Text style={[styles.totalLabel, isSmallScreen && styles.smallText]}>
            Impuesto ({(config.impuesto * 100) || 0}%):
          </Text>
          <Text style={[styles.totalValue, isSmallScreen && styles.smallText]}>
            {formatCurrency(impuesto)}
          </Text>
        </View>
        <View style={[styles.totalLine, styles.totalFinal]}>
          <Text style={[styles.totalLabel, styles.totalFinalLabel, isSmallScreen && styles.smallTotalLabel]}>
            Total:
          </Text>
          <Text style={[styles.totalValue, styles.totalFinalValue, isSmallScreen && styles.smallTotalValue]}>
            {formatCurrency(totalFinal)}
          </Text>
        </View>
      </View>

      {/* Botón de cobro responsivo */}
      <TouchableOpacity
        style={[
          styles.cobrarButton,
          pedidoMesa.length === 0 && styles.disabledButton
        ]}
        onPress={cobrarMesa}
        disabled={pedidoMesa.length === 0}
      >
        <Text style={styles.cobrarButtonText}>Cobrar Mesa</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: height * 0.05,
    paddingHorizontal: width * 0.04,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: height * 0.02,
  },
  backButton: {
    padding: width * 0.01,
  },
  titulo: {
    fontSize: width * 0.06,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
  },
  lista: {
    flex: 1,
    marginBottom: height * 0.01,
  },
  listaContent: {
    paddingBottom: height * 0.01,
  },
  itemContainer: {
    marginBottom: height * 0.01,
  },
  itemTicket: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: width * 0.04,
    borderRadius: 8,
  },
  itemInfo: {
    flex: 1,
    marginRight: width * 0.02,
  },
  itemNombre: {
    fontWeight: 'bold',
    fontSize: width * 0.04,
  },
  itemDetalle: {
    fontSize: width * 0.032,
    color: '#6c757d',
    marginTop: height * 0.005,
  },
  itemTotal: {
    fontWeight: 'bold',
    color: '#28a745',
    fontSize: width * 0.04,
  },
  totalesContainer: {
    backgroundColor: '#f8f9fa',
    padding: width * 0.04,
    borderRadius: 8,
    marginBottom: height * 0.02,
  },
  totalLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: height * 0.008,
  },
  totalFinal: {
    borderTopWidth: 1,
    borderTopColor: '#dee2e6',
    paddingTop: height * 0.01,
    marginTop: height * 0.01,
  },
  totalLabel: {
    fontWeight: '600',
    fontSize: width * 0.04,
  },
  totalValue: {
    fontWeight: '600',
    fontSize: width * 0.04,
  },
  totalFinalLabel: {
    fontSize: width * 0.045,
  },
  totalFinalValue: {
    fontSize: width * 0.045,
    color: '#28a745',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: height * 0.1,
  },
  emptyText: {
    marginTop: height * 0.02,
    fontSize: width * 0.045,
    color: '#6c757d',
    textAlign: 'center',
  },
  cobrarButton: {
    backgroundColor: '#28a745',
    padding: width * 0.04,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    backgroundColor: '#cccccc',
  },
  cobrarButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: width * 0.045,
  },
  smallText: {
    fontSize: width * 0.038,
  },
  smallDetail: {
    fontSize: width * 0.028,
  },
  smallTotal: {
    fontSize: width * 0.035,
  },
  smallTotalLabel: {
    fontSize: width * 0.04,
  },
  smallTotalValue: {
    fontSize: width * 0.04,
  },
});

export default CuentaScreen;