import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Image } from 'react-native';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getFirestore } from 'firebase/firestore';
import { getApp } from 'firebase/app';
import '../../firebaseConfig';

export default function CadastroUsuario() {
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');

    const handleRegister = async () => {
        const auth = getAuth(getApp());
        const firestore = getFirestore(getApp());

        if (!nome || !email || !senha) {
            alert('Atenção', 'Preencha todos os campos.');
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
            const user = userCredential.user;

            await setDoc(doc(firestore, 'usuarios', user.uid), {
                uid: user.uid,
                nome: nome,
                email: email,
            });

            alert('Sucesso, Usuário cadastrado com sucesso!', 'Usuário cadastrado com sucesso!');
            setNome('');
            setEmail('');
            setSenha('');

        } catch (error) {
            console.error('Erro no cadastro:', error);
            alert('Erro', error.message);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.efeitoBranco}>
                    <Image source={require("../../assets/logo.png")} style={styles.imagem} />
                <View style={styles.boxRoxo}>
                    <Text style={styles.title}>Cadastro <br></br>de Usuário</Text>

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

                    <TouchableOpacity onPress={handleRegister} style={styles.registerButton}>
                        <Text style={styles.buttonText}>Cadastrar</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#924DBF',
        height: '100%',
    },
    efeitoBranco: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
        borderTopRightRadius: 333,
        borderBottomLeftRadius: 333,
        width: '100%',
        padding: 20,
    },
    boxRoxo:{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#924DBF',
        width: '80%',
        padding: 20,
        height: "100px"
    },
    title: {
        fontSize: 38,
        fontWeight: 'bold',
        color: '#4A2574',
        marginBottom: 30,
        textAlign: 'center'
    },
    input: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 15,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#ccc',
        fontSize: 16,
    },
    registerButton: {
        backgroundColor: '#924DBF',
        padding: 15,
        borderRadius: 26,
        width: '60%',
        alignItems: 'center',
        elevation: 3,
        marginTop: 30,
    },
    buttonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
    },
    imagem: {
        marginBottom: 10,
        width: 290,
        height: 80
    }
});
