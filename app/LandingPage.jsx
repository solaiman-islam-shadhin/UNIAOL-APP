import { View, Text, Pressable, SafeAreaView, StatusBar, ScrollView, Image, StyleSheet, TouchableOpacity } from 'react-native'
import { router, useRouter } from 'expo-router'
import LottieView from 'lottie-react-native';
import icon from '../assets/images/logo-icon.png'
import Animated, { FadeIn, FadeInDown, FadeInLeft, FadeInRight, FadeInUp, FadeOut, FadeOutUp } from 'react-native-reanimated';
const styles = StyleSheet.create({
  text: {
    fontSize: 80,
    fontFamily: 'Cinzel-Medium',
    padding: 2,
    color: "#ff8353",
    textAlign: 'center',
  },
  Btn_text: {
    fontFamily: 'Cinzel-SemiBold',
  }
})

export default function LandingPage() {

  const router = useRouter()
  return (
    <SafeAreaView className='bg-gray-900 '>
      <ScrollView contentContainerStyle={{ height: '100%', }} >
          <StatusBar style={"dark-content"} className='bg-gray-900'></StatusBar>
        <View className='mt-10'>
          <View className='px-2'>
            <Animated.Text entering={FadeInUp.delay(200).duration(1500).springify()} style={styles.text} className='text-center w-96 mx-auto mt-16 animate-pulse'> UNISOL</Animated.Text>
            <Animated.View entering={FadeInUp.delay(300).duration(1500).springify()} className="flex justify-center items-center mt-5" >
              <LottieView style={{ width: 300, height: 150 }} source={require('../wfL0OjIrdJ.json')} autoPlay loop />
            </Animated.View>
            <View className='mt-5'>
              <Animated.View entering={FadeInDown.delay(400).duration(1000).springify()}>
                <TouchableOpacity className=' w-72 py-4 rounded-full bg-[#ff8353] text-center mx-auto mt-5' onPress={() => router.push("Login")}>
                  <Text style={styles.Btn_text} className='text-center text-2xl text-white  '>Login</Text>
                </TouchableOpacity>
              </Animated.View>
              <Animated.View entering={FadeInDown.delay(600).duration(1000).springify()}>
                <TouchableOpacity className=' border-2 border-[#ff8353] w-72 py-4 rounded-full  text-center mx-auto mt-5' onPress={() => router.push("Home")}>
                  <Text style={styles.Btn_text} className='text-center text-2xl text-[#ff8353] '>Guest User</Text>
                </TouchableOpacity>
              </Animated.View>
              <Animated.View entering={FadeInLeft.delay(800).duration(1000).springify()} className='flex-row justify-center mt-10 gap-2 '>
                <Text style={styles.Btn_text} className='text-lg animate-bounce text-white '>Don't have an account?</Text>
                <Text style={styles.Btn_text} className='text-lg animate-bounce border-b border-[#ff8353] text-[#ff8353]' onPress={() => router.push("SignUp")}>SignUp</Text>
              </Animated.View>
            </View>
          </View>

          <View className=' felx  relative  '>

            <Animated.View entering={FadeIn.delay(1000).duration(1000).springify()}  className="  -right-48 " >
              <LottieView style={{ width: 400, height: 300 }} source={require('../lAxlh737dl.json')} autoPlay loop />
            </Animated.View>
            <Animated.View entering={FadeIn.delay(1000).duration(1000).springify()}  className=" bottom-48 right-36  " >
              <LottieView style={{ width: 300, height: 300 }} source={require('../Ripple loading animation.json')} autoPlay loop />
            </Animated.View>
          </View>

        </View>

      </ScrollView>
    </SafeAreaView>


  )

}