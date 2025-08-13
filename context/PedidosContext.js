import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const PedidosContext = createContext();

export const PedidosProvider = ({ children }) => {
  const [pedidos, setPedidos] = useState({});
  const [historialVentas, setHistorialVentas] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cargar datos al iniciar
  useEffect(() => {
    const loadData = async () => {
      try {
        const storedPedidos = await AsyncStorage.getItem('@pedidos');
        const storedHistorial = await AsyncStorage.getItem('@historial');
        
        if (storedPedidos) setPedidos(JSON.parse(storedPedidos));
        if (storedHistorial) setHistorialVentas(JSON.parse(storedHistorial));
      } catch (error) {
        console.error('Error al cargar pedidos:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Guardar datos cuando cambian
  useEffect(() => {
    if (loading) return;
    
    const saveData = async () => {
      try {
        await AsyncStorage.setItem('@pedidos', JSON.stringify(pedidos));
        await AsyncStorage.setItem('@historial', JSON.stringify(historialVentas));
      } catch (error) {
        console.error('Error al guardar pedidos:', error);
      }
    };
    
    saveData();
  }, [pedidos, historialVentas, loading]);

  // Función para limpiar un pedido
  const limpiarPedido = (mesa) => {
    setPedidos(prev => {
      const nuevosPedidos = {...prev};
      delete nuevosPedidos[mesa];
      return nuevosPedidos;
    });
  };

  // Función para agregar una venta al historial
  const agregarVenta = (ticket) => {
    setHistorialVentas(prev => [ticket, ...prev]);
  };

  return (
    <PedidosContext.Provider 
      value={{
        pedidos,
        setPedidos,
        historialVentas,
        setHistorialVentas,
        limpiarPedido,
        agregarVenta,
        loading
      }}
    >
      {children}
    </PedidosContext.Provider>
  );
};