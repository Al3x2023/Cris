import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';

const GraficoLineas = ({ datos, ancho, alto, colorLinea = '#841584' }) => {
  const maxVentas = Math.max(...datos.map(d => d.ventas), 0);
  const padding = 20;
  
  return (
    <View style={[styles.graficoContainer, { width: ancho, height: alto }]}>
      <Svg width={ancho} height={alto}>
        {/* Eje horizontal */}
        <Path 
          d={`M${padding},${alto - padding} H${ancho - padding}`} 
          stroke="#ccc" 
          strokeWidth="1" 
        />
        
        {/* Línea del gráfico */}
        {datos.map((dia, index) => {
          const nextDia = datos[index + 1];
          if (!nextDia) return null;
          
          const x = padding + (index / (datos.length - 1)) * (ancho - 2 * padding);
          const y = alto - padding - (dia.ventas / maxVentas) * (alto - 2 * padding);
          const nextX = padding + ((index + 1) / (datos.length - 1)) * (ancho - 2 * padding);
          const nextY = alto - padding - (nextDia.ventas / maxVentas) * (alto - 2 * padding);
          
          return (
            <React.Fragment key={index}>
              <Path
                d={`M${x},${y} L${nextX},${nextY}`}
                stroke={colorLinea}
                strokeWidth="2"
                fill="none"
              />
              <Circle
                cx={x}
                cy={y}
                r="4"
                fill={colorLinea}
              />
            </React.Fragment>
          );
        })}
        
        {/* Etiquetas del eje X */}
        {datos.map((dia, index) => {
          const x = padding + (index / (datos.length - 1)) * (ancho - 2 * padding);
          return (
            <Text
              key={`label-${index}`}
              style={[
                styles.ejeXLabel,
                { left: x - 15, top: alto - padding + 5 }
              ]}
            >
              {dia.dia}
            </Text>
          );
        })}
      </Svg>
      
      {/* Leyenda del eje Y */}
      <View style={styles.ejeYContainer}>
        <Text style={styles.ejeYLabel}>{maxVentas}</Text>
        <Text style={styles.ejeYLabel}>{Math.round(maxVentas/2)}</Text>
        <Text style={styles.ejeYLabel}>0</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  graficoContainer: {
    marginVertical: 10,
    alignSelf: 'center',
  },
  ejeXLabel: {
    position: 'absolute',
    fontSize: 10,
    color: '#666',
    width: 30,
    textAlign: 'center',
  },
  ejeYContainer: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: '100%',
    justifyContent: 'space-between',
    paddingVertical: 20,
    width: 30,
    alignItems: 'flex-end',
    paddingRight: 5,
  },
  ejeYLabel: {
    fontSize: 10,
    color: '#666',
  },
});

export default GraficoLineas;