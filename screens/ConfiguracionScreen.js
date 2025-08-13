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
  const { config, setConfig } = useConfig();
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
                  <Text style={styles.tipoProducto}>{tipo.charAt(0).toUpperCase() + tipo.slice(1)}</Text>
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
                  <Text style={styles.tipoProducto}>{tipo.charAt(0).toUpperCase() + tipo.slice(1)}</Text>
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
          <Text style={styles.configTitle}>Mesas</Text>
          <View style={styles.mesasList}>
            {config.mesas.map(num => (
              <View key={num} style={styles.mesaItem}>
                <Text style={styles.mesaText}>Mesa {num}</Text>
                <TouchableOpacity onPress={() => eliminarMesa(num)}>
                  <Ionicons name="trash" size={20} color="#dc3545" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
          <View style={styles.addMesaContainer}>
            <TextInput
              style={styles.addMesaInput}
              placeholder="Número de mesa"
              keyboardType="numeric"
              value={nuevaMesa}
              onChangeText={setNuevaMesa}
            />
            <Button 
              title="Agregar" 
              onPress={agregarMesa} 
              disabled={!nuevaMesa}
            />
          </View>
        </View>

        {/* Sección de Impuestos */}
        <View style={styles.configSection}>
          <Text style={styles.configTitle}>Impuesto</Text>
          <View style={styles.impuestoContainer}>
            <TextInput
              style={styles.impuestoInput}
              keyboardType="numeric"
              value={(config.impuesto * 100).toString()}
              onChangeText={(text) => {
                const num = parseFloat(text) || 0;
                setConfig(prev => ({
                  ...prev,
                  impuesto: num / 100
                }));
              }}
            />
            <Text style={styles.porcentaje}>%</Text>
          </View>
        </View>

        {/* Sección de Apariencia */}
        <View style={styles.configSection}>
          <Text style={styles.configTitle}>Apariencia</Text>
          <View style={styles.switchContainer}>
            <Text style={styles.switchLabel}>Modo oscuro:</Text>
            <Switch
              value={config.modoOscuro}
              onValueChange={toggleModoOscuro}
              trackColor={{ false: "#767577", true: "#81b0ff" }}
              thumbColor={config.modoOscuro ? "#f5dd4b" : "#f4f3f4"}
            />
          </View>
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
    backgroundColor: '#fff',
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
  },
  configSection: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
  },
  configTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitulo: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 5,
    color: '#555',
  },
  tipoProducto: {
    fontWeight: '600',
    marginTop: 5,
    marginBottom: 5,
    color: '#333',
  },
  precioItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingHorizontal: 5,
  },
  precioText: {
    textTransform: 'capitalize',
  },
  precioValue: {
    fontWeight: '600',
  },
  precioInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 5,
  },
  precioLabel: {
    width: 120,
    textTransform: 'capitalize',
  },
  precioInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ced4da',
    padding: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
  },
  configButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 15,
  },
  mesasList: {
    marginBottom: 15,
  },
  mesaItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  mesaText: {
    fontSize: 16,
  },
  addMesaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  addMesaInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ced4da',
    padding: 10,
    borderRadius: 4,
    marginRight: 10,
    backgroundColor: '#fff',
  },
  impuestoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  impuestoInput: {
    borderWidth: 1,
    borderColor: '#ced4da',
    width: 80,
    padding: 8,
    borderRadius: 4,
    marginRight: 5,
    backgroundColor: '#fff',
  },
  porcentaje: {
    fontSize: 16,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
  },
  switchLabel: {
    fontSize: 16,
  },
});

export default ConfiguracionScreen;