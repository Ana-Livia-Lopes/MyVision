import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, StyleSheet, Alert
} from 'react-native';
import {
  getAuth, updateEmail, updatePassword,
  EmailAuthProvider, reauthenticateWithCredential, signOut, onAuthStateChanged
} from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { getApp } from 'firebase/app';
import { useNavigation } from '@react-navigation/native';
import '../../firebaseConfig';

export default function CadastroUsuario() {
  const [novaSenha, setNovaSenha] = useState('');
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novoEmail, setNovoEmail] = useState('');
  const [user, setUser] = useState(null);
  const [nome, setNome] = useState(''); // 👈 nome do Firestore
  const navigation = useNavigation();

  useEffect(() => {
    const auth = getAuth(getApp());

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setNovoEmail(currentUser.email);

        try {
          const db = getFirestore(getApp());
          const docRef = doc(db, 'usuarios', currentUser.uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const data = docSnap.data();
            setNome(data.nome || '');
          } else {
            console.log('Usuário não encontrado no Firestore');
          }
        } catch (error) {
          console.log('Erro ao buscar nome:', error);
        }

      } else {
        setUser(null);
        setNome('');
      }
    });

    return unsubscribe;
  }, []);

  const atualizarCredenciais = async () => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      Alert.alert('Erro', 'Nenhum usuário autenticado.');
      return;
    }

    try {
      const credential = EmailAuthProvider.credential(user.email, senhaAtual);
      await reauthenticateWithCredential(user, credential);

      if (novoEmail) await updateEmail(user, novoEmail);
      if (novaSenha) await updatePassword(user, novaSenha);

      Alert.alert('Sucesso', 'Credenciais atualizadas com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar credenciais:', error);
      Alert.alert('Erro', error.message);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(getAuth());
      navigation.navigate('Login');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível sair.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Botão de sair */}

      {/* Box de perfil */}
      <View style={styles.card}>
        <Text style={styles.title}>Perfil do Usuário</Text>

        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>Nome:</Text>
          <Text style={styles.infoValue}>{nome || 'Não informado'}</Text>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>Email:</Text>
          <Text style={styles.infoValue}>{user?.email || '---'}</Text>
        </View>

      <TouchableOpacity onPress={handleLogout} style={styles.updateButton}>
        <Text style={styles.buttonText}>Sair</Text>
      </TouchableOpacity>

      </View>

      {/* Box de edição */}
      <View style={styles.card}>
        <Text style={styles.title}>Editar Credenciais</Text>

        <TextInput
          style={styles.input}
          placeholder="Senha Atual"
          value={senhaAtual}
          onChangeText={setSenhaAtual}
          secureTextEntry
          placeholderTextColor="#999"
        />
        <TextInput
          style={styles.input}
          placeholder="Novo Email"
          value={novoEmail}
          onChangeText={setNovoEmail}
          keyboardType="email-address"
          placeholderTextColor="#999"
        />
        <TextInput
          style={styles.input}
          placeholder="Nova Senha"
          value={novaSenha}
          onChangeText={setNovaSenha}
          secureTextEntry
          placeholderTextColor="#999"
        />

        <TouchableOpacity onPress={atualizarCredenciais} style={styles.updateButton}>
          <Text style={styles.buttonText}>Atualizar Credenciais</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f4f1fa',
    flexGrow: 1,
    justifyContent: 'center',
  },
  logoutButton: {
    backgroundColor: '#d1d5db',
    padding: 10,
    borderRadius: 10,
    alignSelf: 'flex-end',
    marginBottom: 10,
  },
  logoutText: {
    color: '#6b21a8',
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 25,
    shadowColor: '#7f5af0',
    shadowOffset: { width: 1, height: 5 },
    shadowOpacity: 0.9,
    shadowRadius: 8,
    elevation: 6,
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6a0dad',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#f9f5ff',
    borderColor: '#a855f7',
    borderWidth: 2,
    borderRadius: 8,
    padding: 14,
    marginBottom: 16,
    fontSize: 16,
    color: '#333',
  },
  updateButton: {
    backgroundColor: '#7c3aed',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  infoBox: {
    backgroundColor: '#e9d5ff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  infoLabel: {
    fontWeight: 'bold',
    color: '#6a0dad',
    fontSize: 14,
  },
  infoValue: {
    color: '#4c1d95',
    fontSize: 16,
  },
});
