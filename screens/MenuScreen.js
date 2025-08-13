import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  ToastAndroid,
  Platform,
  Modal,
  ScrollView,
  TextInput,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePedidos, useConfig } from '../context';

const { width, height } = Dimensions.get('window');
const isSmallScreen = width < 375;

function MenuScreen({ navigation, route }) {
  const { mesa } = route.params || {};
  const { pedidos, setPedidos } = usePedidos();
  const { config, loading } = useConfig();

  const [cantidad, setCantidad] = useState(1);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTipo, setModalTipo] = useState({ visible: false, section: '', categoria: '', tipos: [] });

  const pedidoMesa = pedidos[mesa] || [];

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Cargando configuración...</Text>
      </View>
    );
  }

  if (!config?.precios?.bebidas?.agua || !config?.precios?.bebidas?.refresco) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error: Configuración incompleta</Text>
      </View>
    );
  }

  const showToast = (message) => {
    if (Platform.OS === 'android') {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    } else {
      Alert.alert(message);
    }
  };

  const agregarProducto = useCallback((nombre, precio, cantidad = 1) => {
    setPedidos((prev) => {
      const pedidoActual = prev[mesa] || [];
      const index = pedidoActual.findIndex(item => item.nombre === nombre);
      let nuevoPedidoMesa;

      if (index !== -1) {
        nuevoPedidoMesa = pedidoActual.map((item, i) =>
          i === index ? {
            ...item,
            cantidad: +(item.cantidad + cantidad).toFixed(2),
            total: +((item.cantidad + cantidad) * precio).toFixed(2)
          } : item
        );
      } else {
        nuevoPedidoMesa = [...pedidoActual, {
          id: Date.now().toString(),
          nombre,
          precio,
          cantidad: +cantidad.toFixed(2),
          total: +(precio * cantidad).toFixed(2),
          hora: new Date().toLocaleTimeString()
        }];
      }
      return { ...prev, [mesa]: nuevoPedidoMesa };
    });
    showToast(`Agregado: ${nombre} x${cantidad}`);
    setCantidad(1);
  }, [mesa, setPedidos]);

  const limpiarMesa = () => {
    Alert.alert(
      "Limpiar Mesa",
      "¿Seguro que quieres limpiar toda la mesa?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Limpiar", style: "destructive",
          onPress: () => {
            setPedidos(prev => {
              const nuevosPedidos = { ...prev };
              delete nuevosPedidos[mesa];
              return nuevosPedidos;
            });
            showToast(`Mesa ${mesa} limpiada`);
          }
        }
      ]
    );
  };

  const abrirModalTipos = (section, categoria, tipos) => {
    setModalTipo({ visible: true, section, categoria, tipos });
  };

  const agregarDesdeModal = (tipo) => {
    let precio;
    let nombre;
    if (modalTipo.section === 'tacos') {
      precio = config.precios.tacos[modalTipo.categoria][tipo];
      nombre = `Taco ${modalTipo.categoria} ${tipo}`;
    } else if (modalTipo.section === 'bebidas') {
      precio = config.precios.bebidas[modalTipo.categoria][tipo];
      nombre = `${modalTipo.categoria.charAt(0).toUpperCase() + modalTipo.categoria.slice(1)} ${tipo}`;
    } else if (modalTipo.section === 'especialidades') {
      precio = config.precios.especialidades.kiloCarnitas;
      nombre = `Carnitas ${tipo} (kg)`;
    }
    agregarProducto(nombre, precio, cantidad);
    setModalTipo({ ...modalTipo, visible: false });
  };

  const totalParcial = pedidoMesa.reduce((sum, item) => sum + item.total, 0);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={isSmallScreen ? 20 : 24} />
        </TouchableOpacity>
        <Text style={styles.titulo}>Mesa {mesa}</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.optionsButton}>
          <Ionicons name="options" size={isSmallScreen ? 20 : 24} />
        </TouchableOpacity>
      </View>

      {/* Control cantidad */}
      <CantidadSelector cantidad={cantidad} setCantidad={setCantidad} isSmallScreen={isSmallScreen} />

      {/* Productos */}
      <ScrollView 
        style={styles.productosContainer}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.subtitulo}>Tacos</Text>
        <ProductoButton
          nombre="Taco Carnitas"
          precio={config.precios.tacos.carnitas.surtida}
          icon="fast-food"
          onPress={() => abrirModalTipos('tacos', 'carnitas', config.categorias.tiposCarnitas)}
          isSmallScreen={isSmallScreen}
        />
        <ProductoButton
          nombre="Taco Asada"
          precio={config.precios.tacos.asada.cesina}
          icon="fast-food"
          onPress={() => abrirModalTipos('tacos', 'asada', config.categorias.tiposAsada)}
          isSmallScreen={isSmallScreen}
        />

        {/* Especialidades */}
        <Text style={styles.subtitulo}>Especialidades</Text>
        <ProductoButton
          nombre="Carnitas por kilo"
          precio={config.precios.especialidades.kiloCarnitas}
          icon="fast-food"
          onPress={() => abrirModalTipos('especialidades', 'carnitas', config.categorias.tiposCarnitas)}
          isSmallScreen={isSmallScreen}
        />

        {/* Bebidas */}
        <Text style={styles.subtitulo}>Bebidas</Text>
        <ProductoButton
          nombre="Agua"
          precio={config.precios.bebidas.agua.natural}
          icon="water-outline"
          onPress={() => abrirModalTipos('bebidas', 'agua', config.categorias.tiposAgua)}
          isSmallScreen={isSmallScreen}
        />
        <ProductoButton
          nombre="Refresco"
          precio={config.precios.bebidas.refresco.coca}
          icon="cafe-outline"
          onPress={() => abrirModalTipos('bebidas', 'refresco', config.categorias.tiposRefresco)}
          isSmallScreen={isSmallScreen}
        />
      </ScrollView>

      {/* Resumen */}
      <View style={styles.resumenContainer}>
        <View style={styles.resumenHeader}>
          <Text style={styles.resumenText}>Total parcial:</Text>
          <Text style={styles.resumenTotal}>{formatCurrency(totalParcial)}</Text>
        </View>
        <TouchableOpacity style={styles.btnCuenta} onPress={() => navigation.navigate('Cuenta', { mesa })}>
          <Text style={styles.btnCuentaText}>Ver Cuenta Completa</Text>
        </TouchableOpacity>
      </View>

      {/* Modal de tipos */}
      <Modal visible={modalTipo.visible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, isSmallScreen ? styles.smallModal : null]}>
            <Text style={styles.modalTitle}>Selecciona tipo de {modalTipo.categoria}</Text>
            <ScrollView contentContainerStyle={styles.modalScrollContent}>
              {modalTipo.tipos.map((tipo) => {
                const tipoPrecio = modalTipo.section === 'especialidades'
                  ? config.precios.especialidades.kiloCarnitas
                  : config.precios[modalTipo.section][modalTipo.categoria][tipo];
                return (
                  <TouchableOpacity 
                    key={tipo} 
                    style={styles.modalBtn} 
                    onPress={() => agregarDesdeModal(tipo)}
                  >
                    <View style={styles.tipoProductoRow}>
                      <Text style={styles.modalBtnText}>{tipo}</Text>
                      <Text style={styles.modalBtnPrecio}>{formatCurrency(tipoPrecio)}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            <TouchableOpacity 
              style={[styles.modalBtn, styles.cancelBtn]} 
              onPress={() => setModalTipo({ ...modalTipo, visible: false })}
            >
              <Text style={styles.modalBtnText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal de opciones */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, isSmallScreen ? styles.smallModal : null]}>
            <Text style={styles.modalTitle}>Opciones Mesa {mesa}</Text>
            <TouchableOpacity 
              style={styles.modalBtn} 
              onPress={() => { 
                setModalVisible(false); 
                navigation.navigate('Cuenta', { mesa }); 
              }}
            >
              <Text style={styles.modalBtnText}>Ver cuenta completa</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.modalBtn} 
              onPress={() => { 
                setModalVisible(false); 
                limpiarMesa(); 
              }}
            >
              <Text style={[styles.modalBtnText, styles.dangerText]}>Limpiar mesa</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.modalBtn, styles.cancelBtn]} 
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalBtnText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function ProductoButton({ nombre, precio, icon, onPress, isSmallScreen }) {
  return (
    <TouchableOpacity style={styles.productoBtn} onPress={onPress}>
      <View style={styles.productoContent}>
        {icon && <Ionicons name={icon} size={isSmallScreen ? 18 : 20} style={styles.productoIcon} />}
        <Text style={[styles.productoText, isSmallScreen && styles.smallText]}>{nombre}</Text>
      </View>
      <Text style={[styles.productoPrecio, isSmallScreen && styles.smallText]}>Desde {formatCurrency(precio)}</Text>
    </TouchableOpacity>
  );
}

