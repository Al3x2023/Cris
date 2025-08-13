import React from 'react';
import { PedidosContext, PedidosProvider } from './PedidosContext';
import { ConfigContext, ConfigProvider } from './ConfigContext';

export const AppProvider = ({ children }) => {
  return (
    <ConfigProvider>
      <PedidosProvider>
        {children}
      </PedidosProvider>
    </ConfigProvider>
  );
};

// Hook personalizado para acceder a los pedidos
export const usePedidos = () => {
  const context = React.useContext(PedidosContext);
  if (!context) {
    throw new Error('usePedidos debe usarse dentro de un PedidosProvider');
  }
  return context;
};

// Hook personalizado para acceder a la configuración
export const useConfig = () => {
  const context = React.useContext(ConfigContext);
  if (!context) {
    throw new Error('useConfig debe usarse dentro de un ConfigProvider');
  }
  return context;
};