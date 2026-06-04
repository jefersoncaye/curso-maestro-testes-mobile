import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { CartProvider } from './src/context/CartContext';
import Login from './src/screens/Login';
import Catalogo from './src/screens/Catalogo';
import Detalhe from './src/screens/Detalhe';
import Carrinho from './src/screens/Carrinho';
import Checkout from './src/screens/Checkout';
import Confirmacao from './src/screens/Confirmacao';
import { Produto } from './src/data/produtos';

export type RootStackParamList = {
  Login: undefined;
  Catalogo: undefined;
  Detalhe: { produto: Produto };
  Carrinho: undefined;
  Checkout: undefined;
  Confirmacao: { numeroPedido: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <SafeAreaProvider>
    <CartProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Login"
          screenOptions={{ headerShown: false }}
        >
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="Catalogo" component={Catalogo} />
          <Stack.Screen name="Detalhe" component={Detalhe} />
          <Stack.Screen name="Carrinho" component={Carrinho} />
          <Stack.Screen name="Checkout" component={Checkout} />
          <Stack.Screen name="Confirmacao" component={Confirmacao} />
        </Stack.Navigator>
      </NavigationContainer>
    </CartProvider>
    </SafeAreaProvider>
  );
}
