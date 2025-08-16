import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  Share,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppProvider, usePedidos, useConfig,ConfigContext } from '../context';

function DetalleTicketScreen({ navigation, route }) {
  const { ticket } = route.params || {};
  const { config } = useConfig();

  // Función para formatear moneda
  const formatCurrency = (amount) => {
    return `$${amount.toFixed(2)}`;
  };

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

  // Función para compartir ticket
  const compartirTicket = async () => {
    try {
      // Formatear los productos para compartir
      const productosTexto = ticket.productos.map(item => 
        `${item.nombre} x${item.cantidad} - ${formatCurrency(item.total)}`
      ).join('\n');

      const mensaje = `
      🏷️ *Ticket Taquería* #${ticket.id.slice(-6)}
      📅 ${formatFecha(ticket.fecha)}
      🏠 Mesa: ${ticket.mesa}
      
      📋 *Productos:*
      ${productosTexto}
      
      💰 *Subtotal:* ${formatCurrency(ticket.subtotal)}
      🏛️ *Impuesto (${config.impuesto * 100}%):* ${formatCurrency(ticket.impuesto)}
      💵 *Total:* ${formatCurrency(ticket.total)}
      
      ¡Gracias por su preferencia!
      `;

      await Share.share({
        message: mensaje,
        title: 'Compartir Ticket'
      });
    } catch (error) {
      Alert.alert('Error', 'No se pudo compartir el ticket');
    }
  };

  // Función para imprimir ticket (simulada)
  const imprimirTicket = () => {
    Alert.alert(
      "Imprimir Ticket",
      "¿Deseas imprimir este ticket?",
      [
        {
          text: "Cancelar",
          style: "cancel"
        },
        { 
          text: "Imprimir", 
          onPress: () => {
            Alert.alert("Ticket enviado a impresión");
            // Aquí iría la lógica real de impresión
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
        <Text style={styles.titulo}>Ticket #{ticket.id.slice(-6)}</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity onPress={compartirTicket} style={styles.iconButton}>
            <Ionicons name="share-social" size={20} />
          </TouchableOpacity>
          <TouchableOpacity onPress={imprimirTicket} style={styles.iconButton}>
            <Ionicons name="print" size={20} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollContainer}>
        {/* Encabezado del ticket */}
        <View style={styles.ticketHeader}>
          <Text style={styles.negocioNombre}>Taquería "El Buen Sabor"</Text>
          <Text style={styles.ticketInfo}>Mesa: {ticket.mesa}</Text>
          <Text style={styles.ticketInfo}>Fecha: {formatFecha(ticket.fecha)}</Text>
        </View>

        {/* Línea divisoria */}
        <View style={styles.divider} />

        {/* Lista de productos */}
        <View style={styles.productosContainer}>
          <Text style={styles.sectionTitle}>Productos:</Text>
          
          {ticket.productos.map((item, index) => (
            <View key={index} style={styles.productoItem}>
              <View style={styles.productoInfo}>
                <Text style={styles.productoNombre}>{item.nombre}</Text>
                <Text style={styles.productoDetalle}>
                  {item.cantidad} x {formatCurrency(item.precio)}
                </Text>
              </View>
              <Text style={styles.productoTotal}>{formatCurrency(item.total)}</Text>
            </View>
          ))}
        </View>

        {/* Línea divisoria */}
        <View style={styles.divider} />

        {/* Totales */}
        <View style={styles.totalesContainer}>
          <View style={styles.totalLine}>
            <Text style={styles.totalLabel}>Subtotal:</Text>
            <Text style={styles.totalValue}>{formatCurrency(ticket.subtotal)}</Text>
          </View>
          <View style={styles.totalLine}>
            <Text style={styles.totalLabel}>Impuesto ({config.impuesto * 100}%):</Text>
            <Text style={styles.totalValue}>{formatCurrency(ticket.impuesto)}</Text>
          </View>
          <View style={[styles.totalLine, styles.totalFinalLine]}>
            <Text style={[styles.totalLabel, styles.totalFinalLabel]}>Total:</Text>
            <Text style={[styles.totalValue, styles.totalFinalValue]}>
              {formatCurrency(ticket.total)}
            </Text>
          </View>
        </View>

        {/* Mensaje de agradecimiento */}
        <Text style={styles.agradecimiento}>¡Gracias por su preferencia!</Text>
      </ScrollView>

      {/* Botones de acción */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.printButton]}
          onPress={imprimirTicket}
        >
          <Ionicons name="print" size={20} color="#fff" />
          <Text style={styles.actionButtonText}>Imprimir</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionButton, styles.shareButton]}
          onPress={compartirTicket}
        >
          <Ionicons name="share-social" size={20} color="#fff" />
          <Text style={styles.actionButtonText}>Compartir</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    backgroundColor: '#fff', // blanco
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#000', // negro
  },
  titulo: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
    color: '#000', // negro
  },
  headerIcons: {
    flexDirection: 'row',
    width: 80,
    justifyContent: 'flex-end',
  },
  iconButton: {
    marginLeft: 15,
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  ticketHeader: {
    alignItems: 'center',
    marginVertical: 15,
  },
  negocioNombre: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#000', // negro
  },
  ticketInfo: {
    fontSize: 14,
    color: '#333', // gris oscuro
    marginBottom: 3,
  },
  divider: {
    height: 1,
    backgroundColor: '#000', // negro
    marginVertical: 10,
  },
  productosContainer: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#000', // negro
  },
  productoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingVertical: 5,
    backgroundColor: '#fff', // blanco
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#000', // negro
  },
  productoInfo: {
    flex: 2,
  },
  productoNombre: {
    fontWeight: '500',
    color: '#000', // negro
  },
  productoDetalle: {
    fontSize: 12,
    color: '#555', // gris oscuro
  },
  productoTotal: {
    flex: 1,
    textAlign: 'right',
    fontWeight: 'bold',
    color: '#000', // negro
  },
  totalesContainer: {
    marginTop: 10,
    marginBottom: 20,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#000', // negro
    backgroundColor: '#fff', // blanco
  },
  totalLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 14,
    color: '#000', // negro
  },
  totalValue: {
    fontWeight: '500',
    color: '#000', // negro
  },
  totalFinalLine: {
    borderTopWidth: 1,
    borderTopColor: '#000', // negro
    paddingTop: 8,
    marginTop: 8,
  },
  totalFinalLabel: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#000', // negro
  },
  totalFinalValue: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#000', // negro
  },
  agradecimiento: {
    textAlign: 'center',
    fontStyle: 'italic',
    marginVertical: 20,
    color: '#000', // negro
  },
  actionsContainer: {
    flexDirection: 'row',
    padding: 15,
    paddingBottom: Platform.OS === 'ios' ? 30 : 15,
    backgroundColor: '#fff', // blanco
    borderTopWidth: 1,
    borderTopColor: '#000', // negro
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: '#000', // negro
  },
  printButton: {
    backgroundColor: '#000', // negro
  },
  shareButton: {
    backgroundColor: '#000', // negro
  },
  actionButtonText: {
    color: '#fff', // blanco
    marginLeft: 8,
    fontWeight: 'bold',
  },
});


export default DetalleTicketScreen;