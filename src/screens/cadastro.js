// Ana Lívia dos Santos Lopes nº1 DS
// Isadora Gomes da Silva nº 9

import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Image, Alert
} from 'react-native';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getFirestore } from 'firebase/firestore';
import { getApp } from 'firebase/app';
import * as ImagePicker from 'expo-image-picker';
import s3 from '../../awsConfig';
import '../../firebaseConfig';

export default function CadastroUsuario() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [file, setFile] = useState(null);

  const pickFile = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Permissão necessária', 'Precisamos de permissão para acessar suas fotos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      setFile(result.assets[0]);
    }
  };

  const handleRegister = async () => {
    const auth = getAuth(getApp());
    const firestore = getFirestore(getApp());

    if (!nome || !email || !senha) {
      alert('Atenção', 'Preencha todos os campos.');
      return;
    }

    let imageUrl = null;

    if (file) {
      try {
        const response = await fetch(file.uri);
        const blob = await response.blob();
        const filename = `usuarios/${Date.now()}.jpg`;

        const params = {
          Bucket: 'bucket-storage-senai-9',
          Key: filename,
          Body: blob,
          ContentType: 'image/jpeg',
        };

        imageUrl = await new Promise((resolve, reject) => {
          s3.upload(params, (err, data) => {
            if (err) reject(err);
            else resolve(data.Location);
          });
        });
      } catch (error) {
        console.error('Erro ao subir imagem:', error);
        return alert('Erro', 'Falha no upload da imagem.');
      }
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
      const user = userCredential.user;

      await setDoc(doc(firestore, 'usuarios', user.uid), {
        uid: user.uid,
        nome,
        email,
        imageUrl,
      });

      alert('Usuário cadastrado com sucesso!');
      setNome('');
      setEmail('');
      setSenha('');
      setFile(null);
    } catch (error) {
      console.error('Erro no cadastro:', error);
      alert('Erro', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.curvaTopo}>
        <Image source={require("../../assets/logo.png")} style={styles.imagem} />
      </View>

      <View style={styles.formulario}>
        <Text style={styles.title}>Cadastro de Usuário</Text>

        <TouchableOpacity onPress={pickFile} style={styles.registerButton}>
          <Text style={styles.buttonText}>Selecionar Foto</Text>
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          placeholder="Nome"
          value={nome}
          onChangeText={setNome}
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Senha"
          value={senha}
          onChangeText={setSenha}
          secureTextEntry
        />


        {file && (
          <Image
            source={{ uri: file.uri }}
            style={{ width: 100, height: 100, marginVertical: 10, borderRadius: 50 }}
          />
        )}

        <TouchableOpacity onPress={handleRegister} style={styles.registerButton}>
          <Text style={styles.buttonText}>Cadastrar</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.curvaBaixo} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#924DBF',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontFamily: 'Gotham'
  },
  curvaTopo: {
    width: '100%',
    height: 130,
    backgroundColor: 'white',
    borderBottomLeftRadius: 100,
    borderBottomRightRadius: 100,
  },
  curvaBaixo: {
    width: '100%',
    height: 50,
    backgroundColor: 'white',
    borderTopLeftRadius: 100,
    borderTopRightRadius: 100,
    marginTop: 20,
  },
  formulario: {
    backgroundColor: '#924DBF',
    width: '90%',
    borderRadius: 20,
    padding: 50,
    marginTop: -80,
    alignItems: 'center',
  },
  imagem: {
    width: 240,
    height: 100,
    resizeMode: 'contain',
    marginTop: 10,
    flex: 1,
    justifyContent: 'center',
    alignItems:'center',
    marginLeft: 'auto',
    marginRight:'auto'
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
    textAlign: 'center'
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 9,
    width: '100%',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    fontSize: 16,
  },
  registerButton: {
    backgroundColor: '#d5b9f0',
    padding: 15,
    borderRadius: 26,
    width: '60%',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  buttonText: {
    color: 'black',
    fontWeight: '600',
    fontSize: 16,
  },
});
