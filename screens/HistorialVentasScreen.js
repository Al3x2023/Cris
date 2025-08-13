import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppProvider, usePedidos, useConfig,ConfigContext } from '../context';

function HistorialVentasScreen({ navigation }) {
  const { historialVentas } = usePedidos();
  const { config } = useConfig();

  // Función para calcular totales del día
  const calcularTotalesDia = () => {
    const hoy = new Date().toISOString().split('T')[0];
    const ventasHoy = historialVentas.filter(v => 
      v.fecha.split('T')[0] === hoy
    );
    
    return {
      totalVentas: ventasHoy.reduce((sum, v) => sum + v.total, 0),
      cantidadVentas: ventasHoy.length
    };
  };

  const { totalVentas, cantidadVentas } = calcularTotalesDia();

  // Función para formatear fecha
  const formatFecha = (fechaISO) => {
    const fecha = new Date(fechaISO);
    return fecha.toLocaleDateString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Función para formatear moneda
  const formatCurrency = (amount) => {
    return `$${amount.toFixed(2)}`;
  };

  // Función para eliminar un ticket del historial
  const eliminarTicket = (id) => {
    Alert.alert(
      "Eliminar Ticket",
      "¿Estás seguro de que deseas eliminar este ticket del historial?",
      [
        {
          text: "Cancelar",
          style: "cancel"
        },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => {
            const { setHistorialVentas } = usePedidos();
            setHistorialVentas(prev => prev.filter(ticket => ticket.id !== id));
            Alert.alert("Ticket eliminado");
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} />
        </TouchableOpacity>
        <Text style={styles.titulo}>Historial de Ventas</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Resumen del día */}
      <View style={styles.resumenContainer}>
        <View style={styles.resumenItem}>
          <Ionicons name="today" size={20} color="#555" />
          <Text style={styles.resumenText}>Ventas hoy: {cantidadVentas}</Text>
        </View>
        <View style={styles.resumenItem}>
          <Ionicons name="cash" size={20} color="#555" />
          <Text style={styles.resumenText}>Total: {formatCurrency(totalVentas)}</Text>
        </View>
      </View>

      {/* Listado de tickets */}
      {historialVentas.length > 0 ? (
        <FlatList
          data={historialVentas}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.ticketItem}
              onPress={() => navigation.navigate('DetalleTicket', { ticket: item })}
              onLongPress={() => eliminarTicket(item.id)}
            >
              <View style={styles.ticketHeader}>
                <Text style={styles.ticketMesa}>Mesa {item.mesa}</Text>
                <Text style={styles.ticketFecha}>{formatFecha(item.fecha)}</Text>
              </View>
              
              <View style={styles.ticketInfo}>
                <Text style={styles.ticketProductos}>
                  {item.productos.length} productos
                </Text>
                <Text style={styles.ticketTotal}>{formatCurrency(item.total)}</Text>
              </View>
              
              <View style={styles.ticketFooter}>
                <Text style={styles.ticketImpuesto}>
                  Impuesto ({config.impuesto * 100}%): {formatCurrency(item.impuesto)}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="receipt" size={50} color="#ccc" />
          <Text style={styles.emptyText}>No hay ventas registradas</Text>
        </View>
      )}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
  },
  resumenContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  resumenItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resumenText: {
    marginLeft: 8,
    fontSize: 16,
  },
  listContainer: {
    paddingBottom: 20,
  },
  ticketItem: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#841584',
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  ticketMesa: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  ticketFecha: {
    color: '#666',
    fontSize: 14,
  },
  ticketInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  ticketProductos: {
    color: '#555',
  },
  ticketTotal: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#28a745',
  },
  ticketFooter: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 5,
    marginTop: 5,
  },
  ticketImpuesto: {
    fontSize: 12,
    color: '#666',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 15,
    fontSize: 16,
    color: '#666',
  },
});

export default HistorialVentasScreen;