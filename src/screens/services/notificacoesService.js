// Ana Lívia dos Santos Lopes nº1 DS
// Isadora Gomes da Silva nº 9

import { db } from '../../../firebaseConfig';
import { collection, addDoc, Timestamp } from 'firebase/firestore';

export const criarNotificacao = async (idUsuarioDestino, mensagem, tipo) => {
  try {
    await addDoc(collection(db, 'notificacoes'), {
      idUsuarioDestino,
      tipo,
      mensagem,
      criadoEm: Timestamp.now(),
      lido: false,
    });
  } catch (error) {
    console.error('Erro ao criar notificação:', error);
  }
};
