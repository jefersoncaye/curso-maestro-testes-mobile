import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { produtos, Produto } from '../data/produtos';
import { useCart } from '../context/CartContext';
import ProdutoCard from '../components/ProdutoCard';

type Props = NativeStackScreenProps<RootStackParamList, 'Catalogo'>;

export default function Catalogo({ navigation }: Props) {
  const [busca, setBusca] = useState('');
  const { totalItens } = useCart();

  const produtosFiltrados = produtos.filter((p) =>
    p.nome.toLowerCase().includes(busca.toLowerCase())
  );

  function abrirDetalhe(produto: Produto) {
    navigation.navigate('Detalhe', { produto });
  }

  function abrirCarrinho() {
    navigation.navigate('Carrinho');
  }

  return (
    <SafeAreaView
      style={styles.safe}
      testID="tela-catalogo"
      accessibilityLabel="tela-catalogo"
    >
      <View style={styles.header}>
        <Text style={styles.titulo}>Catalogo</Text>
        <TouchableOpacity
          style={styles.botaoCarrinho}
          testID="btn-abrir-carrinho"
          accessibilityLabel="btn-abrir-carrinho"
          onPress={abrirCarrinho}
          activeOpacity={0.7}
        >
          <Text style={styles.botaoCarrinhoTexto}>Carrinho</Text>
          <View style={styles.badgeContainer}>
            <Text
              style={styles.badgeTexto}
              testID="badge-carrinho"
              accessibilityLabel="badge-carrinho"
            >
              {totalItens}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.input}
        testID="input-busca"
        accessibilityLabel="input-busca"
        placeholder="Buscar produtos"
        value={busca}
        onChangeText={setBusca}
        clearButtonMode="while-editing"
      />

      <FlatList
        testID="lista-produtos"
        accessibilityLabel="lista-produtos"
        data={produtosFiltrados}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <ProdutoCard produto={item} onPress={() => abrirDetalhe(item)} />
        )}
        contentContainerStyle={styles.lista}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f5f5f5' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  titulo: { fontSize: 20, fontWeight: 'bold', color: '#222' },
  botaoCarrinho: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  botaoCarrinhoTexto: { color: '#fff', fontWeight: '600', fontSize: 14 },
  badgeContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeTexto: { color: '#007AFF', fontSize: 12, fontWeight: 'bold' },
  input: {
    margin: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    fontSize: 15,
    backgroundColor: '#fff',
  },
  lista: { paddingBottom: 16 },
});
