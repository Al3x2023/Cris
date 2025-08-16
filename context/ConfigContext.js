import React, { createContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const ConfigContext = createContext();

const defaultConfig = {
  precios: {
    tacos: {
      carnitas: {
        surtida: 27,
        maciza: 27,
        costilla: 27,
        barriga: 27,
        buche: 27,
        cuero: 27,
        nana: 27,
        chamorro: 27,
        falda: 27,
        pata: 27,
        espinazo: 27,
      },
      asada: {
        cesinanatural: 30,
        cesinaadobada: 30,
        chorizoverde: 30,
        longaniza: 12,
        aguja: 30,
        arrachera: 30,
        chorizoabanero: 30,
      },
      combinado: 30, // Price for combined tacos
    },
    bebidas: {
      agua: { natural: 20, saborizada: 40 },
      refresco: { coca: 27, sprite: 27, pepsi: 27, boing: 27, manzanita: 27 },
    },
    especialidades: {
      kilocarnitas: 300,
    },
  },
  categorias: {
    tiposCarnitas: [
      'surtida',
      'maciza',
      'costilla',
      'barriga',
      'buche',
      'cuero',
      'nana',
      'chamorro',
      'falda',
      'pata',
      'espinazo',
    ],
    tiposAsada: [
      'cesinanatural',
      'cesinaadobada',
      'chorizoverde',
      'longaniza',
      'aguja',
      'arrachera',
      'chorizoabanero',
    ],
    tiposAgua: ['natural', 'saborizada'],
    tiposRefresco: ['coca', 'sprite', 'pepsi', 'boing', 'manzanita'],
  },
  mesas: [1, 2, 3, 4, 5, 6, 7, 8],
  impuesto: 0.08,
  modoOscuro: false,
};

export const ConfigProvider = ({ children }) => {
  const [config, setConfig] = useState(defaultConfig);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const storedConfig = await AsyncStorage.getItem('@config');
        if (storedConfig) {
          const parsedConfig = JSON.parse(storedConfig);
          const isValid =
            parsedConfig.precios?.tacos?.carnitas &&
            parsedConfig.precios?.tacos?.asada &&
            parsedConfig.precios?.tacos?.combinado &&
            parsedConfig.precios?.bebidas?.agua &&
            parsedConfig.precios?.bebidas?.refresco &&
            parsedConfig.precios?.especialidades?.kilocarnitas &&
            parsedConfig.categorias?.tiposCarnitas &&
            parsedConfig.categorias?.tiposAsada &&
            parsedConfig.categorias?.tiposAgua &&
            parsedConfig.categorias?.tiposRefresco &&
            parsedConfig.categorias.tiposCarnitas.every((tipo) =>
              parsedConfig.precios.tacos.carnitas.hasOwnProperty(tipo)
            ) &&
            parsedConfig.categorias.tiposAsada.every((tipo) =>
              parsedConfig.precios.tacos.asada.hasOwnProperty(tipo)
            ) &&
            parsedConfig.categorias.tiposAgua.every((tipo) =>
              parsedConfig.precios.bebidas.agua.hasOwnProperty(tipo)
            ) &&
            parsedConfig.categorias.tiposRefresco.every((tipo) =>
              parsedConfig.precios.bebidas.refresco.hasOwnProperty(tipo)
            );

          if (isValid) {
            setConfig(parsedConfig);
          } else {
            console.warn('Stored config is invalid or incomplete, using default config');
            setConfig(defaultConfig);
            await AsyncStorage.setItem('@config', JSON.stringify(defaultConfig));
          }
        } else {
          await AsyncStorage.setItem('@config', JSON.stringify(defaultConfig));
        }
      } catch (error) {
        console.error('Error al cargar configuración:', error);
        setConfig(defaultConfig);
      } finally {
        setLoading(false);
      }
    };

    loadConfig();
  }, []);

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

  const resetConfig = useCallback(async () => {
    try {
      await AsyncStorage.setItem('@config', JSON.stringify(defaultConfig));
      setConfig(defaultConfig);
    } catch (error) {
      console.error('Error al restablecer la configuración:', error);
      throw error;
    }
  }, []);

  return (
    <ConfigContext.Provider value={{ config, setConfig, loading, resetConfig }}>
      {children}
    </ConfigContext.Provider>
  );
};