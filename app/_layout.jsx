import { Stack } from "expo-router";
import { useFonts } from 'expo-font';
import "../global.css"
export default function RootLayout() {
const [loaded, error] = useFonts({ 
  'Michroma-Regular': require('../assets/fonts/Michroma-Regular.ttf'),
  'Cinzel-Regular': require('../assets/fonts/Cinzel-Regular.ttf'),
  'Cinzel-Medium': require('../assets/fonts/Cinzel-Medium.ttf'),
  'Cinzel-SemiBold': require('../assets/fonts/Cinzel-SemiBold.ttf'),
  'Cinzel-ExtraBold': require('../assets/fonts/Cinzel-ExtraBold.ttf'),
  'Cinzel-Bold': require('../assets/fonts/Cinzel-Bold.ttf'),
  'Roboto-SemiBold': require('../assets/fonts/Roboto-SemiBold.ttf'),
 });
  return <Stack screenOptions={{headerShown:false}}>
  <Stack.Screen name="LandingPage" />;
  <Stack.Screen name="Login" />;
  <Stack.Screen name="SignUp" />;
  <Stack.Screen name="(tabs)" />;
  </Stack>
}
