import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const ConfigContext = createContext();

export const ConfigProvider = ({ children }) => {
  const [config, setConfig] = useState({
    precios: {
      tacos: {
        carnitas: { surtida: 10, maciza: 10, costilla: 12 },
        asada: { cesina: 12, costilla: 12, bistec: 12 }
      },
      bebidas: {
        agua: { natural: 5, saborizada: 6 },
        refresco: { coca: 8, sprite: 8, pepsi: 8 }
      },
      especialidades: {
        kiloCarnitas: 100
      }
    },
    categorias: {
      tiposCarnitas: ['surtida', 'maciza', 'costilla'],
      tiposAsada: ['cesina', 'costilla', 'bistec'],
      tiposAgua: ['natural', 'saborizada'],
      tiposRefresco: ['coca', 'sprite', 'pepsi']
    },
    mesas: [1, 2, 3, 4, 5, 6, 7, 8],
    impuesto: 0.08,
    modoOscuro: false
  });
  const [loading, setLoading] = useState(true);

  // Cargar configuración al iniciar
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const storedConfig = await AsyncStorage.getItem('@config');
        if (storedConfig) {
          const parsedConfig = JSON.parse(storedConfig);
          // Validate that the parsed config has the required structure
          if (
            parsedConfig.precios?.tacos?.carnitas &&
            parsedConfig.precios?.tacos?.asada &&
            parsedConfig.precios?.bebidas?.agua &&
            parsedConfig.precios?.bebidas?.refresco &&
            parsedConfig.precios?.especialidades?.kiloCarnitas &&
            parsedConfig.categorias?.tiposCarnitas &&
            parsedConfig.categorias?.tiposAsada &&
            parsedConfig.categorias?.tiposAgua &&
            parsedConfig.categorias?.tiposRefresco
          ) {
            setConfig(parsedConfig);
          } else {
            console.warn('Stored config is incomplete, using default config');
          }
        }
      } catch (error) {
        console.error('Error al cargar configuración:', error);
      } finally {
        setLoading(false);
      }
    };

    loadConfig();
  }, []);

  // Guardar configuración cuando cambia
  useEffect(() => {
    if (loading) return;

    const saveConfig = async () => {
      try {
        await AsyncStorage.setItem('@config', JSON.stringify(config));
      } catch (error) {
        console.error('Error al guardar configuración:', error);
      }
    };

    saveConfig();
  }, [config, loading]);

  return (
    <ConfigContext.Provider value={{ config, setConfig, loading }}>
      {children}
    </ConfigContext.Provider>
  );
};