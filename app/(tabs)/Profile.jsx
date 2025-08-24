import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, StatusBar, Image, ScrollView, RefreshControl, Modal, Pressable } from 'react-native';
import React, { useState, useCallback } from 'react';
import { useRouter, useFocusEffect } from 'expo-router'; // Import useFocusEffect
import { LinearGradient } from 'expo-linear-gradient';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../config/FireBAseConfig';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function Profile() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isModalVisible, setIsModalVisible] = useState(false);

    // --- NEW: useFocusEffect to fetch data every time the screen is focused ---
    useFocusEffect(
        useCallback(() => {
            const fetchUserData = async () => {
                const currentUser = auth.currentUser;
                if (currentUser) {
                    const docRef = doc(db, "users", currentUser.uid);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        setUser(docSnap.data());
                    } else {
                        setUser({ email: currentUser.email, name: 'User' });
                    }
                } else {
                    setUser(null); // Clear user data if not logged in
                }
                setLoading(false);
            };

            fetchUserData();
        }, [])
    );

    const handleLogout = async () => {
        try {
            await signOut(auth);
            setUser(null); // Clear user state immediately
            router.replace('/');
        } catch (error) {
            Alert.alert("Logout Failed", "An error occurred while trying to log out.");
        }
    };

    if (loading) {
        return <View style={styles.loadingContainer}><ActivityIndicator size="large" color="#ff8353" /></View>;
    }

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <StatusBar barStyle={"light-content"} backgroundColor='#151527' />

            <Modal
                animationType="fade"
                transparent={true}
                visible={isModalVisible}
                onRequestClose={() => setIsModalVisible(false)}
            >
                <Pressable style={styles.modalBackdrop} onPress={() => setIsModalVisible(false)}>
                    <View style={styles.modalContainer}>
                        <Image source={{ uri: user?.imageUrl }} style={styles.fullscreenImage} resizeMode="contain" />
                        <TouchableOpacity style={styles.closeButton} onPress={() => setIsModalVisible(false)}>
                            <Ionicons name="close-circle" size={40} color="white" />
                        </TouchableOpacity>
                    </View>
                </Pressable>
            </Modal>

            <LinearGradient className='flex-1' colors={['#151527', '#0e1636', '#ff8353']} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }}>
                <ScrollView contentContainerStyle={{ flexGrow: 0 }}>
                    <View className="flex-1 pt-10 px-4">
                        {user ? (
                            <View className="items-center">
                                <TouchableOpacity onPress={() => user?.imageUrl && setIsModalVisible(true)}>
                                    {user.imageUrl ? (
                                        <Image source={{ uri: user.imageUrl }} style={styles.avatar} />
                                    ) : (
                                        <MaterialCommunityIcons name="account-circle" size={120} color="rgba(255, 131, 83, 0.8)" />
                                    )}
                                </TouchableOpacity>
                                <Text style={styles.header} className="text-white mt-4">{user.name || 'User'}</Text>
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
                        <View className="w-full mt-auto pt-4">
                            <TouchableOpacity onPress={() => router.push('/Developer')} className="flex-row items-center bg-white/10 p-4 rounded-lg border border-white/20">
                                <MaterialCommunityIcons name="code-braces" size={24} color="#ff8353" />
                                <Text style={styles.info} className="text-white ml-4">Developer</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => router.push('/ContactUs')} className="flex-row items-center bg-white/10 p-4 rounded-lg border border-white/20 mt-4">
                                <MaterialCommunityIcons name="email-fast-outline" size={24} color="#ff8353" />
                                <Text style={styles.info} className="text-white ml-4">Contact Us</Text>
                            </TouchableOpacity>
                            <View className="mt-4 mb-6">
                                {user ? (
                                    <TouchableOpacity onPress={handleLogout} className="w-full bg-[#ff8353] py-4 rounded-full"><Text className="text-center text-white text-lg" style={styles.buttonText}>Logout</Text></TouchableOpacity>
                                ) : (
                                    <TouchableOpacity onPress={() => router.push('/Login')} className="w-full bg-[#ff8353] py-4 rounded-full"><Text className="text-center text-white text-lg" style={styles.buttonText}>Login / Sign Up</Text></TouchableOpacity>
                                )}
                            </View>
                        </View>
                    </View>
                </ScrollView>
                <TouchableOpacity onPress={() => router.push('/Chatbot')} className="absolute bottom-24 right-5 bg-[#151527] p-4 rounded-full shadow-lg">
                    <Ionicons name="chatbubble-ellipses-outline" size={30} color="#ff8353" />
                </TouchableOpacity>
            </LinearGradient>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    header: { fontSize: 32, fontFamily: 'Cinzel-Bold', textAlign: 'center' },
    label: { fontSize: 14, fontFamily: 'NataSans-Regular', opacity: 0.8 },
    info: { fontSize: 18, fontFamily: 'NataSans-SemiBold' },
    buttonText: { fontFamily: 'NataSans-SemiBold' },
    avatar: { width: 130, height: 130, borderRadius: 100, borderWidth: 2, borderColor: '#ff8353' },
    divider: { height: 1, backgroundColor: 'rgba(255, 255, 255, 0.2)', marginVertical: 12 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#151527' },
    modalBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: '90%',
        height: '80%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    fullscreenImage: {
        width: '100%',
        height: '100%',
        borderRadius: 20,
    },
    closeButton: {
        position: 'absolute',
        top: -15,
        right: -15,
    },
});
