import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Button,
  Alert,
  Platform,
  ScrollView,
  FlatList,
  TouchableOpacity
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DatePicker from 'react-native-date-picker';
import { Picker } from '@react-native-picker/picker';
import Svg, { Path } from 'react-native-svg';
import { usePedidos, useConfig } from '../context';

function ReportesScreen({ navigation }) {
  const { historialVentas } = usePedidos();
  const { config } = useConfig();

  // Estado para filtros
  const [fechaInicio, setFechaInicio] = useState(() => {
    const date = new Date();
    date.setHours(0, 0, 0, 0); // Set to start of day
    return date;
  });
  const [fechaFin, setFechaFin] = useState(() => {
    const date = new Date();
    date.setHours(23, 59, 59, 999); // Set to end of day
    return date;
  });
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [tipoReporte, setTipoReporte] = useState('hoy'); // 'hoy', 'semana', 'personalizado'

  // Filtrar historial por fechas
  const historialFiltrado = historialVentas.filter(ticket => {
    const fechaTicket = new Date(ticket.fecha);
    const fechaTicketStart = new Date(fechaTicket.setHours(0, 0, 0, 0));
    
    if (tipoReporte === 'hoy') {
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      return fechaTicketStart.toDateString() === hoy.toDateString();
    }
    
    if (tipoReporte === 'semana') {
      const unaSemanaAtras = new Date();
      unaSemanaAtras.setDate(unaSemanaAtras.getDate() - 7);
      unaSemanaAtras.setHours(0, 0, 0, 0);
      return fechaTicketStart >= unaSemanaAtras;
    }
    
    // Personalizado
    const inicio = new Date(fechaInicio.setHours(0, 0, 0, 0));
    const fin = new Date(fechaFin.setHours(23, 59, 59, 999));
    return fechaTicketStart >= inicio && fechaTicketStart <= fin;
  });

  // Calcular totales
  const totalVentas = historialFiltrado.reduce((sum, v) => sum + (v.total || 0), 0);
  const totalProductos = historialFiltrado.flatMap(t => t.productos).length;

  // Gráfico de productos más vendidos
  const datosGraficoProductos = () => {
    const productos = {};
    
    historialFiltrado.forEach(ticket => {
      ticket.productos.forEach(item => {
        productos[item.nombre] = (productos[item.nombre] || 0) + (item.cantidad || 0);
      });
    });
    
    return Object.entries(productos)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([nombre, cantidad]) => ({
        nombre,
        cantidad,
        color: `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`
      }));
  };

  // Gráfico de ventas por día
  const datosGraficoVentasDiarias = () => {
    const ventasPorDia = {};
    
    historialFiltrado.forEach(ticket => {
      const fecha = new Date(ticket.fecha).toLocaleDateString();
      ventasPorDia[fecha] = (ventasPorDia[fecha] || 0) + (ticket.total || 0);
    });
    
    return Object.entries(ventasPorDia).map(([fecha, total]) => ({
      fecha,
      total,
    }));
  };

  // Exportar a CSV
  const exportarACSV = () => {
    let csvContent = "Mesa,Fecha,Producto,Cantidad,Precio Unitario,Total\n";
    
    historialFiltrado.forEach(ticket => {
      ticket.productos.forEach(item => {
        csvContent += `${ticket.mesa},${ticket.fecha},${item.nombre},${item.cantidad || 0},${item.precio || 0},${item.total || 0}\n`;
      });
    });
    
    Alert.alert(
      "Exportar a CSV",
      `Se generó un reporte con ${historialFiltrado.length} ventas`,
      [
        { text: "Cancelar" },
        { text: "Compartir", onPress: () => compartirReporte(csvContent) }
      ]
    );
  };

  const compartirReporte = (contenido) => {
    if (Platform.OS === 'web') {
      const blob = new Blob([contenido], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      window.open(url);
    } else {
      Alert.alert("Reporte listo", "El archivo CSV está listo para compartir");
    }
  };

  // Comparativa semanal
  const comparativaSemanal = () => {
    const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const ventasPorDiaSemana = [0, 0, 0, 0, 0, 0, 0];
    const conteoPorDiaSemana = [0, 0, 0, 0, 0, 0, 0];
    
    historialFiltrado.forEach(ticket => {
      const diaSemana = new Date(ticket.fecha).getDay();
      ventasPorDiaSemana[diaSemana] += (ticket.total || 0);
      conteoPorDiaSemana[diaSemana]++;
    });
    
    return dias.map((dia, index) => ({
      dia,
      ventas: ventasPorDiaSemana[index],
      promedio: conteoPorDiaSemana[index] > 0 
        ? ventasPorDiaSemana[index] / conteoPorDiaSemana[index] 
        : 0,
    }));
  };

  const formatCurrency = (amount) => {
    if (typeof amount !== 'number' || isNaN(amount)) {
      return '$0.00';
    }
    return `$${amount.toFixed(2)}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} />
        </TouchableOpacity>
        <Text style={styles.titulo}>Reportes Avanzados</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Controles de filtro */}
      <View style={styles.filtrosContainer}>
        <Button 
          title={mostrarFiltros ? "Ocultar filtros" : "Mostrar filtros"} 
          onPress={() => setMostrarFiltros(!mostrarFiltros)}
          color="#841584"
        />
        
        {mostrarFiltros && (
          <View style={styles.filtrosContent}>
            <View style={styles.filtroRow}>
              <Text style={styles.filtroLabel}>Rango de fechas:</Text>
              <Picker
                selectedValue={tipoReporte}
                style={styles.filtroPicker}
                onValueChange={setTipoReporte}>
                <Picker.Item label="Hoy" value="hoy" />
                <Picker.Item label="Última semana" value="semana" />
                <Picker.Item label="Personalizado" value="personalizado" />
              </Picker>
            </View>
            
            {tipoReporte === 'personalizado' && (
              <View style={styles.filtroRow}>
                <Text style={styles.filtroLabel}>Desde:</Text>
                <DatePicker
                  style={styles.filtroDate}
                  date={fechaInicio}
                  mode="date"
                  onDateChange={(date) => setFechaInicio(new Date(date.setHours(0, 0, 0, 0)))}
                />
                
                <Text style={styles.filtroLabel}>Hasta:</Text>
                <DatePicker
                  style={styles.filtroDate}
                  date={fechaFin}
                  mode="date"
                  onDateChange={(date) => setFechaFin(new Date(date.setHours(23, 59, 59, 999)))}
                />
              </View>
            )}
          </View>
        )}
      </View>

      {/* Acciones de exportación */}
      <View style={styles.accionesContainer}>
        <Button 
          title="Exportar a CSV" 
          onPress={exportarACSV}
          color="#28a745"
        />
        
        <Button 
          title="Ver Historial Completo" 
          onPress={() => navigation.navigate('HistorialVentas')}
          color="#841584"
        />
      </View>

      <ScrollView>
        {/* Resumen General */}
        <View style={styles.reporteCard}>
          <Text style={styles.reporteTitle}>Resumen General</Text>
          
          <View style={styles.reporteLine}>
            <Text>Total ventas:</Text>
            <Text style={styles.reporteValue}>{formatCurrency(totalVentas)}</Text>
          </View>
          
          <View style={styles.reporteLine}>
            <Text>Total productos:</Text>
            <Text style={styles.reporteValue}>{totalProductos}</Text>
          </View>
          
          <View style={styles.reporteLine}>
            <Text>Periodo:</Text>
            <Text style={styles.reporteValue}>
              {tipoReporte === 'hoy' 
                ? 'Hoy' 
                : tipoReporte === 'semana' 
                  ? 'Última semana' 
                  : `${fechaInicio.toLocaleDateString()} - ${fechaFin.toLocaleDateString()}`}
            </Text>
          </View>
        </View>

        {/* Gráfico de productos más vendidos */}
        <View style={styles.reporteCard}>
          <Text style={styles.reporteTitle}>Productos Más Vendidos</Text>
          
          {datosGraficoProductos().length > 0 ? (
            <View>
              <GraficoBarras 
                datos={datosGraficoProductos()}
                ancho={300}
                alto={200}
              />
              
              {datosGraficoProductos().map((item, index) => (
                <View key={index} style={styles.leyendaItem}>
                  <View style={[styles.leyendaColor, { backgroundColor: item.color }]} />
                  <Text style={styles.leyendaText}>
                    {item.nombre}: {formatCurrency(item.cantidad)} unidades
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.emptyText}>No hay datos de ventas</Text>
          )}
        </View>

        {/* Comparativa semanal */}
        <View style={styles.reporteCard}>
          <Text style={styles.reporteTitle}>Comparativa Semanal</Text>
          
          {comparativaSemanal().some(d => d.ventas > 0) ? (
            <View>
              <GraficoLineas 
                datos={comparativaSemanal()}
                ancho={300}
                alto={200}
              />
              
              <View style={styles.comparativaGrid}>
                <Text style={styles.gridHeader}>Día</Text>
                <Text style={styles.gridHeader}>Ventas</Text>
                <Text style={styles.gridHeader}>Promedio</Text>
                
                {comparativaSemanal().map((dia, index) => (
                  <React.Fragment key={index}>
                    <Text style={styles.gridCell}>{dia.dia}</Text>
                    <Text style={styles.gridCell}>{formatCurrency(dia.ventas)}</Text>
                    <Text style={styles.gridCell}>{formatCurrency(dia.promedio)}</Text>
                  </React.Fragment>
                ))}
              </View>
            </View>
          ) : (
            <Text style={styles.emptyText}>No hay datos para comparar</Text>
          )}
        </View>

        {/* Detalle de ventas por mesa */}
        <View style={styles.reporteCard}>
          <Text style={styles.reporteTitle}>Ventas por Mesa</Text>
          
          {historialFiltrado.length > 0 ? (
            <View>
              <FlatList
                horizontal
                data={historialFiltrado}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                  <View style={styles.mesaCard}>
                    <Text style={styles.mesaCardTitle}>Mesa {item.mesa}</Text>
                    <Text>{formatCurrency(item.total)}</Text>
                    <Text>{new Date(item.fecha).toLocaleDateString()}</Text>
                  </View>
                )}
              />
            </View>
          ) : (
            <Text style={styles.emptyText}>No hay ventas en el periodo</Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

// Componente para gráfico de barras
function GraficoBarras({ datos, ancho, alto }) {
  const maxValue = Math.max(...datos.map(d => d.cantidad), 0);
  
  return (
    <View style={[styles.graficoContainer, { width: ancho, height: alto }]}>
      {datos.map((item, index) => {
        const altura = maxValue > 0 ? (item.cantidad / maxValue) * (alto - 40) : 0;
        return (
          <View key={index} style={styles.barraContainer}>
            <View 
              style={[
                styles.barra, 
                { 
                  height: altura, 
                  backgroundColor: item.color,
                  width: (ancho / datos.length) - 10
                }
              ]}
            />
            <Text style={styles.barraLabel}>{item.nombre.substring(0, 3)}</Text>
          </View>
        );
      })}
    </View>
  );
}

// Componente para gráfico de líneas
function GraficoLineas({ datos, ancho, alto }) {
  const maxVentas = Math.max(...datos.map(d => d.ventas), 0);
  
  return (
    <View style={[styles.graficoContainer, { width: ancho, height: alto }]}>
      <View style={styles.lineaHorizontal} />
      
      {datos.map((dia, index) => {
        const y = maxVentas > 0 ? alto - 30 - (dia.ventas / maxVentas) * (alto - 40) : alto - 30;
        const nextDia = datos[index + 1];
        let path = null;
        
        if (nextDia) {
          const nextY = maxVentas > 0 ? alto - 30 - (nextDia.ventas / maxVentas) * (alto - 40) : alto - 30;
          const x = (index / (datos.length - 1)) * (ancho - 40) + 20;
          const nextX = ((index + 1) / (datos.length - 1)) * (ancho - 40) + 20;
          
          path = `M${x},${y} L${nextX},${nextY}`;
        }
        
        return (
          <View key={index} style={styles.puntoContainer}>
            <View 
              style={[
                styles.punto, 
                { 
                  left: `${(index / (datos.length - 1)) * 100}%`,
                  top: y,
                }
              ]}
            />
            
            {path && (
              <Svg height={alto} width={ancho}>
                <Path d={path} stroke="#841584" strokeWidth="2" fill="none" />
              </Svg>
            )}
            
            <Text style={styles.puntoLabel}>{dia.dia}</Text>
          </View>
        );
      })}
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
  filtrosContainer: {
    marginBottom: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 10,
  },
  filtrosContent: {
    marginTop: 10,
  },
  filtroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  filtroLabel: {
    marginRight: 10,
    minWidth: 60,
  },
  filtroPicker: {
    flex: 1,
    height: 50,
  },
  filtroDate: {
    flex: 1,
  },
  accionesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
  },
  reporteCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
  },
  reporteTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  reporteLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  reporteValue: {
    fontWeight: '600',
  },
  graficoContainer: {
    marginVertical: 10,
    alignSelf: 'center',
  },
  barraContainer: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginHorizontal: 2,
  },
  barra: {
    borderRadius: 5,
  },
  barraLabel: {
    marginTop: 5,
    fontSize: 10,
  },
  lineaHorizontal: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 30,
    height: 1,
    backgroundColor: '#ccc',
  },
  puntoContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  punto: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#841584',
    transform: [{ translateX: -4 }, { translateY: -4 }],
  },
  puntoLabel: {
    position: 'absolute',
    bottom: 10,
    fontSize: 10,
    textAlign: 'center',
    width: 40,
    left: -20,
  },
  leyendaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
  },
  leyendaColor: {
    width: 15,
    height: 15,
    marginRight: 8,
    borderRadius: 3,
  },
  leyendaText: {
    fontSize: 14,
  },
  comparativaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  gridHeader: {
    fontWeight: 'bold',
    width: '33%',
    padding: 5,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  gridCell: {
    width: '33%',
    padding: 5,
    borderBottomWidth: 1,
    borderColor: '#f5f5f5',
  },
  mesaCard: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 10,
    marginRight: 10,
    width: 120,
    alignItems: 'center',
  },
  mesaCardTitle: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  emptyText: {
    textAlign: 'center',
    marginVertical: 10,
    color: '#6c757d',
  },
});

export default ReportesScreen;