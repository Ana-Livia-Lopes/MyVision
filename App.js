// Ana Lívia dos Santos Lopes nº1 DS
// Isadora Gomes da Silva nº 9
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';

import Cadastro from './src/screens/cadastro';
import Perfil from './src/screens/perfil';
import Login from './src/screens/login';
import Chat from './src/screens/chat';
import Posts from './src/screens/Posts';

// Evita que a Splash screen feche automaticamente
SplashScreen.preventAutoHideAsync();

const Drawer = createDrawerNavigator();

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
        await SplashScreen.hideAsync();
      }
    }

    prepare();
  }, []);

  if (!appIsReady) {
    return null;
  }

  return (
    <View style={{ flex: 1 }}>
      <NavigationContainer>
        <Drawer.Navigator initialRouteName='Login' >
          <Drawer.Screen name="Cadastro" component={Cadastro} />
          <Drawer.Screen name="Perfil" component={Perfil} />
          <Drawer.Screen name="Login" component={Login} options={{ headerShown: false, drawerItemStyle: { display: 'none' } }}/>
          <Drawer.Screen name="Chat" component={Chat} />
          <Drawer.Screen name="Posts" component={Posts} />
        </Drawer.Navigator>
      </NavigationContainer>
    </View>
  );
}
