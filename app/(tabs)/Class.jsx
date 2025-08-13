import { View, Text, FlatList, StyleSheet, Alert, TouchableOpacity, Image } from 'react-native';
import React from 'react';
import { useCart } from '../context/CartContext';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import LottieView from 'lottie-react-native';
import { BlurView } from 'expo-blur';
import Animated, { FadeInUp } from 'react-native-reanimated';

export default function Class() {
    const router = useRouter();
    const { purchasedCourses } = useCart();

    // This function now navigates to the details page
    const handleViewDetails = (courseId) => {
        router.push(`/MyCourseDetails/${courseId}`);
    };

    const renderPurchasedItem = ({ item, index }) => (
        <Animated.View entering={FadeInUp.delay(index * 100).duration(600).springify()}>
            {/* The entire card is now pressable */}
            <TouchableOpacity onPress={() => handleViewDetails(item.id)}>
                <View className="rounded-xl overflow-hidden mb-4 p-4 border-b-2 border-[#ff8353]">
                    <BlurView intensity={10} tint="light" style={StyleSheet.absoluteFill} />
                    <Image source={{ uri: item.image }} className="w-full h-44 rounded-md mb-3" />
                    <View className="pt-2 border-t-2 border-dotted border-[#ff8353]">
                        <Text style={styles.itemName} className="text-white">{item.course_name}</Text>
                        <Text style={styles.itemFaculty} className="text-white">{item.faculty}</Text>
                    </View>
                    {/* The button is now part of the card's visual, but the whole card is the touch target */}
                    <View className="w-full bg-[#16a34a] py-3 mt-3 rounded-xl">
                        <Text className="text-center font-bold text-white text-lg">View Course</Text>
                    </View>
                </View>
            </TouchableOpacity>
        </Animated.View>
    );

    return (
        <SafeAreaView className="flex-1">
            <LinearGradient className='flex-1 px-3' colors={['#151527', '#0e1636', '#ff8353']} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }}>
                <View className="flex-row items-center gap-3 mt-5 mb-6">
                    <TouchableOpacity className='relative top-1' onPress={() => router.back()}>
                        <MaterialCommunityIcons name="backburger" size={32} color="#ff8353" />
                    </TouchableOpacity>
                    <Text style={styles.title} className="text-[#ff8353]">My Classes</Text>
                </View>
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
            </LinearGradient>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    title: { fontSize: 28, fontFamily: 'JosefinSans-Bold' },
    itemName: { fontSize: 18, fontFamily: 'JosefinSans-SemiBold' },
    itemFaculty: { fontSize: 16, fontFamily: 'JosefinSans-Regular', opacity: 0.8, marginTop: 4 },
    emptyText: { textAlign: 'center', marginTop: 50, fontSize: 18, color: 'white', fontFamily: 'JosefinSans-SemiBold' },
});
