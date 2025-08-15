import { View, Text, SafeAreaView, StatusBar, ScrollView, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native'
import { useRouter } from 'expo-router'
import LottieView from 'lottie-react-native';
import Animated, { FadeInDown, FadeInLeft, FadeInRight, FadeInUp } from 'react-native-reanimated';
import { Formik } from 'formik';
import { useState } from 'react';
import { auth } from "../config/FireBAseConfig"
// --- Firebase Imports ---
import { signInWithEmailAndPassword, sendEmailVerification, sendPasswordResetEmail } from 'firebase/auth';

// --- Import your existing Validation Schema ---
import loginValidationScema from '../utils/loginValidation';
import Toast from 'react-native-toast-message';
import { Ionicons } from '@expo/vector-icons'; // Import icons

const styles = StyleSheet.create({
    text: {
        fontSize: 70,
        fontFamily: 'Cinzel-Medium',
        padding: 2,
        color: "#ff8353",
        textAlign: 'center',
    },
    Btn_text: {
        fontFamily: 'Cinzel-SemiBold',
    },
    Iinput_text: {
        fontFamily: 'NataSans-SemiBold',
    },
    Act_text: {
        fontFamily: 'Cinzel-Regular',
    }
})

export default function Login() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false); // State for password visibility

    const handleLogin = async (values) => {
        setLoading(true);

        try {
            const userCredential = await signInWithEmailAndPassword(auth, values.email, values.password);
            const user = userCredential.user;
            if (user.emailVerified) {
                Toast.show({
                    type: 'success',
                    text1: 'Login Successful!',
                    text2: 'Welcome back.',
                    visibilityTime: 1000
                });

                router.replace('/(tabs)/Home');
            } else {
                Alert.alert(
                    'Verify Your Email',
                    'You need to verify your email before you can log in. Would you like to resend the verification email?',
                    [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Resend', onPress: () => sendEmailVerification(user) }
                    ]
                );
            }
        } catch (error) {
            if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
                Alert.alert('Login Failed', 'Invalid email or password.');
            } else {
                Alert.alert('Login Failed', error.message);
            }

        } finally {
            setLoading(false);
        }
    }
    const handleForgotPassword = (email) => {
        if (!email) {
            Alert.alert("Input Required", "Please enter your email address in the email field first.");
            return;
        }
        sendPasswordResetEmail(auth, email)
            .then(() => {
                Alert.alert("Password Reset", "A link to reset your password has been sent to your email.");
            })
            .catch((error) => {
                if (error.code === 'auth/user-not-found') {
                    Alert.alert("Error", "No user found with that email address.");
                } else {
                    Alert.alert("Error", "Could not send password reset email. Please try again.");
                }

            });
    };

    return (
        <SafeAreaView className='bg-[#151527]'>
            <ScrollView contentContainerStyle={{ height: '100%' }}>
                <StatusBar barStyle={"dark-content"} backgroundColor='#151527'></StatusBar>
                <View className='mt-14'>
                    <View className='px-2'>
                        <Animated.Text entering={FadeInUp.delay(200).duration(1500).springify()} style={styles.text} className='text-center w-96 mx-auto'>UNISOL</Animated.Text>
                        <Animated.View entering={FadeInUp.delay(300).duration(1500).springify()} className="flex justify-center items-center">
                            <LottieView style={{ width: 200, height: 150 }} source={require('../Lottie_Animations/S4xABGRXHM (1).json')} autoPlay loop />
                        </Animated.View>
                        <View>
                            <Formik
                                initialValues={{ email: '', password: '' }}
                                validationSchema={loginValidationScema}
                                onSubmit={handleLogin}
                            >
                                {({ handleSubmit, handleChange, handleBlur, values, errors, touched }) => {
                                    return (
                                        <View className='w-[86%] mx-auto'>
                                            <Animated.View entering={FadeInDown.delay(200).duration(1000).springify()}>
                                                <Text style={styles.Btn_text} className='text-[#ff8353] mt-4'>Email</Text>
                                                <TextInput onChangeText={handleChange('email')} onBlur={handleBlur('email')} value={values.email} style={styles.Iinput_text} placeholder='Email' placeholderTextColor="#ff8353" className='text-white border-2 border-[#ff8353] w-full px-4 py-3 rounded-xl bg-[#151527] mt-2' autoCapitalize='none' keyboardType='email-address' />
                                                {errors.email && touched.email && <Text className='text-red-500 text-xs mt-1'>{errors.email}</Text>}
                                            </Animated.View>
                                            <Animated.View entering={FadeInDown.delay(300).duration(1000).springify()}>
                                                <View className="flex-row justify-between items-center mt-4">
                                                    <Text style={styles.Btn_text} className='text-[#ff8353]'>Password</Text>
                                                   
                                                </View>
                                                {/* --- Password Input with Visibility Toggle --- */}
                                                <View className="flex-row items-center border-2 border-[#ff8353] rounded-xl mt-2">
                                                    <TextInput
                                                        secureTextEntry={!isPasswordVisible}
                                                        onChangeText={handleChange('password')}
                                                        onBlur={handleBlur('password')}
                                                        value={values.password}
                                                        style={styles.Iinput_text}
                                                        placeholder='Password'
                                                        placeholderTextColor="#ff8353"
                                                        className='flex-1 text-white px-4 py-3'
                                                    />
                                                    <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)} className="p-3">
                                                        <Ionicons name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'} size={24} color="#ff8353" />
                                                    </TouchableOpacity>
                                                </View>
                                                {errors.password && touched.password && <Text className='text-red-500 text-xs mt-1'>{errors.password}</Text>}
                                                 <TouchableOpacity onPress={() => handleForgotPassword(values.email)}>
                                                        <Text className="text-[#ff8353] text-base mt-3" style={styles.Act_text}>Forgot Password?</Text>
                                                    </TouchableOpacity>
                                            </Animated.View>
                                            <Animated.View entering={FadeInDown.delay(400).duration(1000).springify()}>
                                                <TouchableOpacity className='w-full py-4 rounded-full bg-[#ff8353] text-center mt-5' onPress={handleSubmit} disabled={loading}>
                                                    {loading ? <ActivityIndicator color="white" /> : <Text style={styles.Btn_text} className='text-center text-2xl text-white'>Login</Text>}
                                                </TouchableOpacity>
                                            </Animated.View>
                                        </View>
                                    )
                                }}
                            </Formik>

                            <Animated.View entering={FadeInLeft.delay(500).duration(1000).springify()} className='flex-row justify-center mt-5 gap-2'>

                                <Text className='text-xl text-white' style={styles.Act_text}>New here?</Text>
                                <Text className='text-xl border-b border-[#ff8353] text-[#ff8353]' style={styles.Act_text} onPress={() => router.push("SignUp")}>Sign Up</Text>
                            </Animated.View>
                        </View>
                    </View>
                    <View className='relative'>
                        <Animated.View entering={FadeInLeft.delay(600).duration(1000).springify()} className="right-28">
                            <LottieView style={{ width: 280, height: 250 }} source={require('../Lottie_Animations/rhh2tfidxj.json')} autoPlay loop />
                        </Animated.View>
                        <Animated.View entering={FadeInRight.delay(700).duration(1000).springify()} className="bottom-56 -right-64">
                            <LottieView style={{ width: 260, height: 240 }} source={require('../Lottie_Animations/Back to school!.json')} autoPlay loop />
                        </Animated.View>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}
