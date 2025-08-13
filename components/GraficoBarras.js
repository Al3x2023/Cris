import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';

const GraficoBarras = ({ datos, ancho, alto, colorBase = '#841584' }) => {
  const maxValue = Math.max(...datos.map(d => d.cantidad), 0);
  
  // Función para generar colores alternativos
  const getColor = (index) => {
    const colors = [
      colorBase,
      '#28a745',
      '#007bff',
      '#ffc107',
      '#dc3545',
      '#17a2b8'
    ];
    return colors[index % colors.length];
  };

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
                  backgroundColor: getColor(index),
                  width: (ancho / datos.length) - 10
                }
              ]}
            />
            <Text style={styles.barraLabel} numberOfLines={1}>
              {item.nombre.substring(0, 3)}
            </Text>
          </View>
        );
      })}
      {/* Eje Y */}
      <View style={styles.ejeY}>
        <Text style={styles.ejeText}>{maxValue}</Text>
        <Text style={styles.ejeText}>{Math.round(maxValue/2)}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  graficoContainer: {
    marginVertical: 10,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  barraContainer: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginHorizontal: 2,
  },
  barra: {
    borderRadius: 5,
    marginBottom: 5,
  },
  barraLabel: {
    marginTop: 5,
    fontSize: 10,
    textAlign: 'center',
    width: 30,
  },
  ejeY: {
    position: 'absolute',
    left: -30,
    height: '100%',
    justifyContent: 'space-between',
    paddingVertical: 20,
  },
  ejeText: {
    fontSize: 10,
    color: '#666',
  },
});

export default GraficoBarras;