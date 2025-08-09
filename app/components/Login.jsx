import { View, Text, Pressable, SafeAreaView, StatusBar, ScrollView, Image, StyleSheet, TextInput, TouchableOpacity } from 'react-native'
import { router, useRouter } from 'expo-router'
import LottieView from 'lottie-react-native';
import Animated, { FadeIn, FadeInDown, FadeInLeft, FadeInRight, FadeInUp, FadeOut, FadeOutUp } from 'react-native-reanimated';
import { Formik } from 'formik';
import ValidationSchema from '../../utils/authVelidation';

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
  },
  Iinput_text: {
    fontFamily: 'Roboto-SemiBold',
  },
})

export default function LandingPage() {
  const handaleSignUp = () => {

  }
  const router = useRouter()
  return (
    <SafeAreaView className='bg-[#151527] '>
      <ScrollView contentContainerStyle={{ height: '100%', }} >
        <StatusBar style={"dark-content"} className='bg-[#151527]'></StatusBar>
        <View className='mt-10'>
          <View className='px-2'>
            <Animated.Text entering={FadeInUp.delay(200).duration(1500).springify()} style={styles.text} className='text-center w-96 mx-auto  animate-pulse'> UNISOL</Animated.Text>
            <Animated.View entering={FadeInUp.delay(300).duration(1500).springify()} className="flex justify-center items-center mt-5" >
              <LottieView style={{ width: 200, height: 150 }} source={require('../../S4xABGRXHM (1).json')} autoPlay loop />
            </Animated.View>
            <View >
              <Formik initialValues={{ email: '', password: '' }} validationSchema={ValidationSchema} onSubmit={handaleSignUp}>
                {({
                  handleSubmit,
                  handleChange,
                  handleBlur,
                  values,
                  errors,
                  touched
                }) => (
                  <View className=' w-[86%]  mx-auto'>

                    <Animated.View entering={FadeInDown.delay(400).duration(1000).springify()}>
                      <Text style={styles.Btn_text} className='text-[#ff8353] mt-4'>Email</Text>
                      <TextInput onChangeText={handleChange('email')} onBlur={handleBlur('email')} value={values.email} style={styles.Iinput_text} placeholder='Email' placeholderTextColor="#ff8353" className=' text-white border-2 border-[#ff8353] w-full px-2 py-4 rounded-xl bg-[#151527] mx-auto mt-5 text-white]' />
                      {errors.email && touched.email && <Text className='text-red-500 text-xs mt-2'>{errors.email}</Text>}
                    </Animated.View>
                    <Animated.View entering={FadeInDown.delay(600).duration(1000).springify()}>
                      <Text style={styles.Btn_text} className='text-[#ff8353] mt-4'>Password</Text>
                      <TextInput secureTextEntry={true} onChangeText={handleChange('password')} onBlur={handleBlur('password')} value={values.password} style={styles.Iinput_text} placeholder='Password' placeholderTextColor="#ff8353" className=' text-white font-normal border-2 border-[#ff8353] w-full px-2 py-4 rounded-xl bg-[#151527] mx-auto mt-5 text-white]' />
                      {errors.password && touched.password && <Text className='text-red-500 text-xs mt-2'>{errors.password}</Text>}
                    </Animated.View>
                    <Animated.View entering={FadeInDown.delay(800).duration(1000).springify()}>
                      <TouchableOpacity className=' w-72 py-4 rounded-full bg-[#ff8353] text-center mx-auto mt-10' onPress={handleSubmit}>
                        <Text style={styles.Btn_text} className='text-center text-2xl text-white  '>Login</Text>
                      </TouchableOpacity>
                    </Animated.View>
                  </View>
                )}

              </Formik>
              <Animated.View entering={FadeInLeft.delay(900).duration(1000).springify()} className='flex-row justify-center mt-10 gap-2 '>
                <Text style={styles.Btn_text} className='text-lg animate-pulse text-white '>Don't have an account?</Text>
                <Text style={styles.Btn_text} className='text-lg animate-pulse border-b border-[#ff8353] text-[#ff8353]' onPress={() => router.push("../components/SignUp")}>SignUp?</Text>
              </Animated.View>

            </View>
          </View>
          <View className=' felx  relative  '>

            <Animated.View entering={FadeIn.delay(1000).duration(1000).springify()} className="  bottom-16 right-48 " >
              <LottieView style={{ width: 400, height: 300 }} source={require('../../lAxlh737dl.json')} autoPlay loop />
            </Animated.View>
            <Animated.View entering={FadeIn.delay(1100).duration(1000).springify()} className=" bottom-72 -right-56  " >
              <LottieView style={{ width: 300, height: 300 }} source={require('../../Ripple loading animation.json')} autoPlay loop />
            </Animated.View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>


  )

}