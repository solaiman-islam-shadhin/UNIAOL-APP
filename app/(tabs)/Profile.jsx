import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, StatusBar, Image, ScrollView, RefreshControl } from 'react-native';
import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../config/FireBAseConfig';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRefresh } from '../../config/useRefresh'; // Make sure the path to your hook is correct

export default function Profile() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Standalone function to fetch user data, wrapped in useCallback for stability
    const fetchUserData = useCallback(async () => {
        const currentUser = auth.currentUser;
        if (currentUser) {
            const docRef = doc(db, "users", currentUser.uid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setUser(docSnap.data());
            } else {
                // Fallback for users who exist in Auth but not yet in Firestore
                setUser({ email: currentUser.email, name: 'User' });
            }
        } else {
            setUser(null);
        }
    }, []);

    // Use the custom hook for pull-to-refresh functionality
    const { isRefreshing, onRefresh } = useRefresh(fetchUserData);

    // Effect for handling auth state changes (login/logout) and the initial data load
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                // Only show the full-screen loader on the very first load
                if (!user) {
                    setLoading(true);
                    await fetchUserData();
                    setLoading(false);
                }
            } else {
                setUser(null);
                setLoading(false);
            }
        });
        return () => unsubscribe();
    }, [fetchUserData, user]);


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
            <LinearGradient className='flex-1' colors={['#151527', '#0e1636', '#ff8353']} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }}>
                <ScrollView
                    contentContainerStyle={{ flexGrow: 1 }}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={isRefreshing}
                            onRefresh={onRefresh}
                            colors={['#ff8353']} // Spinner color for Android
                            tintColor={'#ff8353'}   // Spinner color for iOS
                        />
                    }
                >
                    <View className=" pt-10 px-4">
                        {user ? (
                            <View className="items-center">
                                {/* User Avatar and Name */}
                                {user.imageUrl ? (
                                    <Image source={{ uri: user.imageUrl }} style={styles.avatar} />
                                ) : (
                                    <MaterialCommunityIcons name="account-circle" size={120} color="rgba(255, 131, 83, 0.8)" />
                                )}
                                <Text style={styles.header} className="text-white mt-4">{user.name || 'User'}</Text>

                                {/* User Details Card */}
                                <View className="w-full mt-4 p-6 bg-white/10 rounded-xl border border-white/20">
                                    <Text style={styles.label} className="text-white/70">Institution</Text>
                                    <Text style={styles.info} className="text-white">{user.university || 'Not set'}</Text>
                                    
                                    <View style={styles.divider} />

                                    <Text style={styles.label} className="text-white/70">Department</Text>
                                    <Text style={styles.info} className="text-white">{user.department || 'Not set'}</Text>
                                    
                                    <View style={styles.divider} />

                                    <Text style={styles.label} className="text-white/70">Email</Text>
                                    <Text style={styles.info} className="text-white">{user.email}</Text>
                                </View>
                                
                                <TouchableOpacity onPress={() => router.push('/UpdateProfile')} className="flex-row items-center bg-white/10 p-4 rounded-lg border border-white/20 mt-4 w-full">
                                    <MaterialCommunityIcons name="account-edit-outline" size={24} color="#ff8353" />
                                    <Text style={styles.info} className="text-white ml-4">Update Profile</Text>
                                </TouchableOpacity>

                            </View>
                        ) : (
                            <View className="items-center justify-center flex-1">
                                <Text style={styles.header} className="text-[#ff8353] text-center">Profile</Text>
                                <Text style={styles.info} className="text-white text-center mt-2">Please log in to view your profile.</Text>
                            </View>
                        )}
                        
                        {/* Static Links & Logout/Login Button */}
                        <View className="w-full mt-auto pt-6">
                            <TouchableOpacity onPress={() => router.push('/Developer')} className="flex-row items-center bg-white/10 p-4 rounded-lg border border-white/20">
                                <MaterialCommunityIcons name="code-braces" size={24} color="#ff8353" />
                                <Text style={styles.info} className="text-white ml-4">Developer</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => router.push('/ContactUs')} className="flex-row items-center bg-white/10 p-4 rounded-lg border border-white/20 mt-4">
                                <MaterialCommunityIcons name="email-fast-outline" size={24} color="#ff8353" />
                                <Text style={styles.info} className="text-white ml-4">Contact Us</Text>
                            </TouchableOpacity>

                            <View className="mt-6 mb-6">
                                {user ? (
                                    <TouchableOpacity onPress={handleLogout} className="w-full bg-[#ff8353] py-4 rounded-full">
                                        <Text className="text-center text-white text-lg" style={styles.buttonText}>Logout</Text>
                                    </TouchableOpacity>
                                ) : (
                                    <TouchableOpacity onPress={() => router.push('/Login')} className="w-full bg-[#ff8353] py-4 rounded-full">
                                        <Text className="text-center text-white text-lg" style={styles.buttonText}>Login / Sign Up</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>
                    </View>
                </ScrollView>
                <TouchableOpacity
                    onPress={() => router.push('/Chatbot')}
                    className="absolute bottom-24 right-5 bg-[#151527] p-4 rounded-full shadow-lg"
                >
                    <Ionicons name="chatbubble-ellipses-outline" size={30} color="#ff8353" />
                </TouchableOpacity>
            </LinearGradient>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    header: {
        fontSize: 32,
        fontFamily: 'Cinzel-Bold',
        textAlign: 'center',
    },
    label: {
        fontSize: 16,
        fontFamily: 'NataSans-Regular',
        opacity: 0.8,
    },
    info: {
        fontSize: 20,
        fontFamily: 'NataSans-SemiBold',
    },
    buttonText: {
        fontFamily: 'NataSans-SemiBold',
    },
    avatar: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 3,
        borderColor: '#ff8353',
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        marginVertical: 12,
    }
});
