import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { formatarPreco } from '../data/produtos';
import { useCart } from '../context/CartContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Detalhe'>;

const CORES_PLACEHOLDER = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'];

export default function Detalhe({ navigation, route }: Props) {
  const { produto } = route.params;
  const { adicionarItem, incrementar, decrementar, itens } = useCart();
  const [mensagem, setMensagem] = useState('');
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const quantidadeNoCarrinho =
    itens.find((i) => i.produto.id === produto.id)?.quantidade ?? 0;

  const cor = CORES_PLACEHOLDER[produto.id % CORES_PLACEHOLDER.length];
  const inicial = produto.nome.charAt(0).toUpperCase();

  function handleAdicionar() {
    adicionarItem(produto);
    setMensagem('Produto adicionado com sucesso!');
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setMensagem(''), 2500);
  }

  function handleVoltar() {
    navigation.goBack();
  }

  return (
    <SafeAreaView
      style={styles.safe}
      testID="tela-detalhe"
      accessibilityLabel="tela-detalhe"
    >
      <ScrollView contentContainerStyle={styles.container}>

        <View style={[styles.placeholder, { backgroundColor: cor }]}>
          <Text style={styles.inicial}>{inicial}</Text>
        </View>

        <Text
          style={styles.nome}
          testID="detalhe-nome"
          accessibilityLabel="detalhe-nome"
        >
          {produto.nome}
        </Text>

        <Text
          style={styles.preco}
          testID="detalhe-preco"
          accessibilityLabel="detalhe-preco"
        >
          {formatarPreco(produto.preco)}
        </Text>

        <Text
          style={styles.descricao}
          testID="detalhe-descricao"
          accessibilityLabel="detalhe-descricao"
        >
          {produto.descricao}
        </Text>

        <TouchableOpacity
          style={styles.botaoAdicionar}
          testID="btn-adicionar"
          accessibilityLabel="btn-adicionar"
          onPress={handleAdicionar}
          activeOpacity={0.7}
        >
          <Text style={styles.botaoAdicionarTexto}>Adicionar ao carrinho</Text>
        </TouchableOpacity>

        {quantidadeNoCarrinho > 0 && (
          <View style={styles.quantidadeContainer}>
            <TouchableOpacity
              style={styles.btnQtd}
              testID="btn-decrementar-detalhe"
              accessibilityLabel="btn-decrementar-detalhe"
              onPress={() => decrementar(produto.id)}
              activeOpacity={0.7}
            >
              <Text style={styles.btnQtdTexto}>−</Text>
            </TouchableOpacity>
            <Text
              style={styles.quantidadeTexto}
              testID="quantidade-detalhe"
              accessibilityLabel="quantidade-detalhe"
            >
              {quantidadeNoCarrinho} no carrinho
            </Text>
            <TouchableOpacity
              style={styles.btnQtd}
              testID="btn-incrementar-detalhe"
              accessibilityLabel="btn-incrementar-detalhe"
              onPress={() => incrementar(produto.id)}
              activeOpacity={0.7}
            >
              <Text style={styles.btnQtdTexto}>+</Text>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity
          style={styles.botaoVerCarrinho}
          testID="btn-ver-carrinho"
          accessibilityLabel="btn-ver-carrinho"
          onPress={() => navigation.navigate('Carrinho')}
          activeOpacity={0.7}
        >
          <Text style={styles.botaoVerCarrinhoTexto}>Ver carrinho</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.botaoVoltar}
          testID="btn-voltar"
          accessibilityLabel="btn-voltar"
          onPress={handleVoltar}
          activeOpacity={0.7}
        >
          <Text style={styles.botaoVoltarTexto}>Voltar</Text>
        </TouchableOpacity>
      </ScrollView>

      {mensagem !== '' && (
        <View
          style={styles.toast}
          testID="msg-produto-adicionado"
          accessibilityLabel="msg-produto-adicionado"
        >
          <Text style={styles.toastTexto}>{mensagem}</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  container: { padding: 24, alignItems: 'center' },
  placeholder: {
    width: 120,
    height: 120,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  inicial: { fontSize: 52, fontWeight: 'bold', color: '#fff' },
  nome: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#222',
    textAlign: 'center',
    marginBottom: 8,
  },
  preco: {
    fontSize: 20,
    color: '#007AFF',
    fontWeight: '600',
    marginBottom: 16,
  },
  descricao: {
    fontSize: 15,
    color: '#555',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  botaoAdicionar: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
    marginBottom: 12,
  },
  botaoAdicionarTexto: { color: '#fff', fontSize: 16, fontWeight: '600' },
  botaoVoltar: {
    borderWidth: 1,
    borderColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
  },
  botaoVoltarTexto: { color: '#007AFF', fontSize: 16, fontWeight: '600' },
  quantidadeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    width: '100%',
    marginBottom: 12,
    paddingVertical: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  btnQtd: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnQtdTexto: { color: '#fff', fontSize: 20, fontWeight: 'bold', lineHeight: 24 },
  quantidadeTexto: { fontSize: 15, fontWeight: '600', color: '#333' },
  botaoVerCarrinho: {
    borderWidth: 1,
    borderColor: '#007AFF',
    backgroundColor: '#e8f0fe',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
    marginBottom: 12,
  },
  botaoVerCarrinhoTexto: { color: '#007AFF', fontSize: 16, fontWeight: '600' },
  toast: {
    position: 'absolute',
    bottom: 32,
    left: 16,
    right: 16,
    backgroundColor: '#28a745',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 10,
  },
  toastTexto: { color: '#fff', fontWeight: '600', fontSize: 15 },
});
