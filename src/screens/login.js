// Ana Lívia dos Santos Lopes nº1 DS
// Isadora Gomes da Silva nº9 DS

import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable } from 'react-native';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getApp } from 'firebase/app';

import '../../firebaseConfig'; // Inicializa o Firebase

const RealizarLogin = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const TentarLogar = async () => {
        if (!email || !password) {
            alert("Preencha todos os campos");
            return;
        }

        setLoading(true);
        const auth = getAuth(getApp());
        try {
            await signInWithEmailAndPassword(auth, email, password);
            navigation.reset({
                index: 0,
                routes: [{ name: 'Perfil' }],
              });
              
        } catch (error) {
            console.error('Erro ao fazer login:', error.message);
            alert("Email ou senha inválidos");
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.efeitoBranco}>
                <Text style={styles.title}>Login</Text>

                <TextInput
                    placeholder="Email"
                    onChangeText={setEmail}
                    value={email}
                    style={styles.input}
                    placeholderTextColor="#999999"
                    keyboardType="email-address"
                    autoCapitalize="none"
                />
                <TextInput
                    placeholder="Senha"
                    onChangeText={setPassword}
                    value={password}
                    style={styles.input}
                    secureTextEntry={true}
                    placeholderTextColor="#999999"
                />

                <Pressable style={styles.botao} onPress={TentarLogar} disabled={loading}>
                    <Text style={styles.botaoTexto}>
                        {loading ? 'Carregando...' : 'Entrar'}
                    </Text>
                </Pressable>
            </View>
        </View>
    );
};

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
        borderTopLeftRadius: 333,
        borderBottomRightRadius: 333,
        width: '100%',
        padding: 20,
    },
    title: {
        fontSize: 38,
        fontWeight: 'bold',
        color: '#4A2574',
        marginBottom: 30,
    },
    input: {
        width: '90%',
        padding: 15,
        borderRadius: 28,
        backgroundColor: '#e8e8e8',
        marginBottom: 15,
        fontSize: 16,
        color: '#333',
    },
    botao: {
        backgroundColor: '#924DBF',
        padding: 15,
        borderRadius: 26,
        width: '60%',
        alignItems: 'center',
        elevation: 3,
        marginTop: 30,
    },
    botaoTexto: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default RealizarLogin;
