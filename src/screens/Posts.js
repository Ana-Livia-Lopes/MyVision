import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, TextInput, TouchableOpacity, Image, FlatList, Alert, StyleSheet } from 'react-native';
import { db, auth } from '../../firebaseConfig';
import { collection, addDoc, query, orderBy, onSnapshot, updateDoc, doc, increment, serverTimestamp, getDoc, setDoc } from 'firebase/firestore';
import { criarNotificacao } from './services/notificacoesService';
import * as ImagePicker from 'expo-image-picker';
import s3 from '../../awsConfig';

const Posts = () => {
  const [text, setText] = useState('');
  const [file, setFile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState({});
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) setCurrentUser(user);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, snapshot => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPosts(list);
      list.forEach(post => loadComments(post.id));
    });
    return unsubscribe;
  }, []);

  const loadComments = postId => {
    const q = query(collection(db, 'posts', postId, 'comments'), orderBy('createdAt'));
    onSnapshot(q, snapshot => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setComments(prev => ({ ...prev, [postId]: list }));
    });
  };

  const pickFile = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Precisamos da permissão para acessar suas fotos.');
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

  const publicarPost = async () => {
    if (!currentUser) return Alert.alert('Erro', 'Usuário não autenticado.');

    let imageUrl = null;

    if (file) {
      try {
        const response = await fetch(file.uri);
        const blob = await response.blob();
        const filename = `posts/${Date.now()}.jpg`;

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
        return Alert.alert('Erro', 'Falha no upload da imagem.');
      }
    }

    try {
      const userDoc = await getDoc(doc(db, 'usuarios', currentUser.uid));
      const userName = userDoc.exists() ? userDoc.data().nome : 'Anônimo';

      await addDoc(collection(db, 'posts'), {
        authorId: currentUser.uid,
        authorName: userName,
        text,
        imageUrl,
        createdAt: serverTimestamp(),
        likeCount: 0,
      });

      setText('');
      setFile(null);
    } catch (error) {
      console.error('Erro ao publicar post:', error);
      Alert.alert('Erro', 'Falha ao publicar o post.');
    }
  };
  
  const curtirPost = async postId => {
    if (!currentUser) return;

    const likeRef = doc(db, 'posts', postId, 'likes', currentUser.uid);
    const likeSnap = await getDoc(likeRef);

    if (!likeSnap.exists()) {
      await setDoc(likeRef, {
        userId: currentUser.uid,
        likedAt: serverTimestamp(),
      });

      const postRef = doc(db, 'posts', postId);
      await updateDoc(postRef, { likeCount: increment(1) });
    } else {
      alert('Você já curtiu este post!');
    }
    const postRef = doc(db, 'posts', postId);
    await updateDoc(postRef, { likeCount: increment(1) });
    await criarNotificacao(currentUser.uid, "Alguém curtiu no seu post!", "comentario");
  };
  
  const addComentario = async (postId, commentText) => {
    if (!commentText.trim()) return;

    const userDoc = await getDoc(doc(db, 'usuarios', currentUser.uid));
    const userName = userDoc.exists() ? userDoc.data().nome : 'Usuário';

    
    await addDoc(collection(db, 'posts', postId, 'comments'), {
      authorId: currentUser.uid,
      authorName: userName,
      text: commentText,
      createdAt: serverTimestamp(),
    });

    await criarNotificacao(currentUser.uid, "Alguém comentou no seu post!", "comentario");
  };
  
  const renderItem = ({ item }) => (
    <View style={styles.post}>
      <Text style={styles.author}>{item.authorName}</Text>
      <Text>{item.text}</Text>
      {item.imageUrl && (
        <Image source={{ uri: item.imageUrl }} style={styles.image} />
      )}
      <View style={styles.actions}>
        <TouchableOpacity onPress={() => curtirPost(item.id)}>
          <Text>❤️ {item.likeCount}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            const comment = prompt('Comentário:');
            if (comment) addComentario(item.id, comment);
          }}
          >
          <Text style={styles.commentButton}>💬 Comentar</Text>
        </TouchableOpacity>
      </View>

      {/* COMENTÁRIOS */}
      {comments[item.id]?.map(comment => (
        <View key={comment.id} style={styles.comment}>
          <Text style={styles.commentAuthor}>{comment.authorName}</Text>
          <Text>{comment.text}</Text>
        </View>
      ))}
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <TextInput
        placeholder="O que você está pensando?"
        value={text}
        onChangeText={setText}
        style={styles.input}
      />
      <TouchableOpacity onPress={pickFile} style={styles.button}>
        <Text style={styles.buttonText}>Selecionar Imagem</Text>
      </TouchableOpacity>
      {file && (
        <Image
          source={{ uri: file.uri }}
          style={styles.image}
        />
      )}
      <TouchableOpacity onPress={publicarPost} style={styles.button}>
        <Text style={styles.buttonText}>Publicar</Text>
      </TouchableOpacity>
      <FlatList
        data={posts}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        style={styles.list}
      />
    </ScrollView>
  );
};

export default Posts;
const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    marginBottom: 10,
    borderRadius: 5,
  },
  button: {
    backgroundColor: '#924DBF',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    fontFamily: 'Gotham',
    color: '#fff',
    fontWeight: 'bold',
  },
  image: {
    width: 200,
    height: 200,
    marginVertical: 10,
    borderRadius: 10,
  },
  list: {
    marginTop: 20,
  },
  post: {
    padding: 10,
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  author: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  actions: {
    flexDirection: 'row',
    marginTop: 5,
    gap: 20,
  },
  commentButton: {
    marginLeft: 20,
  },
  comment: {
    marginTop: 5,
    marginLeft: 10,
    backgroundColor: '#f0f0f0',
    padding: 5,
    borderRadius: 5,
  },
  commentAuthor: {
    fontFamily: 'Gotham',
    fontWeight: 'bold',
    fontSize: 12,
  },
});