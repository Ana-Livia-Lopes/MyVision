// Ana Lívia dos Santos Lopes nº1 DS
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Cadastro from './src/screens/cadastro';
import Perfil from './src/screens/perfil';


const Stack = createNativeStackNavigator();

const App = () => (
    <NavigationContainer>
        <Stack.Navigator initialRouteName='Cadastro'>
            <Stack.Screen name="Cadastro" component={Cadastro} />
            <Stack.Screen name="Perfil" component={Perfil} />
        </Stack.Navigator>
    </NavigationContainer>
);
export default App;
