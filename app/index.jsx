import 'react-native-get-random-values';
import { View, Text, Pressable, SafeAreaView, StatusBar, ScrollView, Image, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native'
import { useRouter, Redirect } from 'expo-router'
import LottieView from 'lottie-react-native';
import Animated, { FadeIn, FadeInDown, FadeInLeft, FadeInRight, FadeInUp, FadeOut, FadeOutUp } from 'react-native-reanimated';
import React from 'react';
import { useAuth } from './context/AuthContext';

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
    Act_text: {
        fontFamily: 'JosefinSans-Regular',
    }
})

export default function Index() {
    const router = useRouter();
    const { user, loading } = useAuth();
    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-gray-900">
                <ActivityIndicator size="large" color="#ff8353" />
            </View>
        );
    }

    if (user) {
        return <Redirect href="/(tabs)/Home" />;
    }
    return (
        <SafeAreaView className='bg-gray-900 '>
            <ScrollView contentContainerStyle={{ height: '100%', }} >
                <StatusBar barStyle={"dark-content"} className='bg-gray-900'></StatusBar>
                <View className='mt-10'>
                    <View className='px-2'>
                        <Animated.Text entering={FadeInUp.delay(200).duration(1500).springify()} style={styles.text} className='text-center w-96 mx-auto mt-16 animate-pulse'> UNISOL</Animated.Text>
                        <Animated.View entering={FadeInUp.delay(300).duration(1500).springify()} className="flex justify-center items-center mt-5" >
                            <LottieView style={{ width: 300, height: 170 }} source={require('../Lottie_Animations/wfL0OjIrdJ.json')} autoPlay loop />
                        </Animated.View>
                        <View className='mt-5'>
                            <Animated.View entering={FadeInDown.delay(400).duration(1000).springify()}>
                                <TouchableOpacity className=' w-72 py-4 rounded-full bg-[#ff8353] text-center mx-auto mt-5' onPress={() => router.push('Login')}>
                                    <Text style={styles.Btn_text} className='text-center text-2xl text-white  '>Login</Text>
                                </TouchableOpacity>
                            </Animated.View>
                            <Animated.View entering={FadeInDown.delay(500).duration(1000).springify()}>
                                <TouchableOpacity className=' border-2 border-[#ff8353] w-72 py-4 rounded-full  text-center mx-auto mt-5' onPress={() => router.push("/(tabs)/Home")}>
                                    <Text style={styles.Btn_text} className='text-center text-2xl text-[#ff8353] '>Guest User</Text>
                                </TouchableOpacity>
                            </Animated.View>
                            <Animated.View entering={FadeInLeft.delay(600).duration(1000).springify()} className='flex-row justify-center mt-5 gap-2 '>
                                <View>
                                    <Text className='text-xl animate-pulse text-white' style={styles.Act_text}>Don't have an account?</Text>
                                </View>
                                <Text className='text-xl animate-pulse border-b border-[#ff8353] text-[#ff8353]' style={styles.Act_text} onPress={() => router.push("SignUp")}>SignUp</Text>
                            </Animated.View>
                        </View>
                    </View>

                    <View className=' felx  relative  '>
                        <Animated.View entering={FadeInLeft.delay(700).duration(1000).springify()} className="  -right-44  " >
                            <LottieView style={{ width: 350, height: 280 }} source={require('../Lottie_Animations/rhh2tfidxj.json')} autoPlay loop />
                        </Animated.View>
                        <Animated.View entering={FadeInRight.delay(800).duration(1000).springify()} className=" bottom-56 right-20  " >
                            <LottieView style={{ width: 250, height: 280 }} source={require('../Lottie_Animations/Back to school!.json')} autoPlay loop />
                        </Animated.View>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}
