import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Produto, formatarPreco } from '../data/produtos';

const CORES_PLACEHOLDER = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'];

interface Props {
  produto: Produto;
  onPress: () => void;
}

export default function ProdutoCard({ produto, onPress }: Props) {
  const cor = CORES_PLACEHOLDER[produto.id % CORES_PLACEHOLDER.length];
  const inicial = produto.nome.charAt(0).toUpperCase();

  return (
    <TouchableOpacity
      style={styles.card}
      testID={`produto-item-${produto.id}`}
      accessibilityLabel={`produto-item-${produto.id}`}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.placeholder, { backgroundColor: cor }]}>
        <Text style={styles.inicial}>{inicial}</Text>
      </View>
      <View style={styles.info}>
        <Text
          style={styles.nome}
          testID={`produto-nome-${produto.id}`}
          accessibilityLabel={`produto-nome-${produto.id}`}
          numberOfLines={2}
        >
          {produto.nome}
        </Text>
        <Text
          style={styles.preco}
          testID={`produto-preco-${produto.id}`}
          accessibilityLabel={`produto-preco-${produto.id}`}
        >
          {formatarPreco(produto.preco)}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    marginHorizontal: 16,
    marginVertical: 6,
    padding: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  placeholder: {
    width: 64,
    height: 64,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  inicial: { fontSize: 28, fontWeight: 'bold', color: '#fff' },
  info: { flex: 1, justifyContent: 'center' },
  nome: { fontSize: 15, fontWeight: '600', color: '#222', marginBottom: 4 },
  preco: { fontSize: 14, color: '#007AFF', fontWeight: '500' },
});
