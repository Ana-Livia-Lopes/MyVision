Este é um projeto de rede social mobile desenvolvido em React Native, utilizando Firebase e AWS S3, com foco em aprendizado e prática de conceitos modernos de desenvolvimento de aplicativos, baseado na interação dos usuários. O app inclui funcionalidades como autenticação, postagens com imagem, comentários, notificações em tempo real e chat entre usuários.

Funcionalidades
 Splash Screen
Tela inicial de abertura do app com logo da aplicação, proporcionando uma transição suave para a tela de login.

 Login e Cadastro
Telas onde os usuários podem se registrar ou fazer login utilizando email e senha. A autenticação é gerenciada com Firebase Authentication.

 Perfil de Usuário
Tela de perfil onde o usuário pode visualizar e editar suas informações pessoais, como nome e email. Os dados são armazenados no Firestore.

 Postagens e Interações
Os usuários podem criar postagens com texto e imagem (upload via AWS S3).

É possível curtir e comentar nas postagens de outros usuários.

O feed é exibido em tempo real utilizando onSnapshot do Firebase.

 Notificações
Sistema de notificações integrado que avisa o usuário sobre interações com suas postagens (curtidas e comentários). As notificações são armazenadas em uma coleção no Firestore e associadas ao usuário de destino.

 Chat entre Usuários
Funcionalidade de chat privado com:
Envio e recebimento de mensagens em tempo real.
Exibição de mensagens com nome do remetente.

Estrutura básica
/src
  /screens
    - LoginScreen.js
    - CadastroScreen.js
    - Posts.js
    - PerfilScreen.js
    - ChatScreen.js
  /services
    - notificacoesService.js
  firebaseConfig.js
  awsConfig.js - não é commitado, precisar criar o próprio


Dependencias principais
npm install firebase
npm install @react-navigation/native
npm install @react-navigation/native-stack
npm install react-native-screens react-native-safe-area-context
npm install react-native-gesture-handler
npm install react-native-reanimated
npm install react-native-vector-icons
npm install aws-sdk
npm install firebase


Para testar o app pode ser usada a conta luis@gmail.com e senha 123456 ou para administrador que pode apagar as mensagens pode ser usada a conta alguem@gmail.com e senha 123456
