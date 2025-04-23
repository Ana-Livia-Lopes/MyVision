import React, { useState, useEffect } from 'react';
import {
  View, TextInput, Button, FlatList, Text,
  StyleSheet, KeyboardAvoidingView, Platform, Alert, TouchableOpacity
} from 'react-native';
import { db } from '../../firebaseConfig';
import { getAuth } from 'firebase/auth';
import { collection, addDoc, onSnapshot, query, orderBy, deleteDoc, doc } from 'firebase/firestore';

export default function ChatScreen() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    const q = query(collection(db, 'messages'), orderBy('createdAt', 'asc'));
    const unsubscribe = onSnapshot(q, snapshot => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
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
      Alert.alert('Erro', 'Não foi possível apagar a mensagem.');
    }
  };

  const handleLongPress = (item) => {
    if (user.email === 'ana@gmail.com') {
      Alert.alert(
        'Apagar Mensagem',
        'Deseja apagar esta mensagem?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Apagar', onPress: () => deleteMessage(item.id), style: 'destructive' }
        ]
      );
    }
  };

  const renderItem = ({ item }) => {
    const isMyMessage = item.userEmail === user.email;
    return (
      <TouchableOpacity onLongPress={() => handleLongPress(item)} activeOpacity={0.7}>
        <View style={[
          styles.messageBubble,
          {
            alignSelf: isMyMessage ? 'flex-end' : 'flex-start',
            backgroundColor: isMyMessage ? '#add8e6' : '#DCF8C6'
          }
        ]}>
          <Text style={styles.userName}>{item.userEmail}</Text>
          <Text style={styles.messageText}>{item.text}</Text>
        </View>
      </TouchableOpacity>
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
        <Button title="Enviar" onPress={sendMessage} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  messagesContainer: {
    padding: 10,
  },
  messageBubble: {
    padding: 10,
    borderRadius: 8,
    marginVertical: 5,
    maxWidth: '80%',
  },
  userName: {
    fontSize: 12,
    color: '#555',
    marginBottom: 2,
    fontWeight: 'bold',
  },
  messageText: {
    fontSize: 16,
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
});
