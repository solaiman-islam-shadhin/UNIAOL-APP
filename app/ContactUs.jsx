import { View, Text, SafeAreaView, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, ActivityIndicator, Linking } from 'react-native';
import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import { Formik } from 'formik';
import * as Yup from 'yup';
import LottieView from 'lottie-react-native';

// --- Validation Schema for the Contact Form ---
const ContactSchema = Yup.object().shape({
    name: Yup.string()
        .min(2, 'Name is too short!')
        .required('Name is required'),
    email: Yup.string()
        .email('Invalid email address')
        .required('Email is required'),
    message: Yup.string()
        .min(10, 'Message should be at least 10 characters long')
        .required('Message is required'),
});

export default function ContactUs() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleSendMessage = (values, { resetForm }) => {
        setLoading(true);
        // Simulate sending a message
        setTimeout(() => {
            setLoading(false);
            Alert.alert(
                "Message Sent!",
                "Thank you for contacting us. We will get back to you shortly.",
                [{ text: "OK", onPress: () => resetForm() }]
            );
        }, 1500);
    };

    return (
        <SafeAreaView className="flex-1 ">
            <LinearGradient className='flex-1 px-4' colors={['#151527', '#0e1636', '#ff8353']} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }}>
                <View className="flex-row items-center gap-3 mt-6 mb-6">
                    <TouchableOpacity className='relative top-1' onPress={() => router.back()}>
                        <MaterialCommunityIcons name="backburger" size={32} color="#ff8353" />
                    </TouchableOpacity>
                    <Text style={styles.header} className="text-[#ff8353]">Contact Us</Text>
                </View>

                <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
                    <Animated.View entering={FadeInUp.delay(100).duration(600).springify()} className="items-center">
                    </Animated.View>

                    {/* --- Contact Info Section --- */}
                    <Animated.View entering={FadeInUp.delay(200).duration(600).springify()} className="w-full mt-6">
                        <TouchableOpacity onPress={() => Linking.openURL('tel:01882808626')} className="flex-row items-center bg-white/10 p-4 rounded-lg border border-white/20">
                            <MaterialCommunityIcons name="phone" size={24} color="#ff8353" />
                            <Text style={styles.infoText} className="text-white ml-4">01882808626</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => Linking.openURL('https://www.facebook.com/sis8952/')} className="flex-row items-center bg-white/10 p-4 rounded-lg border border-white/20 mt-4">
                            <MaterialCommunityIcons name="facebook" size={24} color="#ff8353" />
                            <Text style={styles.infoText} className="text-white ml-4">Facebook.com</Text>
                        </TouchableOpacity>
                    </Animated.View>

                    <Formik
                        initialValues={{ name: '', email: '', message: '' }}
                        validationSchema={ContactSchema}
                        onSubmit={handleSendMessage}
                    >
                        {({ handleSubmit, handleChange, handleBlur, values, errors, touched }) => (
                            <View className="w-full mt-8">
                                <Animated.View entering={FadeInDown.delay(200).duration(1000).springify()}>
                                    <Text style={styles.label} className='text-[#ff8353]'>Name</Text>
                                    <TextInput
                                        onChangeText={handleChange('name')}
                                        onBlur={handleBlur('name')}
                                        value={values.name}
                                        style={styles.input}
                                        placeholder='Your Name'
                                        placeholderTextColor="white"
                                        className='text-white border-2 border-[#ff8353] w-full px-4 py-3 rounded-xl bg-white/5 mt-2'
                                    />
                                    {errors.name && touched.name && <Text className='text-red-400 text-xs mt-1 ml-1'>{errors.name}</Text>}
                                </Animated.View>

                                <Animated.View entering={FadeInDown.delay(300).duration(1000).springify()}>
                                    <Text style={styles.label} className='text-[#ff8353] mt-4'>Email</Text>
                                    <TextInput
                                        onChangeText={handleChange('email')}
                                        onBlur={handleBlur('email')}
                                        value={values.email}
                                        style={styles.input}
                                        placeholder='your.email@example.com'
                                        placeholderTextColor="white"
                                        className='text-white border-2 border-[#ff8353] w-full px-4 py-3 rounded-xl bg-white/5 mt-2'
                                        autoCapitalize='none'
                                        keyboardType='email-address'
                                    />
                                    {errors.email && touched.email && <Text className='text-red-400 text-xs mt-1 ml-1'>{errors.email}</Text>}
                                </Animated.View>

                                <Animated.View entering={FadeInDown.delay(400).duration(1000).springify()}>
                                    <Text style={styles.label} className='text-[#ff8353] mt-4'>Message</Text>
                                    <TextInput
                                        onChangeText={handleChange('message')}
                                        onBlur={handleBlur('message')}
                                        value={values.message}
                                        style={[styles.input, { height: 120, textAlignVertical: 'top' }]}
                                        placeholder='How can we help you?'
                                        placeholderTextColor="white"
                                        className='text-white border-2 border-[#ff8353] w-full px-4 py-3 rounded-xl bg-white/5 mt-2'
                                        multiline={true}
                                        numberOfLines={4}
                                    />
                                    {errors.message && touched.message && <Text className='text-red-400 text-xs mt-1 ml-1'>{errors.message}</Text>}
                                </Animated.View>

                                <Animated.View entering={FadeInDown.delay(500).duration(1000).springify()}>
                                    <TouchableOpacity className='w-full py-4 rounded-full bg-[#ff8353] text-center mt-8' onPress={handleSubmit} disabled={loading}>
                                        {loading ? (
                                            <ActivityIndicator color="white" />
                                        ) : (
                                            <Text style={styles.buttonText} className='text-center text-xl text-white'>Send Message</Text>
                                        )}
                                    </TouchableOpacity>
                                </Animated.View>
                            </View>
                        )}
                    </Formik>
                </ScrollView>
            </LinearGradient>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    header: {
        fontSize: 32,
        fontFamily: 'Cinzel-Bold',
    },
    label: {
        fontFamily: 'JosefinSans-SemiBold',
        fontSize: 16,
    },
    input: {
        fontFamily: 'JosefinSans-Regular',
        fontSize: 16,
    },
    infoText: {
        fontFamily: 'JosefinSans-SemiBold',
        fontSize: 18,
    },
    buttonText: {
        fontFamily: 'Cinzel-SemiBold',
    },
});
