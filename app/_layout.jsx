import { Stack } from "expo-router";
import { useFonts } from 'expo-font';
import "../global.css"
import { CartProvider } from './context/CartContext'
import Toast from 'react-native-toast-message';
import {toastConfig }from '../components/toastConfig'
export default function RootLayout() {
  const [loaded, error] = useFonts({
    'Michroma-Regular': require('../assets/fonts/Michroma-Regular.ttf'),
    'Cinzel-Regular': require('../assets/fonts/Cinzel-Regular.ttf'),
    'Cinzel-Medium': require('../assets/fonts/Cinzel-Medium.ttf'),
    'Cinzel-SemiBold': require('../assets/fonts/Cinzel-SemiBold.ttf'),
    'Cinzel-ExtraBold': require('../assets/fonts/Cinzel-ExtraBold.ttf'),
    'Cinzel-Bold': require('../assets/fonts/Cinzel-Bold.ttf'),
    'JosefinSans-Bold': require('../assets/fonts/JosefinSans-Bold.ttf'),
    'JosefinSans-SemiBold': require('../assets/fonts/JosefinSans-SemiBold.ttf'),
    'JosefinSans-Regular': require('../assets/fonts/JosefinSans-Regular.ttf'),
    'JosefinSans-Thin': require('../assets/fonts/JosefinSans-Thin.ttf'),
    'JosefinSans-Light': require('../assets/fonts/JosefinSans-Light.ttf'),



  });
  return (

    <CartProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />;
        <Stack.Screen name="Login" />;
        <Stack.Screen name="SignUp" />;
        <Stack.Screen name="(tabs)" />;
      </Stack>

       <Toast config={toastConfig} /> 
    </CartProvider>

  )
}
