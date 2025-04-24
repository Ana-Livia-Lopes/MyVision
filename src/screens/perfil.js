import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, StyleSheet, Image
} from 'react-native';
import {
  getAuth, updateEmail, updatePassword,
  EmailAuthProvider, reauthenticateWithCredential, signOut, onAuthStateChanged
} from 'firebase/auth';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import { getApp } from 'firebase/app';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import s3 from '../../awsConfig';
import '../../firebaseConfig';

export default function CadastroUsuario() {
  const [novaSenha, setNovaSenha] = useState('');
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novoEmail, setNovoEmail] = useState('');
  const [user, setUser] = useState(null);
  const [nome, setNome] = useState('');
  const [fotoPerfil, setFotoPerfil] = useState(null);
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
            setFotoPerfil(data.fotoPerfil || null);
          } else {
            console.log('Usuário não encontrado no Firestore');
          }
        } catch (error) {
          console.log('Erro ao buscar dados:', error);
        }

      } else {
        setUser(null);
        setNome('');
        setFotoPerfil(null);
      }
    });

    return unsubscribe;
  }, []);

  const escolherNovaFoto = async () => {
    if (!senhaAtual) {
      window.alert('Digite sua senha atual para alterar a foto.');
      return;
    }

    const auth = getAuth();
    const user = auth.currentUser;

    try {
      const credential = EmailAuthProvider.credential(user.email, senhaAtual);
      await reauthenticateWithCredential(user, credential); // Reautenticar o usuário

      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        window.alert('Precisamos acessar sua galeria.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
      });

      if (!result.canceled) {
        try {
          const file = result.assets[0];
          const response = await fetch(file.uri);
          const blob = await response.blob();
          const filename = `perfil/${user.uid}-${Date.now()}.jpg`;

          const params = {
            Bucket: 'bucket-storage-senai-9',
            Key: filename,
            Body: blob,
            ContentType: 'image/jpeg',
          };

          const imageUrl = await new Promise((resolve, reject) => {
            s3.upload(params, (err, data) => {
              if (err) reject(err);
              else resolve(data.Location);
            });
          });

          setFotoPerfil(imageUrl);
          const db = getFirestore(getApp());
          await updateDoc(doc(db, 'usuarios', user.uid), { fotoPerfil: imageUrl });

          window.alert('Foto de perfil atualizada!');

        } catch (error) {
          console.error('Erro ao enviar imagem:', error);
          window.alert('Falha no upload da imagem de perfil.');
        }
      }

    } catch (error) {
      window.alert('Senha incorreta. Não foi possível alterar a foto.');
      console.log('Erro ao reautenticar:', error);
    }
  };

  const atualizarNome = async () => {
    if (!user) return;

    try {
      const db = getFirestore(getApp());
      const userRef = doc(db, 'usuarios', user.uid);
      await updateDoc(userRef, { nome });
    } catch (error) {
      console.error('Erro ao atualizar nome:', error);
      window.alert('Não foi possível atualizar o nome.');
    }
  };

  const atualizarCredenciais = async () => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      window.alert('Nenhum usuário autenticado.');
      return;
    }

    try {
      const credential = EmailAuthProvider.credential(user.email, senhaAtual);
      await reauthenticateWithCredential(user, credential);

      if (novoEmail) await updateEmail(user, novoEmail);
      if (novaSenha) await updatePassword(user, novaSenha);
      if (nome) await atualizarNome();

      window.alert('Credenciais atualizadas com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar credenciais:', error);
      window.alert(error.message);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(getAuth());
      navigation.navigate('Login');
    } catch (error) {
      window.alert('Não foi possível sair.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Box de perfil */}
      <View style={styles.card}>
        <Text style={styles.title}>Perfil do usuário</Text>

        {fotoPerfil ? (
          <Image
            source={{ uri: fotoPerfil }}
            style={styles.profileImage}
          />
        ) : (
          <View style={styles.placeholderImage}>
            <Text style={styles.placeholderText}>Sem Foto</Text>
          </View>
        )}

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
        <Text style={styles.title}>Editar credenciais</Text>

        <TextInput
          style={styles.input}
          placeholder="Nome"
          value={nome}
          onChangeText={setNome}
          placeholderTextColor="#999"
        />
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

        <TouchableOpacity onPress={escolherNovaFoto} style={styles.updateButton}>
          <Text style={styles.buttonText}>Alterar Foto de Perfil</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={atualizarCredenciais} style={styles.updateButton}>
          <Text style={styles.buttonText}>Atualizar credenciais</Text>
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
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignSelf: 'center',
    marginBottom: 15,
  },
  placeholderImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#d8b4fe',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 15,
  },
  placeholderText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
