import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { formatarPreco } from '../data/produtos';
import { useCart, CartItem } from '../context/CartContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Carrinho'>;

export default function Carrinho({ navigation }: Props) {
  const { itens, totalPreco, incrementar, decrementar, removerItem } = useCart();
  const [mensagem, setMensagem] = useState('');
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleRemover(id: number) {
    removerItem(id);
    setMensagem('Produto removido com sucesso!');
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setMensagem(''), 2500);
  }

  function handleFinalizar() {
    navigation.navigate('Checkout');
  }

  function renderItem({ item }: { item: CartItem }) {
    const id = item.produto.id;
    return (
      <View
        style={styles.item}
        testID={`carrinho-item-${id}`}
        accessibilityLabel={`carrinho-item-${id}`}
      >
        <View style={styles.itemInfo}>
          <Text style={styles.itemNome} numberOfLines={2}>{item.produto.nome}</Text>
          <Text style={styles.itemPreco}>{formatarPreco(item.produto.preco)}</Text>
        </View>
        <View style={styles.controles}>
          <TouchableOpacity
            style={styles.btnControle}
            testID={`btn-decrementar-${id}`}
            accessibilityLabel={`btn-decrementar-${id}`}
            onPress={() => item.quantidade === 1 ? handleRemover(id) : decrementar(id)}
          >
            <Text style={styles.btnControleTexto}>-</Text>
          </TouchableOpacity>
          <Text style={styles.quantidade}>{item.quantidade}</Text>
          <TouchableOpacity
            style={styles.btnControle}
            testID={`btn-incrementar-${id}`}
            accessibilityLabel={`btn-incrementar-${id}`}
            onPress={() => incrementar(id)}
          >
            <Text style={styles.btnControleTexto}>+</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.btnRemover}
            testID={`btn-remover-${id}`}
            accessibilityLabel={`btn-remover-${id}`}
            onPress={() => handleRemover(id)}
          >
            <Text style={styles.btnRemoverTexto}>Remover</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView
      style={styles.safe}
      testID="tela-carrinho"
      accessibilityLabel="tela-carrinho"
    >
      <View style={styles.header}>
        <TouchableOpacity
          testID="btn-voltar-carrinho"
          accessibilityLabel="btn-voltar-carrinho"
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Text style={styles.voltarTexto}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.titulo}>Carrinho</Text>
      </View>

      {itens.length === 0 ? (
        <View style={styles.vazioContainer}>
          <Text
            style={styles.vazioTexto}
            testID="carrinho-vazio"
            accessibilityLabel="carrinho-vazio"
          >
            Seu carrinho esta vazio
          </Text>
        </View>
      ) : (
        <FlatList
          data={itens}
          keyExtractor={(item) => String(item.produto.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.lista}
        />
      )}

      {mensagem !== '' && (
        <View
          style={styles.toast}
          testID="msg-produto-removido"
          accessibilityLabel="msg-produto-removido"
        >
          <Text style={styles.toastTexto}>{mensagem}</Text>
        </View>
      )}

      <View style={styles.rodape}>
        <Text
          style={styles.total}
          testID="carrinho-total"
          accessibilityLabel="carrinho-total"
        >
          {`Total: ${formatarPreco(totalPreco)}`}
        </Text>
        <TouchableOpacity
          style={[styles.botaoFinalizar, itens.length === 0 && styles.botaoDesabilitado]}
          testID="btn-finalizar"
          accessibilityLabel="btn-finalizar"
          onPress={handleFinalizar}
          disabled={itens.length === 0}
          activeOpacity={0.7}
        >
          <Text style={[styles.botaoFinalizarTexto, itens.length === 0 && styles.textoDesabilitado]}>
            Finalizar compra
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f5f5f5' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  voltarTexto: { fontSize: 15, color: '#007AFF', fontWeight: '500' },
  titulo: { fontSize: 20, fontWeight: 'bold', color: '#222' },
  vazioContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  vazioTexto: { fontSize: 16, color: '#888' },
  lista: { padding: 12 },
  item: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    elevation: 1,
  },
  itemInfo: { marginBottom: 8 },
  itemNome: { fontSize: 15, fontWeight: '600', color: '#222' },
  itemPreco: { fontSize: 13, color: '#007AFF', marginTop: 2 },
  controles: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  btnControle: {
    width: 32,
    height: 32,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnControleTexto: { color: '#007AFF', fontSize: 18, fontWeight: 'bold' },
  quantidade: { fontSize: 16, fontWeight: '600', minWidth: 24, textAlign: 'center' },
  btnRemover: {
    marginLeft: 'auto',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#c00',
  },
  btnRemoverTexto: { color: '#c00', fontSize: 13, fontWeight: '500' },
  rodape: {
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  total: { fontSize: 18, fontWeight: 'bold', color: '#222', marginBottom: 12 },
  botaoFinalizar: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  botaoDesabilitado: { backgroundColor: '#ccc' },
  botaoFinalizarTexto: { color: '#fff', fontSize: 16, fontWeight: '600' },
  textoDesabilitado: { color: '#999' },
  toast: {
    backgroundColor: '#c0392b',
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  toastTexto: { color: '#fff', fontWeight: '600', fontSize: 15 },
});
