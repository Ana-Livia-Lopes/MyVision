import React, { useState, useEffect } from 'react';
import {
    View, TextInput, Button, FlatList, Text,
    StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity
} from 'react-native';
import { db } from '../../firebaseConfig';
// import { criarNotificacao } from '../services/notificacoesService';
import { getAuth } from 'firebase/auth';
import {
    collection, addDoc, onSnapshot, query, orderBy, deleteDoc, doc, getDoc
} from 'firebase/firestore';
import Swal from 'sweetalert2';

export default function ChatScreen() {
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [userNames, setUserNames] = useState({});
    const auth = getAuth();
    const user = auth.currentUser;

    useEffect(() => {
        const q = query(collection(db, 'messages'), orderBy('createdAt', 'asc'));
        const unsubscribe = onSnapshot(q, async snapshot => {
            const msgs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            const uniqueUserIds = [...new Set(msgs.map(msg => msg.userId))];
            const namesMap = { ...userNames };

            for (const uid of uniqueUserIds) {
                if (!namesMap[uid]) {
                    const userDoc = await getDoc(doc(db, 'usuarios', uid));
                    namesMap[uid] = userDoc.exists() ? userDoc.data().nome : '<------->';
                }
            }

            setUserNames(namesMap);
            setMessages(msgs);
        });

        return () => unsubscribe();
    }, []);

    const sendMessage = async () => {
        if (message.trim() && user) {
            await addDoc(collection(db, 'messages'), {
                text: message,
                createdAt: new Date(),
                userEmail: user.email,
                userId: user.uid
            });
            setMessage('');
        }
    };

    const deleteMessage = async (id) => {
        try {
            await deleteDoc(doc(db, 'messages', id));
        } catch (error) {
            Swal.fire('Erro', 'Não foi possível apagar a mensagem.', 'error');
        }
    };

    const confirmDelete = (id) => {
        Swal.fire({
            title: 'Apagar mensagem?',
            text: 'Essa ação não pode ser desfeita.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sim, apagar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                deleteMessage(id);
            }
        });
    };

    const renderItem = ({ item }) => {
        const isMyMessage = item.userEmail === user.email;
        const isAna = user?.email === 'alguem@gmail.com';
        const userName = userNames[item.userId] || item.userEmail;

        return (
            <View style={[
                styles.messageBubble,
                {
                    alignSelf: isMyMessage ? 'flex-end' : 'flex-start',
                    backgroundColor: isMyMessage ? '#add8e6' : '#DCF8C6'
                }
            ]}>
                <Text style={styles.userName}>{userName}</Text>
                <Text style={styles.messageText}>{item.text}</Text>
                {isAna && (
                    <TouchableOpacity onPress={() => confirmDelete(item.id)} style={styles.deleteButton}>
                        <Text style={styles.deleteText}>Apagar</Text>
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={80}
        >
            <FlatList
                data={messages}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.messagesContainer}
            />

            <View style={styles.inputContainer}>
                <TextInput
                    value={message}
                    onChangeText={setMessage}
                    placeholder="Digite sua mensagem"
                    style={styles.input}
                />
                <TouchableOpacity onPress={sendMessage} style={styles.registerButton}>
                    <Text style={styles.botao}>Enviar</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    messagesContainer: { padding: 10 },
    messageBubble: {
        padding: 10,
        borderRadius: 8,
        marginVertical: 5,
        maxWidth: '80%',
        position: 'relative',
    },
    userName: {
        fontSize: 12,
        color: '#555',
        marginBottom: 2,
        fontWeight: 'bold',
    },
    messageText: { fontSize: 16 },
    deleteButton: {
        marginTop: 5,
        backgroundColor: '#f87171',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        alignSelf: 'flex-end',
    },
    deleteText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
    inputContainer: {
        flexDirection: 'row',
        padding: 10,
        borderTopWidth: 1,
        borderColor: '#ccc',
        backgroundColor: '#fff',
        alignItems: 'center',
    },
    input: {
        flex: 1,
        backgroundColor: '#eee',
        padding: 10,
        borderRadius: 20,
        marginRight: 10,
    },
    botao: {
        backgroundColor: '#924DBF',
        padding: 10,
        borderRadius: 10,
        alignItems: 'center',
        color: "#fff"
    }
});
