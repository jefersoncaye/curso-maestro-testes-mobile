import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';

type Props = NativeStackScreenProps<RootStackParamList, 'Confirmacao'>;

export default function Confirmacao({ navigation, route }: Props) {
  const { numeroPedido } = route.params;

  function handleVoltarInicio() {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Catalogo' }],
    });
  }

  return (
    <SafeAreaView
      style={styles.safe}
      testID="tela-confirmacao"
      accessibilityLabel="tela-confirmacao"
    >
      <View style={styles.container}>
        <View style={styles.iconeContainer}>
          <Text style={styles.iconeTexto}>OK</Text>
        </View>

        <Text
          style={styles.titulo}
          testID="confirmacao-titulo"
          accessibilityLabel="confirmacao-titulo"
        >
          Pedido confirmado
        </Text>

        <Text
          style={styles.numero}
          testID="confirmacao-numero"
          accessibilityLabel="confirmacao-numero"
        >
          {`Pedido #${numeroPedido}`}
        </Text>

        <Text style={styles.mensagem}>
          Seu pedido foi recebido e esta sendo processado.
        </Text>

        <TouchableOpacity
          style={styles.botao}
          testID="btn-voltar-inicio"
          accessibilityLabel="btn-voltar-inicio"
          onPress={handleVoltarInicio}
          activeOpacity={0.7}
        >
          <Text style={styles.botaoTexto}>Voltar ao inicio</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  iconeContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  iconeTexto: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  titulo: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 12,
    textAlign: 'center',
  },
  numero: {
    fontSize: 18,
    color: '#007AFF',
    fontWeight: '600',
    marginBottom: 16,
  },
  mensagem: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 22,
  },
  botao: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
  },
  botaoTexto: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
