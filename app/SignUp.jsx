import { View, Text, Pressable, SafeAreaView, StatusBar, ScrollView, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native'
import { useRouter } from 'expo-router'
import LottieView from 'lottie-react-native';
import Animated, { FadeInDown, FadeInLeft, FadeInRight, FadeInUp } from 'react-native-reanimated';
import { Formik } from 'formik';
import { useState } from 'react';

// --- Firebase Imports ---
import { getAuth, createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../config/FireBAseConfig'; // Make sure this path is correct

// --- Import your existing Validation Schema ---
import ValidationSchema from '../utils/authVelidation'; // Make sure this path is correct

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
        fontFamily: 'Roboto-SemiBold',
    },
    Act_text: {
        fontFamily: 'JosefinSans-Regular',
    }
})

export default function SignUp() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleSignUp = async (values) => {
        setLoading(true);
        const auth = getAuth();
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
            const user = userCredential.user;
            await sendEmailVerification(user);
            await setDoc(doc(db, "users", user.uid), {
                name: values.name,
                email: user.email,
                uid: user.uid,
                createdAt: new Date(),
            });

            // 4. Inform the user and navigate to the Login screen
            Alert.alert(
                'Account Created!',
                'A verification link has been sent to your email. Please verify your account before logging in.',
                [{ text: 'OK', onPress: () => router.replace('/Login') }]
            );

        } catch (error) {
            // Handle specific Firebase errors
            if (error.code === 'auth/email-already-in-use') {
                Alert.alert('Sign Up Failed', 'That email address is already in use!');
            } else if (error.code === 'auth/invalid-email') {
                Alert.alert('Sign Up Failed', 'That email address is invalid!');
            } else {
                Alert.alert('Sign Up Failed', error.message);
            }
            
        } finally {
            setLoading(false);
        }
    }

    return (
        <SafeAreaView className='bg-[#151527]'>
            <ScrollView contentContainerStyle={{ height: '100%'}} className='mt-7' >
                <StatusBar barStyle={"dark-content"} backgroundColor='#151527'></StatusBar>
                <View>
                    <View className='px-2 mt-4'>
                        <Animated.Text entering={FadeInUp.delay(200).duration(1500).springify()} style={styles.text} className='text-center w-96 mx-auto'> UNISOL</Animated.Text>
                        <Animated.View entering={FadeInUp.delay(300).duration(1500).springify()} className="flex justify-center items-center mt-5" >
                            <LottieView style={{ width: 200, height: 150 }} source={require('../Lottie_Animations/nu7q12Cxs7.json')} autoPlay loop />
                        </Animated.View>
                        <View>
                            <Formik
                                initialValues={{ name: '', email: '', password: '' }}
                                validationSchema={ValidationSchema} // Use your imported validation schema
                                onSubmit={handleSignUp}
                            >
                                {({
                                    handleSubmit,
                                    handleChange,
                                    handleBlur,
                                    values,
                                    errors,
                                    touched
                                }) => (
                                    <View className='w-[86%] mx-auto'>
                                        <Animated.View entering={FadeInDown.delay(200).duration(1000).springify()}>
                                            <Text style={styles.Btn_text} className='text-[#ff8353]'>Name</Text>
                                            <TextInput onChangeText={handleChange('name')} onBlur={handleBlur('name')} value={values.name} style={styles.Iinput_text} placeholder='Name' placeholderTextColor="#ff8353" className='text-white border-2 border-[#ff8353] w-full px-4 py-3 rounded-xl bg-[#151527] mt-2' />
                                            {errors.name && touched.name && <Text className='text-red-500 text-xs mt-1'>{errors.name}</Text>}
                                        </Animated.View>
                                        <Animated.View entering={FadeInDown.delay(300).duration(1000).springify()}>
                                            <Text style={styles.Btn_text} className='text-[#ff8353] mt-4'>Email</Text>
                                            <TextInput onChangeText={handleChange('email')} onBlur={handleBlur('email')} value={values.email} style={styles.Iinput_text} placeholder='Email' placeholderTextColor="#ff8353" className='text-white border-2 border-[#ff8353] w-full px-4 py-3 rounded-xl bg-[#151527] mt-2' autoCapitalize='none' keyboardType='email-address' />
                                            {errors.email && touched.email && <Text className='text-red-500 text-xs mt-1'>{errors.email}</Text>}
                                        </Animated.View>
                                        <Animated.View entering={FadeInDown.delay(400).duration(1000).springify()}>
                                            <Text style={styles.Btn_text} className='text-[#ff8353] mt-4'>Password</Text>
                                            <TextInput secureTextEntry={true} onChangeText={handleChange('password')} onBlur={handleBlur('password')} value={values.password} style={styles.Iinput_text} placeholder='Password' placeholderTextColor="#ff8353" className='text-white border-2 border-[#ff8353] w-full px-4 py-3 rounded-xl bg-[#151527] mt-2' />
                                            {errors.password && touched.password && <Text className='text-red-500 text-xs mt-1'>{errors.password}</Text>}
                                        </Animated.View>
                                        <Animated.View entering={FadeInDown.delay(500).duration(1000).springify()}>
                                            <TouchableOpacity className='w-full py-4 rounded-full bg-[#ff8353] text-center mt-5' onPress={handleSubmit} disabled={loading}>
                                                {loading ? (
                                                    <ActivityIndicator color="white" />
                                                ) : (
                                                    <Text style={styles.Btn_text} className='text-center text-2xl text-white'>Sign Up</Text>
                                                )}
                                            </TouchableOpacity>
                                        </Animated.View>
                                    </View>
                                )}
                            </Formik>
                            <Animated.View entering={FadeInLeft.delay(600).duration(1000).springify()} className='flex-row justify-center mt-5 gap-2'>
                                <Text className='text-xl text-white' style={styles.Act_text}>Already a user?</Text>
                                <Text className='text-xl border-b border-[#ff8353] text-[#ff8353]' style={styles.Act_text} onPress={() => router.push("Login")}>Login</Text>
                            </Animated.View>
                        </View>
                        
                    </View>
                    <View className=' felx relative '>

                        <Animated.View entering={FadeInRight.delay(700).duration(1000).springify()} className="  right-24" >

                            <LottieView style={{ width: 280, height: 200 }} source={require('../Lottie_Animations/rhh2tfidxj.json')} autoPlay loop />

                        </Animated.View>

                        <Animated.View entering={FadeInLeft.delay(800).duration(1000).springify()} className="bottom-28 -right-72 " >

                            <LottieView style={{ width: 200, height: 150 }} source={require('../Lottie_Animations/Education.json')} autoPlay loop />

                        </Animated.View>

                    </View>

                </View>
            </ScrollView>
        </SafeAreaView>
    )
}
