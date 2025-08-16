import React, { useState, useCallback, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  ToastAndroid,
  Platform,
  ScrollView,
  TextInput,
  Dimensions,
  Modal,
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
  const [expandedCategoryId, setExpandedCategoryId] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [combinadoModalVisible, setCombinadoModalVisible] = useState(false);
  const [selectedCombinadoTipos, setSelectedCombinadoTipos] = useState([]);

  const pedidoMesa = useMemo(() => pedidos[mesa] || [], [pedidos, mesa]);

  const totalParcial = useMemo(
    () => pedidoMesa.reduce((sum, item) => sum + item.total, 0),
    [pedidoMesa]
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Cargando configuración...</Text>
      </View>
    );
  }

  if (
    !config?.precios?.tacos?.carnitas ||
    !config?.precios?.tacos?.asada ||
    !config?.precios?.tacos?.combinado ||
    !config?.precios?.bebidas?.agua ||
    !config?.precios?.bebidas?.refresco ||
    !config?.precios?.especialidades?.kilocarnitas
  ) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error: Configuración incompleta (precios faltantes)</Text>
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

  const agregarProducto = useCallback(
    (nombre, precio, cantidad = 1, combinadoTipos = null) => {
      if (typeof precio !== 'number' || isNaN(precio)) {
        showToast(`Error: Precio no válido para ${nombre}`);
        return;
      }
      setPedidos((prev) => {
        const pedidoActual = prev[mesa] || [];
        const index = pedidoActual.findIndex((item) => item.nombre === nombre);
        let nuevoPedidoMesa;

        if (index !== -1) {
          nuevoPedidoMesa = pedidoActual.map((item, i) =>
            i === index
              ? {
                  ...item,
                  cantidad: +(item.cantidad + cantidad).toFixed(2),
                  total: +((item.cantidad + cantidad) * precio).toFixed(2),
                }
              : item
          );
        } else {
          nuevoPedidoMesa = [
            ...pedidoActual,
            {
              id: Date.now().toString(),
              nombre,
              precio,
              cantidad: +cantidad.toFixed(2),
              total: +(precio * cantidad).toFixed(2),
              hora: new Date().toLocaleTimeString(),
              combinadoTipos,
            },
          ];
        }
        return { ...prev, [mesa]: nuevoPedidoMesa };
      });
      showToast(`Agregado: ${nombre} x${cantidad}`);
      setCantidad(1);
      setSelectedCombinadoTipos([]);
    },
    [mesa, setPedidos]
  );

  const limpiarMesa = () => {
    Alert.alert('Limpiar Mesa', '¿Seguro que quieres limpiar toda la mesa?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Limpiar',
        style: 'destructive',
        onPress: () => {
          setPedidos((prev) => {
            const nuevosPedidos = { ...prev };
            delete nuevosPedidos[mesa];
            return nuevosPedidos;
          });
          showToast(`Mesa ${mesa} limpiada`);
        },
      },
    ]);
  };

  const toggleCategory = useCallback((id) => {
    setExpandedCategoryId((prev) => (prev === id ? null : id));
  }, []);

  const toggleCombinadoTipo = useCallback((tipo) => {
    setSelectedCombinadoTipos((prev) =>
      prev.includes(tipo) ? prev.filter((t) => t !== tipo) : [...prev, tipo]
    );
  }, []);

  const agregarCombinado = useCallback(() => {
    if (selectedCombinadoTipos.length < 2) {
      showToast('Selecciona al menos dos tipos para un taco combinado');
      return;
    }
    const nombre = `Taco Combinado ${selectedCombinadoTipos.join('+')}`;
    const precio = config.precios.tacos.combinado;
    agregarProducto(nombre, precio, cantidad, selectedCombinadoTipos);
    setCombinadoModalVisible(false);
  }, [selectedCombinadoTipos, config.precios.tacos.combinado, cantidad, agregarProducto]);

  const agregarDirecto = useCallback(
    (section, categoria, tipo) => {
      let precio, nombre;
      if (section === 'tacos') {
        precio = config.precios.tacos[categoria][tipo];
        nombre = `Taco ${categoria} ${tipo}`;
      } else if (section === 'bebidas') {
        precio = config.precios.bebidas[categoria][tipo];
        nombre = `${categoria.charAt(0).toUpperCase() + categoria.slice(1)} ${tipo}`;
      } else if (section === 'especialidades') {
        precio = config.precios.especialidades.kilocarnitas;
        nombre = `Carnitas ${tipo} (kg)`;
      }
      if (typeof precio !== 'number' || isNaN(precio)) {
        showToast(`Error: Precio no disponible para ${nombre}`);
        return;
      }
      agregarProducto(nombre, precio, cantidad);
    },
    [agregarProducto, cantidad, config.precios]
  );

  const sections = useMemo(
    () => [
      {
        name: 'Tacos',
        categories: [
          {
            id: 'tacos-carnitas',
            nombre: 'Taco Carnitas',
            icon: 'fast-food',
            minPrecio: config.precios.tacos.carnitas.surtida || 0,
            section: 'tacos',
            categoria: 'carnitas',
            tipos: config.categorias.tiposCarnitas || [],
            precios: config.precios.tacos.carnitas || {},
          },
          {
            id: 'tacos-asada',
            nombre: 'Taco Asada',
            icon: 'fast-food',
            minPrecio: config.precios.tacos.asada.cesinanatural || 0,
            section: 'tacos',
            categoria: 'asada',
            tipos: config.categorias.tiposAsada || [],
            precios: config.precios.tacos.asada || {},
          },
          {
            id: 'tacos-combinado',
            nombre: 'Taco Combinado',
            icon: 'fast-food',
            minPrecio: config.precios.tacos.combinado || 0,
            section: 'tacos',
            categoria: 'combinado',
            tipos: config.categorias.tiposCarnitas || [],
            precios: Object.fromEntries(
              (config.categorias.tiposCarnitas || []).map((tipo) => [tipo, config.precios.tacos.combinado || 0])
            ),
          },
        ],
      },
      {
        name: 'Especialidades',
        categories: [
          {
            id: 'especialidades-carnitas',
            nombre: 'Carnitas por kilo',
            icon: 'fast-food',
            minPrecio: config.precios.especialidades.kilocarnitas || 0,
            section: 'especialidades',
            categoria: 'carnitas',
            tipos: config.categorias.tiposCarnitas || [],
            precios: Object.fromEntries(
              (config.categorias.tiposCarnitas || []).map((tipo) => [tipo, config.precios.especialidades.kilocarnitas || 0])
            ),
          },
        ],
      },
      {
        name: 'Bebidas',
        categories: [
          {
            id: 'bebidas-agua',
            nombre: 'Agua',
            icon: 'water-outline',
            minPrecio: config.precios.bebidas.agua.natural || 0,
            section: 'bebidas',
            categoria: 'agua',
            tipos: config.categorias.tiposAgua || [],
            precios: config.precios.bebidas.agua || {},
          },
          {
            id: 'bebidas-refresco',
            nombre: 'Refresco',
            icon: 'cafe-outline',
            minPrecio: config.precios.bebidas.refresco.coca || 0,
            section: 'bebidas',
            categoria: 'refresco',
            tipos: config.categorias.tiposRefresco || [],
            precios: config.precios.bebidas.refresco || {},
          },
        ],
      },
    ],
    [config]
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={isSmallScreen ? 20 : 24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.titulo}>Mesa {mesa}</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.optionsButton}>
          <Ionicons name="options" size={isSmallScreen ? 20 : 24} color="#000" />
        </TouchableOpacity>
      </View>

      <CantidadSelector cantidad={cantidad} setCantidad={setCantidad} isSmallScreen={isSmallScreen} />

      <ScrollView style={styles.productosContainer} contentContainerStyle={styles.scrollContent}>
        {sections.map((section) => (
          <View key={section.name}>
            <Text style={styles.subtitulo}>{section.name}</Text>
            {section.categories.map((cat) => (
              <React.Fragment key={cat.id}>
                <ProductoButton
                  nombre={cat.nombre}
                  precio={cat.minPrecio}
                  icon={cat.icon}
                  onPress={() =>
                    cat.categoria === 'combinado'
                      ? setCombinadoModalVisible(true)
                      : toggleCategory(cat.id)
                  }
                  isSmallScreen={isSmallScreen}
                />
                {expandedCategoryId === cat.id && cat.categoria !== 'combinado' && (
                  <View style={{ marginLeft: 20, marginBottom: 10 }}>
                    {cat.tipos.map((tipo) => (
                      <TouchableOpacity
                        key={tipo}
                        style={[styles.productoBtn, { backgroundColor: '#f0f0f0' }]}
                        onPress={() => agregarDirecto(cat.section, cat.categoria, tipo)}
                      >
                        <Text style={styles.productoText}>{tipo}</Text>
                        <Text style={styles.productoPrecio}>
                          {formatCurrency(cat.precios[tipo] || 0)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </React.Fragment>
            ))}
          </View>
        ))}
      </ScrollView>

      <View style={styles.resumenContainer}>
        <View style={styles.resumenHeader}>
          <Text style={styles.resumenText}>Total parcial:</Text>
          <Text style={styles.resumenTotal}>{formatCurrency(totalParcial)}</Text>
        </View>
        <TouchableOpacity
          style={styles.btnCuenta}
          onPress={() => navigation.navigate('Cuenta', { mesa })}
        >
          <Text style={styles.btnCuentaText}>Ver Cuenta Completa</Text>
        </TouchableOpacity>
      </View>

      <Modal animationType="fade" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, isSmallScreen && styles.smallModal]}>
            <Text style={styles.modalTitle}>Opciones</Text>
            <ScrollView contentContainerStyle={styles.modalScrollContent}>
              <TouchableOpacity style={styles.modalBtn} onPress={limpiarMesa}>
                <Text style={[styles.modalBtnText, styles.dangerText]}>Limpiar Mesa</Text>
              </TouchableOpacity>
            </ScrollView>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
              <Text style={styles.modalBtnText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal animationType="fade" transparent={true} visible={combinadoModalVisible} onRequestClose={() => setCombinadoModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, isSmallScreen && styles.smallModal]}>
            <Text style={styles.modalTitle}>Seleccionar Tipos de Carnitas</Text>
            <ScrollView contentContainerStyle={styles.modalScrollContent}>
              {config.categorias.tiposCarnitas.map((tipo) => (
                <TouchableOpacity
                  key={tipo}
                  style={[
                    styles.modalBtn,
                    selectedCombinadoTipos.includes(tipo) && styles.selectedCombinadoBtn,
                  ]}
                  onPress={() => toggleCombinadoTipo(tipo)}
                >
                  <Text style={styles.modalBtnText}>{tipo}</Text>
                  <Ionicons
                    name={selectedCombinadoTipos.includes(tipo) ? 'checkbox' : 'square-outline'}
                    size={20}
                    color="#000"
                  />
                </TouchableOpacity>
              ))}
              <TouchableOpacity style={[styles.modalBtn, styles.addCombinadoBtn]} onPress={agregarCombinado}>
                <Text style={styles.modalBtnText}>
                  Agregar Combinado ({selectedCombinadoTipos.length} seleccionados)
                </Text>
              </TouchableOpacity>
            </ScrollView>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setCombinadoModalVisible(false)}>
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
      <Text style={[styles.productoPrecio, isSmallScreen && styles.smallText]}>
        Desde {formatCurrency(precio)}
      </Text>
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
          <Ionicons name="remove" size={isSmallScreen ? 16 : 20} color="#000" />
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
          <Ionicons name="add" size={isSmallScreen ? 16 : 20} color="#000" />
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
  backButton: { padding: 8 },
  optionsButton: { padding: 8 },
  titulo: {
    fontSize: Math.min(width * 0.06, 24),
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
    color: '#000',
  },
  subtitulo: {
    fontSize: Math.min(width * 0.045, 20),
    fontWeight: '600',
    marginTop: height * 0.02,
    marginBottom: height * 0.01,
    color: '#000',
  },
  cantidadContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: height * 0.02,
    flexWrap: 'wrap',
  },
  cantidadLabel: { marginRight: 8, fontSize: Math.min(width * 0.04, 16), color: '#000' },
  cantidadControls: { flexDirection: 'row', alignItems: 'center' },
  cantidadBtn: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    shadowColor: '#aaa',
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
  },
  cantidadInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    width: 60,
    textAlign: 'center',
    marginHorizontal: 4,
    padding: 4,
    borderRadius: 6,
    color: '#000',
    backgroundColor: '#fff',
  },
  productosContainer: { flex: 1 },
  scrollContent: { paddingBottom: height * 0.02 },
  productoBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: '#aaa',
    shadowOffset: { width: 2, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    flexWrap: 'wrap', // permite que el contenido se ajuste en pantallas chicas
  },
  productoContent: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', flex: 1 },
  productoIcon: { marginRight: 8, color: '#000' },
  productoText: { fontSize: Math.min(width * 0.045, 18), color: '#000', fontWeight: '600', flexShrink: 1 },
  productoPrecio: { fontSize: Math.min(width * 0.04, 16), color: '#000', fontWeight: 'bold' },
  resumenContainer: { paddingVertical: height * 0.02 },
  resumenHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: height * 0.01 },
  resumenText: { fontSize: Math.min(width * 0.045, 18), color: '#000' },
  resumenTotal: { fontSize: Math.min(width * 0.05, 20), fontWeight: 'bold', color: '#000' },
  btnCuenta: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    shadowColor: '#aaa',
    shadowOffset: { width: 2, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 3,
    minWidth: '80%',
    alignSelf: 'center',
  },
  btnCuentaText: { color: '#000', fontSize: Math.min(width * 0.045, 18), fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' },
  modalContent: {
    backgroundColor: '#fff',
    width: '90%',
    maxWidth: 400,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#aaa',
    shadowOffset: { width: 3, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  modalTitle: { fontSize: Math.min(width * 0.05, 22), fontWeight: 'bold', color: '#000', marginBottom: 15, textAlign: 'center' },
  modalScrollContent: { paddingBottom: 10 },
  modalBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    marginVertical: 5,
    borderWidth: 1,
    borderColor: '#ccc',
    shadowColor: '#aaa',
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
    flexWrap: 'wrap',
  },
  selectedCombinadoBtn: { backgroundColor: '#e0e0e0' },
  addCombinadoBtn: { backgroundColor: '#d9d9d9', borderColor: '#bbb' },
  cancelBtn: {
    marginTop: 10,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    shadowColor: '#aaa',
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 2,
  },
  modalBtnText: { color: '#000', fontWeight: 'bold' },
  dangerText: { color: '#FF4500' },
});

export default MenuScreen;
