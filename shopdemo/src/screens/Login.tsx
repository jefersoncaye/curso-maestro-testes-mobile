import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

const EMAIL_VALIDO = 'cliente@shopdemo.com';
const SENHA_VALIDA = '123456';

export default function Login({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState(false);

  function handleEntrar() {
    if (email === EMAIL_VALIDO && senha === SENHA_VALIDA) {
      setErro(false);
      navigation.navigate('Catalogo');
    } else {
      setErro(true);
    }
  }

  return (
    <SafeAreaView
      style={styles.safe}
      testID="tela-login"
      accessibilityLabel="tela-login"
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Text style={styles.titulo}>ShopDemo</Text>

        <TextInput
          style={styles.input}
          testID="input-email"
          accessibilityLabel="input-email"
          placeholder="E-mail"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={(t) => { setEmail(t); setErro(false); }}
        />

        <TextInput
          style={styles.input}
          testID="input-senha"
          accessibilityLabel="input-senha"
          placeholder="Senha"
          secureTextEntry
          value={senha}
          onChangeText={(t) => { setSenha(t); setErro(false); }}
        />

        {erro && (
          <Text
            style={styles.erro}
            testID="erro-login"
            accessibilityLabel="erro-login"
          >
            E-mail ou senha invalidos
          </Text>
        )}

        <TouchableOpacity
          style={styles.botao}
          testID="btn-entrar"
          accessibilityLabel="btn-entrar"
          onPress={handleEntrar}
          activeOpacity={0.7}
        >
          <Text style={styles.botaoTexto}>Entrar</Text>
        </TouchableOpacity>

        <Text
          style={styles.dica}
          testID="dica-login"
          accessibilityLabel="dica-login"
        >
          Teste: cliente@shopdemo.com / 123456
        </Text>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1, justifyContent: 'center', padding: 24 },
  titulo: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 40,
    color: '#007AFF',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 14,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },
  erro: {
    color: '#c00',
    marginBottom: 12,
    textAlign: 'center',
    fontSize: 14,
  },
  botao: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 24,
  },
  botaoTexto: { color: '#fff', fontSize: 16, fontWeight: '600' },
  dica: { textAlign: 'center', color: '#888', fontSize: 13 },
});
