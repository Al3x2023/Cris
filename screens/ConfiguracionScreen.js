import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Button,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Switch,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppProvider, usePedidos, useConfig,ConfigContext } from '../context';
function ConfiguracionScreen({ navigation }) {
  const { config, setConfig, resetConfig } = useConfig();
  const [editPrecios, setEditPrecios] = useState(false);
  const [nuevosPrecios, setNuevosPrecios] = useState({...config.precios});
  const [nuevaMesa, setNuevaMesa] = useState('');

  const guardarCambios = () => {
    setConfig(prev => ({
      ...prev,
      precios: nuevosPrecios
    }));
    setEditPrecios(false);
    showToast("Cambios guardados");
  };

  const agregarMesa = () => {
    const num = parseInt(nuevaMesa);
    if (!isNaN(num) && !config.mesas.includes(num)) {
      setConfig(prev => ({
        ...prev,
        mesas: [...prev.mesas, num].sort((a, b) => a - b)
      }));
      setNuevaMesa('');
      showToast(`Mesa ${num} agregada`);
    } else {
      Alert.alert("Error", "Número de mesa inválido o ya existe");
    }
  };

  const eliminarMesa = (mesaNum) => {
    setConfig(prev => ({
      ...prev,
      mesas: prev.mesas.filter(num => num !== mesaNum)
    }));
    showToast(`Mesa ${mesaNum} eliminada`);
  };

  const toggleModoOscuro = () => {
    setConfig(prev => ({
      ...prev,
      modoOscuro: !prev.modoOscuro
    }));
  };

  const showToast = (message) => {
    Alert.alert(message);
  };

  const handleResetConfig = () => {
    Alert.alert(
      "Restablecer Configuración",
      "¿Estás seguro de que quieres restablecer toda la configuración a los valores predeterminados? Esta acción no se puede deshacer.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Restablecer",
          style: "destructive",
          onPress: async () => {
            try {
              await resetConfig();
              showToast("La configuración ha sido restablecida.");
              // Opcional: navegar a otra pantalla o recargar la actual si es necesario
              navigation.goBack();
            } catch (error) {
              Alert.alert("Error", "No se pudo restablecer la configuración.");
            }
          },
        },
      ]
    );
  };

  const formatCurrency = (amount) => {
    return `$${amount.toFixed(2)}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} />
        </TouchableOpacity>
        <Text style={styles.titulo}>Configuración</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView>
        {/* Sección de Precios */}
        <View style={styles.configSection}>
          <Text style={styles.configTitle}>Precios</Text>
          
          {editPrecios ? (
            <View>
              {/* Precios de Tacos */}
              <Text style={styles.subtitulo}>Tacos</Text>
              {Object.entries(nuevosPrecios.tacos).map(([tipo, variedades]) => (
                <View key={tipo}>
                  <Text style={styles.tipoProducto}>{tipo.charAt(0).toUpperCase()+tipo.slice(1)}</Text>
                  {typeof variedades === 'object' ? (
                    Object.entries(variedades).map(([variedad, precio]) => (
                      <View key={`${tipo}-${variedad}`} style={styles.precioInputContainer}>
                        <Text style={styles.precioLabel}>{variedad}:</Text>
                        <TextInput
                          style={styles.precioInput}
                          keyboardType="numeric"
                          value={precio.toString()}
                          onChangeText={(text) => {
                            const num = parseFloat(text) || 0;
                            setNuevosPrecios(prev => ({
                              ...prev,
                              tacos: {
                                ...prev.tacos,
                                [tipo]: {
                                  ...prev.tacos[tipo],
                                  [variedad]: num
                                }
                              }
                            }));
                          }}
                        />
                      </View>
                    ))
                  ) : (
                    <View style={styles.precioInputContainer}>
                      <Text style={styles.precioLabel}>Precio:</Text>
                      <TextInput
                        style={styles.precioInput}
                        keyboardType="numeric"
                        value={variedades.toString()}
                        onChangeText={(text) => {
                          const num = parseFloat(text) || 0;
                          setNuevosPrecios(prev => ({
                            ...prev,
                            tacos: {
                              ...prev.tacos,
                              [tipo]: num
                            }
                          }));
                        }}
                      />
                    </View>
                  )}
                </View>
              ))}

              {/* Precios de Bebidas */}
              <Text style={styles.subtitulo}>Bebidas</Text>
              {Object.entries(nuevosPrecios.bebidas).map(([tipo, variedades]) => (
                <View key={tipo}>
                  <Text style={styles.tipoProducto}>{tipo.charAt(0).toUpperCase()+tipo.slice(1)}</Text>
                  {Object.entries(variedades).map(([variedad, precio]) => (
                    <View key={`${tipo}-${variedad}`} style={styles.precioInputContainer}>
                      <Text style={styles.precioLabel}>{variedad}:</Text>
                      <TextInput
                        style={styles.precioInput}
                        keyboardType="numeric"
                        value={precio.toString()}
                        onChangeText={(text) => {
                          const num = parseFloat(text) || 0;
                          setNuevosPrecios(prev => ({
                            ...prev,
                            bebidas: {
                              ...prev.bebidas,
                              [tipo]: {
                                ...prev.bebidas[tipo],
                                [variedad]: num
                              }
                            }
                          }));
                        }}
                      />
                    </View>
                  ))}
                </View>
              ))}

              {/* Precios de Especialidades */}
              <Text style={styles.subtitulo}>Especialidades</Text>
              {Object.entries(nuevosPrecios.especialidades).map(([producto, precio]) => (
                <View key={producto} style={styles.precioInputContainer}>
                  <Text style={styles.precioLabel}>{producto}:</Text>
                  <TextInput
                    style={styles.precioInput}
                    keyboardType="numeric"
                    value={precio.toString()}
                    onChangeText={(text) => {
                      const num = parseFloat(text) || 0;
                      setNuevosPrecios(prev => ({
                        ...prev,
                        especialidades: {
                          ...prev.especialidades,
                          [producto]: num
                        }
                      }));
                    }}
                  />
                </View>
              ))}

              <View style={styles.configButtons}>
                <Button title="Guardar" onPress={guardarCambios} />
                <Button 
                  title="Cancelar" 
                  onPress={() => {
                    setNuevosPrecios({...config.precios});
                    setEditPrecios(false);
                  }} 
                  color="#999"
                />
              </View>
            </View>
          ) : (
            <View>
              {/* Vista de solo lectura de precios */}
              <Text style={styles.subtitulo}>Tacos</Text>
              {Object.entries(config.precios.tacos).map(([tipo, variedades]) => (
                <View key={tipo}>
                  <Text style={styles.tipoProducto}>{tipo.charAt(0).toUpperCase() + tipo.slice(1)}</Text>
                  {typeof variedades === 'object' ? (
                    Object.entries(variedades).map(([variedad, precio]) => (
                      <View key={`${tipo}-${variedad}`} style={styles.precioItem}>
                        <Text style={styles.precioText}>{variedad}:</Text>
                        <Text style={styles.precioValue}>{formatCurrency(precio)}</Text>
                      </View>
                    ))
                  ) : (
                    <View style={styles.precioItem}>
                      <Text style={styles.precioText}>Precio:</Text>
                      <Text style={styles.precioValue}>{formatCurrency(variedades)}</Text>
                    </View>
                  )}
                </View>
              ))}

              <Text style={styles.subtitulo}>Bebidas</Text>
              {Object.entries(config.precios.bebidas).map(([tipo, variedades]) => (
                <View key={tipo}>
                  <Text style={styles.tipoProducto}>{tipo.charAt(0).toUpperCase() + tipo.slice(1)}</Text>
                  {Object.entries(variedades).map(([variedad, precio]) => (
                    <View key={`${tipo}-${variedad}`} style={styles.precioItem}>
                      <Text style={styles.precioText}>{variedad}:</Text>
                      <Text style={styles.precioValue}>{formatCurrency(precio)}</Text>
                    </View>
                  ))}
                </View>
              ))}

              <Text style={styles.subtitulo}>Especialidades</Text>
              {Object.entries(config.precios.especialidades).map(([producto, precio]) => (
                <View key={producto} style={styles.precioItem}>
                  <Text style={styles.precioText}>{producto}:</Text>
                  <Text style={styles.precioValue}>{formatCurrency(precio)}</Text>
                </View>
              ))}

              <Button 
                title="Editar Precios" 
                onPress={() => setEditPrecios(true)} 
                style={{ marginTop: 10 }}
              />
            </View>
          )}
        </View>

        {/* Sección de Mesas */}
        <View style={styles.configSection}>
          <Text style={styles.configTitle}>Administrar Mesas</Text>
          <View style={styles.mesasContainer}>
            {config.mesas.map(mesaNum => (
              <View key={mesaNum} style={styles.mesaItem}>
                <Text>Mesa {mesaNum}</Text>
                <TouchableOpacity onPress={() => eliminarMesa(mesaNum)}>
                  <Ionicons name="trash-bin" size={20} color="#dc3545" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
          <View style={styles.agregarMesaContainer}>
            <TextInput
              style={styles.mesaInput}
              placeholder="Número de mesa"
              keyboardType="numeric"
              value={nuevaMesa}
              onChangeText={setNuevaMesa}
            />
            <Button title="Agregar Mesa" onPress={agregarMesa} />
          </View>
        </View>

        {/* Sección de Modo Oscuro */}
        <View style={styles.configSection}>
          <View style={styles.configItem}>
            <Text style={styles.configTitle}>Modo Oscuro</Text>
            <Switch
              trackColor={{ false: "#767577", true: "#81b0ff" }}
              thumbColor={config.modoOscuro ? "#f5dd4b" : "#f4f3f4"}
              ios_backgroundColor="#3e3e3e"
              onValueChange={toggleModoOscuro}
              value={config.modoOscuro}
            />
          </View>
        </View>

        {/* Sección de Restablecer */}
        <View style={styles.configSection}>
          <TouchableOpacity
            style={styles.resetButton}
            onPress={handleResetConfig}
          >
            <Text style={styles.resetButtonText}>Restablecer Configuración</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 20,
    backgroundColor: '#ffffff', // blanco
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
    color: '#000', // negro
  },
  configSection: {
    backgroundColor: '#f9f9f9', // muy claro
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ccc',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  configTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#000',
  },
  subtitulo: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
    color: '#000',
  },
  tipoProducto: {
    fontSize: 15,
    fontWeight: '500',
    marginTop: 8,
    color: '#333',
  },
  precioInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginLeft: 15,
    marginBottom: 5
  },
  precioLabel: {
    fontSize: 14,
    color: '#333'
  },
  precioInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
    color: '#000',
    padding: 8,
    width: 80,
    textAlign: 'center',
    borderRadius: 5
  },
  precioItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginLeft: 15,
    marginBottom: 5
  },
  precioText: {
    color: '#333'
  },
  precioValue: {
    color: '#000'
  },
  mesasContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center'
  },
  mesaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    margin: 5,
    width: 100,
    backgroundColor: '#fff'
  },
  agregarMesaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10
  },
  mesaInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
    color: '#000',
    padding: 8,
    width: 150,
    marginRight: 10,
    borderRadius: 5
  },
  configItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  resetButton: {
    backgroundColor: '#b22222',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20
  },
  resetButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16
  },
  configButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10
  }
});


export default ConfiguracionScreen;