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
