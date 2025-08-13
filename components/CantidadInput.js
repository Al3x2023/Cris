import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const CantidadInput = ({ value, onChange, label, min = 1, max, style }) => {
  const handleChange = (newValue) => {
    let num = parseInt(newValue) || min;
    if (min !== undefined) num = Math.max(min, num);
    if (max !== undefined) num = Math.min(max, num);
    onChange(num);
  };

  return (
    <View style={[styles.cantidadContainer, style]}>
      <Text style={styles.cantidadLabel}>{label}</Text>
      <View style={styles.cantidadControls}>
        <TouchableOpacity 
          style={styles.cantidadBtn} 
          onPress={() => handleChange(value - 1)}
          disabled={value <= min}
        >
          <Ionicons 
            name="remove" 
            size={20} 
            color={value <= min ? '#ccc' : '#000'} 
          />
        </TouchableOpacity>
        <TextInput
          style={styles.cantidadInput}
          keyboardType="numeric"
          value={value.toString()}
          onChangeText={(text) => handleChange(text)}
        />
        <TouchableOpacity 
          style={styles.cantidadBtn} 
          onPress={() => handleChange(value + 1)}
          disabled={value >= max}
        >
          <Ionicons 
            name="add" 
            size={20} 
            color={value >= max ? '#ccc' : '#000'} 
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cantidadContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  cantidadLabel: {
    marginRight: 10,
    fontSize: 16,
  },
  cantidadControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cantidadBtn: {
    backgroundColor: '#e9ecef',
    padding: 8,
    borderRadius: 4,
  },
  cantidadInput: {
    borderWidth: 1,
    borderColor: '#ced4da',
    width: 50,
    textAlign: 'center',
    marginHorizontal: 5,
    padding: 8,
    borderRadius: 4,
  },
});

export default CantidadInput;