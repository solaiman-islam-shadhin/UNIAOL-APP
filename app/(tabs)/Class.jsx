import { View, Text, FlatList, StyleSheet, Alert, TouchableOpacity, Image, ActivityIndicator, Pressable, StatusBar } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useCart } from '../context/CartContext';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import LottieView from 'lottie-react-native';
import { BlurView } from 'expo-blur';
import Animated, { FadeInUp } from 'react-native-reanimated';

// --- Firebase Imports ---
import {  onAuthStateChanged } from 'firebase/auth';
import { collection, getDocs } from 'firebase/firestore';
import { auth, db } from '../../config/FireBAseConfig';


export default function MyClass() {
    const router = useRouter();
    const { purchasedCourses, syncPurchasedCourses } = useCart();
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setCurrentUser(user);
                // Fetch purchased courses from Firestore for the logged-in user
                const coursesRef = collection(db, "users", user.uid, "myCourses");
                const querySnapshot = await getDocs(coursesRef);
                const firestoreCourses = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                syncPurchasedCourses(firestoreCourses); // Sync with context
            } else {
                setCurrentUser(null);
                syncPurchasedCourses([]); // Clear courses on logout
            }
            setLoading(false);
        });

        return () => unsubscribe(); // Cleanup listener
    }, []);

    const handleViewDetails = (courseId) => {
        // --- Navigate to the EnrollClass screen ---
        router.push(`/EnrollCourse/${courseId}`);
    };

    const renderPurchasedItem = ({ item, index }) => (
        <Animated.View entering={FadeInUp.delay(index * 100).duration(600).springify()}>
            <Pressable onPress={() => handleViewDetails(item.id)}>
                <View className="rounded-xl  overflow-hidden mb-14 p-4 border-b-2 border-[#ff8353]">
                    <BlurView intensity={10} tint="light" style={StyleSheet.absoluteFill} />
                    <Image source={{ uri: item.image }} className="w-full h-44 rounded-md mb-3" />
                    <View className="pt-2 border-t-2 border-dotted border-[#ff8353]">
                        <Text style={styles.itemName} className="text-white">{item.course_name}</Text>
                        <Text style={styles.itemFaculty} className="text-white">{item.faculty}</Text>
                    </View>
                    <View className="w-full bg-[#16a34a] py-3 mt-3 rounded-xl">
                        <Text className="text-center font-bold text-white text-lg">View Course</Text>
                    </View>
                </View>
            </Pressable>
        </Animated.View>
    );

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-[#151527]">
                <ActivityIndicator size="large" color="#ff8353" />
            </View>
        );
    }

    return (
        <SafeAreaView className="flex-1 ">
             <StatusBar barStyle={"light-content"} backgroundColor='#151527' />
            <LinearGradient className='flex-1 px-3' colors={['#151527', '#0e1636', '#ff8353']} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }}>
                <View className="flex-row items-center gap-3 mt-5 mb-6">
                    <TouchableOpacity className='relative' onPress={() => router.back()}>
                        <MaterialCommunityIcons name="backburger" size={32} color="#ff8353" />
                    </TouchableOpacity>
                    <Text style={styles.title} className="text-[#ff8353]">My Classes</Text>
                </View>
                
                {!currentUser ? (
                    // --- Guest View ---
                    <View className="flex justify-center items-center">
                     
                        <Text style={styles.emptyText} className="text-white text-center">Please log in to view your purchased courses.</Text>
                        <TouchableOpacity onPress={() => router.push('/Login')} className="w-full bg-[#ff8353] py-4 mt-8 rounded-full">
                            <Text className="text-center font-bold text-white text-lg" style={styles.buttonText}>Login / Sign Up</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    // --- Logged In View ---
                    <FlatList
                        data={purchasedCourses}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={renderPurchasedItem}
                        contentContainerStyle={{ paddingBottom: 20 }}
                        ListEmptyComponent={
                            <View className="items-center mt-20">
                               
                                <Text style={styles.emptyText} className="text-white -mt-5">You haven't purchased any courses yet.</Text>
                            </View>
                        }
                    />
                )}
            </LinearGradient>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    title: { fontSize: 28, fontFamily: 'Cinzel-SemiBold' },
    itemName: { fontSize: 18, fontFamily: 'NataSans-SemiBold' },
    itemFaculty: { fontSize: 16, fontFamily: 'NataSans-Regular', opacity: 0.8, marginTop: 4 },
    emptyText: { textAlign: 'center', marginTop: 50, fontSize: 18, color: 'white', fontFamily: 'NataSans-SemiBold' },
    buttonText: { fontFamily: 'Cinzel-SemiBold' },
});
