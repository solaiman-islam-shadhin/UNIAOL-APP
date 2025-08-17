import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, StatusBar } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import LottieView from 'lottie-react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import {  onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../config/FireBAseConfig'; 
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function Profile() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                const docRef = doc(db, "users", currentUser.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setUser(docSnap.data());
                } else {
                    setUser({ email: currentUser.email, name: 'User' });
                }
            } else {
                setUser(null);
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleLogout = async () => {
      
        try {
            await signOut(auth);
            router.replace('/');
        } catch (error) {
            Alert.alert("Logout Failed", "An error occurred while trying to log out.");
        }
    };

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-[#151527]">
                <ActivityIndicator size="large" color="#ff8353" />
            </View>
        );
    }

    return (
        <SafeAreaView className="flex-1">
             <StatusBar barStyle={"light-content"} backgroundColor='#151527' />
            <LinearGradient className='flex-1 px-4' colors={['#151527', '#0e1636', '#ff8353']} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }}>
               
                <View className="flex-1 pt-10">
                    {user ? (
                       
                        <View className="items-center">
                      
                            <Text style={styles.header} className="text-[#ff8353] mt-4">Welcome!</Text>
                            <View className="w-full mt-6 p-6 bg-white/10 rounded-xl border border-white/20">
                                <Text style={styles.label} className="text-white/70">Name</Text>
                                <Text style={styles.info} className="text-white">{user.name}</Text>
                                <Text style={styles.label} className="text-white/70 mt-4">Email</Text>
                                <Text style={styles.info} className="text-white">{user.email}</Text>
                            </View>
                        </View>
                    ) : (
                        <View className="items-center">
                     
                            <Text style={styles.header} className="text-[#ff8353] text-center mt-4">Profile</Text>
                            <Text style={styles.info} className="text-white text-center mt-2">Please log in to view your profile and purchased courses.</Text>
                        </View>
                    )}

                    <View className="w-full mt-10">
                        <TouchableOpacity onPress={() => router.push('/Developer')} className="flex-row items-center bg-white/10 p-4 rounded-lg border border-white/20">
                             <MaterialCommunityIcons name="code-braces" size={24} color="#ff8353" />
                             <Text style={styles.info} className="text-white ml-4">Developer</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => router.push('/ContactUs')} className="flex-row items-center bg-white/10 p-4 rounded-lg border border-white/20 mt-4">
                             <MaterialCommunityIcons name="email-fast-outline" size={24} color="#ff8353" />
                             <Text style={styles.info} className="text-white ml-4">Contact Us</Text>
                        </TouchableOpacity>
                    </View>

                    <View className="mt-10 mb-6">
                        {user ? (
                            <TouchableOpacity onPress={handleLogout} className="w-full bg-[#ff8353] py-4 rounded-full">
                                <Text className="text-center  text-white text-lg" style={styles.buttonText}>Logout</Text>
                            </TouchableOpacity>
                        ) : (
                             <TouchableOpacity onPress={() => router.push('/Login')} className="w-full bg-[#ff8353] py-4 rounded-full">
                                <Text className="text-center  text-white text-lg" style={styles.buttonText}>Login / Sign Up</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
                 <TouchableOpacity
          onPress={() => router.push('/Chatbot')}
          className="relative  "
        >
          <Ionicons className='absolute bottom-24 right-2 bg-[#151527] p-4 rounded-full shadow-lg' name="chatbubble-ellipses-outline" size={30} color="#ff8353" />
        </TouchableOpacity>
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
        fontSize: 16,
        fontFamily: 'NataSans-Regular',
    },
    info: {
        fontSize: 20,
        fontFamily: 'NataSans-SemiBold',
    },
    buttonText: {
        fontFamily: 'NataSans-SemiBold',
    }
});
