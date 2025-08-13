import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ProductoButton = ({ nombre, precio, onAdd, icon, disabled = false }) => {
  return (
    <TouchableOpacity 
      style={[styles.productoBtn, disabled && styles.disabledBtn]}
      onPress={() => onAdd(nombre, precio)}
      disabled={disabled}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {icon && <Ionicons name={icon} size={20} style={{ marginRight: 8 }} />}
        <Text style={styles.productoText}>{nombre}</Text>
      </View>
      <Text style={styles.productoPrecio}>{formatCurrency(precio)}</Text>
    </TouchableOpacity>
  );
};

const formatCurrency = (amount) => {
  return `$${amount.toFixed(2)}`;
};

const styles = StyleSheet.create({
  productoBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  productoText: {
    fontSize: 16,
  },
  productoPrecio: {
    fontWeight: 'bold',
    color: '#28a745',
  },
  disabledBtn: {
    opacity: 0.5,
  },
});

export default ProductoButton;