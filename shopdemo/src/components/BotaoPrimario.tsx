import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

interface Props {
  testID: string;
  label: string;
  onPress: () => void;
  disabled?: boolean;
  variante?: 'primario' | 'secundario';
}

export default function BotaoPrimario({
  testID,
  label,
  onPress,
  disabled = false,
  variante = 'primario',
}: Props) {
  return (
    <TouchableOpacity
      testID={testID}
      accessibilityLabel={testID}
      style={[
        styles.botao,
        variante === 'secundario' && styles.botaoSecundario,
        disabled && styles.botaoDesabilitado,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <Text
        style={[
          styles.texto,
          variante === 'secundario' && styles.textoSecundario,
          disabled && styles.textoDesabilitado,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  botao: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 8,
  },
  botaoSecundario: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  botaoDesabilitado: { backgroundColor: '#ccc' },
  texto: { color: '#fff', fontSize: 16, fontWeight: '600' },
  textoSecundario: { color: '#007AFF' },
  textoDesabilitado: { color: '#999' },
});
