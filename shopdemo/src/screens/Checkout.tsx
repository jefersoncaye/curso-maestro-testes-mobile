import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { useCart } from '../context/CartContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Checkout'>;

function gerarNumeroPedido(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export default function Checkout({ navigation }: Props) {
  const [nome, setNome] = useState('');
  const [endereco, setEndereco] = useState('');
  const [cartao, setCartao] = useState('');
  const { limparCarrinho } = useCart();

  function handleConfirmar() {
    const numeroPedido = gerarNumeroPedido();
    limparCarrinho();
    navigation.navigate('Confirmacao', { numeroPedido });
  }

  return (
    <SafeAreaView
      style={styles.safe}
      testID="tela-checkout"
      accessibilityLabel="tela-checkout"
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.titulo}>Finalizar pedido</Text>

          <Text style={styles.label}>Nome completo</Text>
          <TextInput
            style={styles.input}
            testID="input-nome"
            accessibilityLabel="input-nome"
            placeholder="Nome completo"
            value={nome}
            onChangeText={setNome}
          />

          <Text style={styles.label}>Endereco</Text>
          <TextInput
            style={styles.input}
            testID="input-endereco"
            accessibilityLabel="input-endereco"
            placeholder="Endereco"
            value={endereco}
            onChangeText={setEndereco}
          />

          <Text style={styles.label}>Numero do cartao</Text>
          <TextInput
            style={styles.input}
            testID="input-cartao"
            accessibilityLabel="input-cartao"
            placeholder="Numero do cartao"
            keyboardType="number-pad"
            value={cartao}
            onChangeText={setCartao}
          />

          <TouchableOpacity
            style={styles.botao}
            testID="btn-confirmar"
            accessibilityLabel="btn-confirmar"
            onPress={handleConfirmar}
            activeOpacity={0.7}
          >
            <Text style={styles.botaoTexto}>Confirmar pedido</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  container: { padding: 24 },
  titulo: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 24,
  },
  label: { fontSize: 13, color: '#555', marginBottom: 4, marginTop: 4 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 14,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },
  botao: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  botaoTexto: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
