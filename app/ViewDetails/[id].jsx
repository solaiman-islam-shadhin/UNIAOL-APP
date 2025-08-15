import { View, Text, Image, StatusBar, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView, Alert, Modal } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInUp, FadeInRight } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Toast from 'react-native-toast-message';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import {  onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../../config/FireBAseConfig';
import { useCart } from '../context/CartContext';
import FakePayment from '../../components/FakePayment';

export default function id() {
    const { items, addToCart, purchasedCourses, purchaseCourse } = useCart();
    const router = useRouter();
    const { id } = useLocalSearchParams();

    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isPaymentModalVisible, setPaymentModalVisible] = useState(false);
    const [currentUser, setCurrentUser] = useState(null); 

    useEffect(() => {
        
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user); 
        });

        const fetchCourseData = async () => {
            if (!id) {
                setLoading(false);
                return;
            }
            try {
                const courseDocRef = doc(db, "CourseData", id);
                const courseDocSnap = await getDoc(courseDocRef);

                if (courseDocSnap.exists()) {
                    setCourse({ id: courseDocSnap.id, ...courseDocSnap.data() });
                }
            } catch (error) {
               
            } finally {
                setLoading(false);
            }
        };

        fetchCourseData();
        return () => unsubscribe();
    }, [id]);

    const handlePaymentSuccess = async (paidAmount) => {
        if (!course || !currentUser) return;

        if (parseFloat(paidAmount) !== course.price) {
            Alert.alert('Payment Error', `The amount paid (${paidAmount} tk) does not match the course price (${course.price} tk).`);
            return;
        }

        try {
            const purchaseRef = doc(db, "users", currentUser.uid, "myCourses", course.id);
            await setDoc(purchaseRef, {
                courseId: course.id,
                purchaseDate: serverTimestamp(),
                courseName: course.course_name,
                image: course.image,
                video: course.video,
                faculty: course.faculty
            });
            purchaseCourse(course);
            setPaymentModalVisible(false);
            Alert.alert('Purchase Successful!', `You have purchased "${course.course_name}".`);
        } catch (error) {
            Alert.alert("Error", "Could not save your purchase.");
        }
    };

    const handleAddToCart = async () => {
        if (!course || !currentUser) return;

        try {
            const cartRef = doc(db, "users", currentUser.uid, "cart", course.id);
            await setDoc(cartRef, { ...course });
            addToCart(course); 
            Toast.show({
                 type: 'success',
                  text1: 'Item Added Successfully..',
                  visibilityTime: 1000
                 });
        } catch (error) {
            Alert.alert("Error", "Could not add item to cart.");
        }
    };

    const handleWatchNow = () => {
        if (course && course.video) {
            router.push(`/(tabs)/Class`);
        } else {
            Alert.alert("No Video", "Video content is not available for this course.");
        }
    };

    const toggleText = () => setIsExpanded(!isExpanded);

    if (loading) {
        return <SafeAreaView style={styles.centered}><ActivityIndicator size="large" color="#ff8353" /></SafeAreaView>;
    }

    if (!course) {
        return <SafeAreaView style={styles.centered}><Text style={styles.errorText}>Course not found.</Text></SafeAreaView>;
    }

    const isInCart = items.some(item => item.id === course.id);
    const isPurchased = purchasedCourses.some(item => item.id === course.id);

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <LinearGradient className="flex-1 px-4" colors={['#151527', '#0e1636', '#ff8353']} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }}>
                <StatusBar barStyle={"dark-content"} backgroundColor='#151527' />
                <Animated.View entering={FadeInRight.delay(200).duration(1000).springify()} className="mb-4">
                    <Text style={[styles.Btn_text, styles.courseName]}>{course.course_name}</Text>
                    <Text style={[styles.Btn_text, styles.priceText]}>Price : {course.price} tk</Text>
                </Animated.View>

                <ScrollView>
                    <Animated.View entering={FadeInUp.delay(300).duration(1000).springify()}>
                        <View className="rounded-xl overflow-hidden mt-5 mb-10 p-4 border-b-2 border-[#ff8353]">
                            <BlurView intensity={10} tint="light" style={StyleSheet.absoluteFill} />
                            <Image source={{ uri: course.image }} className="rounded-md w-full h-44 mb-2 border border-[#ff8353]" />
                            <View className="mt-2 pt-2 border-t-2 border-dotted border-[#ff8353]">
                                <Text className="text-white font-semibold text-base mb-1"><Text style={styles.detailLabel}>Course Name : </Text>{course.course_name}</Text>
                                <Text className="text-white font-semibold text-base mb-1"><Text style={styles.detailLabel}>Course Code : </Text>{course.course_code}</Text>
                                <Text className="text-white font-semibold text-base mb-1"><Text style={styles.detailLabel}>Faculty : </Text>{course.faculty}</Text>
                                <Text className="text-white font-semibold text-base mb-1"><Text style={styles.detailLabel}>Department : </Text>{course.department}</Text>
                                <Text className="text-white font-semibold text-base mb-1"><Text style={styles.detailLabel}>Class Duration : </Text>{course.class_time} hr</Text>
                                <Text className="text-white font-semibold text-base mb-1"><Text style={styles.detailLabel}>Sold Course : </Text>{course.sold_course}</Text>
                                <Text numberOfLines={isExpanded ? undefined : 10} className="text-white font-semibold text-justify text-base"><Text style={styles.detailLabel}>Description : </Text>{course.description}</Text>
                                <Text className="text-[#ff8353] mt-2" onPress={toggleText}>{isExpanded ? 'Read less' : 'Read more...'}</Text>
                            </View>

                            {/* --- Conditional Button Rendering --- */}
                            {currentUser ? (
                                isPurchased ? (
                                    <TouchableOpacity onPress={handleWatchNow} className="w-full bg-[#16a34a] py-4 mt-4 rounded-xl">
                                        <Text className="text-center font-bold text-white text-lg">Watch Now</Text>
                                    </TouchableOpacity>
                                ) : (
                                    <View className="flex-row justify-between items-center gap-4 mt-4">
                                        {isInCart ? (
                                            <TouchableOpacity onPress={() => router.push('/(tabs)/Cart')} className="flex-1 bg-[#151527] py-3 rounded-xl"><Text className="text-center font-semibold text-[#ff8353] text-base">View Cart</Text></TouchableOpacity>
                                        ) : (
                                            <TouchableOpacity onPress={handleAddToCart} className="flex-1  bg-[#151527] py-3 rounded-xl"><Text className="text-center font-semibold text-[#ff8353] text-base">Add to Cart</Text></TouchableOpacity>
                                        )}
                                        <TouchableOpacity onPress={() => setPaymentModalVisible(true)} className="flex-1 border-2 border-white py-3 rounded-xl"><Text className="text-center font-semibold text-white text-base">Buy Now</Text></TouchableOpacity>
                                    </View>
                                )
                            ) : (
                                <TouchableOpacity onPress={() => router.push('/Login')} className="w-full bg-[#ff8353] py-4 mt-4 rounded-xl">
                                    <Text className="text-center font-bold text-white text-lg">Login to Purchase</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </Animated.View>
                </ScrollView>
            </LinearGradient>

            <Modal visible={isPaymentModalVisible} animationType="slide" onRequestClose={() => setPaymentModalVisible(false)}>
                {course && <FakePayment onClose={() => setPaymentModalVisible(false)} onPaymentSuccess={handlePaymentSuccess} amount={course.price} />}
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#151527' },
    errorText: { fontFamily: 'NataSans-SemiBold', color: 'white', fontSize: 18 },
    Btn_text: { fontFamily: 'NataSans-SemiBold' },
    courseName: { fontSize: 28, textAlign: 'center', marginTop: 20, color: '#ff8353' },
    priceText: { fontSize: 32, alignSelf: 'center', textAlign: 'center', borderRadius: 12, marginTop: 12, borderWidth: 2, borderColor: '#ff8353', padding: 12, color: '#ff8353' },
    detailLabel: { fontFamily: 'NataSans-SemiBold', color: '#ff8353' },
});
