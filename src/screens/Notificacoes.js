// Ana Lívia dos Santos Lopes nº1 DS
// Isadora Gomes da Silva nº 9

import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { db, auth } from '../../firebaseConfig';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

export default function Notificacoes() {
  const [notificacoes, setNotificacoes] = useState([]);

  useEffect(() => {
    const q = query(
      collection(db, 'notificacoes'),
      where('idUsuarioDestino', '==', auth.currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const novas = [];
      querySnapshot.forEach((doc) => {
        novas.push({ id: doc.id, ...doc.data() });
      });
      setNotificacoes(novas.sort((a, b) => b.criadoEm?.seconds - a.criadoEm?.seconds));
    });

    return () => unsubscribe();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Notificações</Text>
      <FlatList
        data={notificacoes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[styles.card, !item.lido && styles.naoLido]}>
            <Text>{item.mensagem}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  card: { backgroundColor: '#eee', padding: 15, marginBottom: 10, borderRadius: 8 },
  naoLido: { backgroundColor: '#cce5ff' },
});