function CantidadSelector({ cantidad, setCantidad, isSmallScreen }) {
  return (
    <View style={styles.cantidadContainer}>
      <Text style={[styles.cantidadLabel, isSmallScreen && styles.smallText]}>Cantidad:</Text>
      <View style={styles.cantidadControls}>
        <TouchableOpacity 
          style={[styles.cantidadBtn, isSmallScreen && styles.smallButton]} 
          onPress={() => setCantidad(Math.max(0.25, cantidad - 0.25))}
        >
          <Ionicons name="remove" size={isSmallScreen ? 16 : 20} />
        </TouchableOpacity>
        <TextInput
          style={[styles.cantidadInput, isSmallScreen && styles.smallInput]}
          keyboardType="numeric"
          value={cantidad.toString()}
          onChangeText={(text) => {
            if (/^\d*\.?\d*$/.test(text)) {
              const num = parseFloat(text);
              if (!isNaN(num) && num > 0) {
                setCantidad(num);
              }
            }
          }}
        />
        <TouchableOpacity 
          style={[styles.cantidadBtn, isSmallScreen && styles.smallButton]} 
          onPress={() => setCantidad(cantidad + 0.25)}
        >
          <Ionicons name="add" size={isSmallScreen ? 16 : 20} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

function formatCurrency(amount) {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return '$0.00';
  }
  return `$${amount.toFixed(2)}`;
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
    padding: 8,
  },
  optionsButton: {
    padding: 8,
  },
  titulo: {
    fontSize: width * 0.06,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
  },
  subtitulo: {
    fontSize: width * 0.045,
    fontWeight: '600',
    marginTop: height * 0.02,
    marginBottom: height * 0.01,
    color: '#555',
  },
  cantidadContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: height * 0.02,
  },
  cantidadLabel: {
    marginRight: width * 0.03,
    fontSize: width * 0.04,
  },
  cantidadControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cantidadBtn: {
    backgroundColor: '#e9ecef',
    padding: width * 0.02,
    borderRadius: 4,
  },
  cantidadInput: {
    borderWidth: 1,
    borderColor: '#ced4da',
    width: width * 0.12,
    textAlign: 'center',
    marginHorizontal: width * 0.01,
    padding: width * 0.01,
    borderRadius: 4,
    fontSize: width * 0.04,
  },
  productosContainer: {
    flex: 1,
    marginBottom: height * 0.01,
  },
  scrollContent: {
    paddingBottom: height * 0.02,
  },
  productoBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: width * 0.04,
    borderRadius: 8,
    marginBottom: height * 0.01,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  productoContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  productoIcon: {
    marginRight: width * 0.02,
  },
  productoText: {
    fontSize: width * 0.04,
    flexShrink: 1,
  },
  productoPrecio: {
    fontWeight: 'bold',
    color: '#28a745',
    fontSize: width * 0.035,
    marginLeft: width * 0.02,
  },
  resumenContainer: {
    backgroundColor: '#f8f9fa',
    padding: width * 0.04,
    borderRadius: 8,
    marginBottom: height * 0.02,
  },
  resumenHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: height * 0.01,
  },
  resumenText: {
    fontWeight: 'bold',
    fontSize: width * 0.04,
  },
  resumenTotal: {
    fontWeight: 'bold',
    color: '#28a745',
    fontSize: width * 0.04,
  },
  btnCuenta: {
    backgroundColor: '#007bff',
    padding: width * 0.03,
    borderRadius: 5,
    alignItems: 'center',
  },
  btnCuentaText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: width * 0.04,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    width: width * 0.85,
    maxHeight: height * 0.7,
    borderRadius: 10,
    padding: width * 0.05,
  },
  smallModal: {
    width: width * 0.9,
  },
  modalTitle: {
    fontSize: width * 0.05,
    fontWeight: 'bold',
    marginBottom: height * 0.02,
    textAlign: 'center',
  },
  modalBtn: {
    padding: width * 0.03,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalBtnText: {
    textAlign: 'center',
    fontSize: width * 0.04,
  },
  dangerText: {
    color: '#dc3545',
  },
  tipoProductoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalBtnPrecio: {
    color: '#28a745',
    fontWeight: 'bold',
    fontSize: width * 0.035,
  },
  cancelBtn: {
    marginTop: height * 0.01,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: height * 0.01,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    fontSize: width * 0.05,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  errorText: {
    fontSize: width * 0.05,
    textAlign: 'center',
    color: 'red',
  },
  modalScrollContent: {
    paddingBottom: height * 0.01,
  },
  smallText: {
    fontSize: width * 0.035,
  },
  smallButton: {
    padding: width * 0.015,
  },
  smallInput: {
    width: width * 0.10,
    padding: width * 0.008,
  },
});

export default MenuScreen;