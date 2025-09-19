import { View, Text, StyleSheet, ActivityIndicator, ScrollView, Alert, TouchableOpacity, StatusBar } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInUp, FadeInRight, FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import YoutubePlayer from 'react-native-youtube-iframe';
import Ionicons from '@expo/vector-icons/Ionicons';
// --- ADD THIS ---
import { Rating } from 'react-native-ratings';
// --- Firebase Imports ---
import { doc, getDoc, runTransaction, setDoc } from 'firebase/firestore';
import { db } from '../../config/FireBAseConfig';
// --- ADD THIS ---
import { getAuth } from 'firebase/auth';

import PDFDownloader from '../pdf/[PDFDownloader]';
import Toast from 'react-native-toast-message';

export default function id() {
    const router = useRouter();
    const { id } = useLocalSearchParams(); 

    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isExpanded, setIsExpanded] = useState(false);
    
    // --- ADD THIS: State for the rating system ---
    const [videoEnded, setVideoEnded] = useState(false);
    const [userRating, setUserRating] = useState(0); // 0 means not rated yet
    const [isSubmitting, setIsSubmitting] = useState(false);
    const auth = getAuth();
    const currentUser = auth.currentUser;

    useEffect(() => {
        const fetchCourseAndRating = async () => {
            if (!id || !currentUser) {
                setLoading(false);
                return;
            }
            try {
                // Fetch course details (your existing code)
                const courseDocRef = doc(db, "CourseData", id);
                const courseDocSnap = await getDoc(courseDocRef);

                if (courseDocSnap.exists()) {
                    setCourse({ id: courseDocSnap.id, ...courseDocSnap.data() });
                }

                // --- ADD THIS: Fetch the user's previous rating ---
                const ratingDocId = `${currentUser.uid}_${id}`;
                const ratingDocRef = doc(db, "UserRatings", ratingDocId);
                const ratingDocSnap = await getDoc(ratingDocRef);

                if (ratingDocSnap.exists()) {
                    setUserRating(ratingDocSnap.data().rating);
                }

            } catch (error) {
               alert(error)
            } finally {
                setLoading(false);
            }
        };

        fetchCourseAndRating();
    }, [id, currentUser]);

    // --- ADD THIS: Function to handle video state changes ---
    const onStateChange = (state) => {
        if (state === "ended") {
            setVideoEnded(true);
             Toast.show({
                            type: 'success',
                            text1: 'Coourse Comeplete.',
                            visibilityTime: 1300
                        });
        }
    };

    // --- ADD THIS: Function to submit the rating to Firebase ---
    const handleRatingSubmit = async (rating) => {
        setIsSubmitting(true);
        const ratingDocId = `${currentUser.uid}_${id}`;
        const userRatingRef = doc(db, "UserRatings", ratingDocId);
        const courseRef = doc(db, "CourseData", id);

        try {
            // Use a transaction to ensure data consistency
            await runTransaction(db, async (transaction) => {
                const courseDoc = await transaction.get(courseRef);
                if (!courseDoc.exists()) {
                    throw "Course document does not exist!";
                }

                // Get current course ratings
                const currentAvgRating = courseDoc.data().averageRating || 0;
                const currentTotalRatings = courseDoc.data().totalRatings || 0;

                // Calculate new average
                const newTotalRatings = currentTotalRatings + 1;
                const newAvgRating = ((currentAvgRating * currentTotalRatings) + rating) / newTotalRatings;

                // Update course document
                transaction.update(courseRef, {
                    averageRating: newAvgRating,
                    totalRatings: newTotalRatings,
                });

                // Set the user's rating document
                transaction.set(userRatingRef, {
                    userId: currentUser.uid,
                    courseId: id,
                    rating: rating,
                });
            });

            setUserRating(rating); // Update UI immediately
             Toast.show({
                            type: 'success',
                            text1: 'Success , Thank You for you feedback',
                            visibilityTime: 1300
                        });

        } catch (error) {
            alert(error)
             Toast.show({
                            type: 'error',
                            text1: 'Could not submit your rating',
                            visibilityTime: 1300
                        });
        } finally {
            setIsSubmitting(false);
        }
    };


    const toggleText = () => setIsExpanded(!isExpanded);

    if (loading) {
        return <SafeAreaView style={styles.centered}><ActivityIndicator size="large" color="#ff8353" /></SafeAreaView>;
    }

    if (!course) {
        return <SafeAreaView style={styles.centered}><Text style={styles.errorText}>Course not found.</Text></SafeAreaView>;
    }

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <LinearGradient className="flex-1 px-4" colors={['#151527', '#0e1636', '#ff8353']} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }}>
                <StatusBar barStyle={"dark-content"} backgroundColor='#151527' />
                <TouchableOpacity className='relative mt-5' onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={30} color="#ff8353" />
                </TouchableOpacity>
                <ScrollView>
                    <Animated.View entering={FadeInUp.delay(200).duration(1000).springify()}>
                        <View className="mt-8 rounded-xl overflow-hidden border-2 border-[#ff8353]">
                           <YoutubePlayer
                                height={200}
                                videoId={course.video}
                                play={true}
                                // --- MODIFIED: Add this prop ---
                                onChangeState={onStateChange}
                            />
                        </View>
                        
                        <View className="mt-6">
                            <Text style={[styles.Btn_text, styles.courseName]}>{course.course_name}</Text>
                            <View className="mt-4 pt-4 border-t-2 border-dotted border-[#ff8353]">
                                <Text className="text-white font-semibold text-base mb-2"><Text style={styles.detailLabel}>Faculty : </Text>{course.faculty}</Text>
                                <Text numberOfLines={isExpanded ? undefined : 10} className="text-white font-semibold text-justify text-base"><Text style={styles.detailLabel}>Description : </Text>{course.description}</Text>
                                <Text className="text-[#ff8353] mt-2" onPress={toggleText}>{isExpanded ? 'Read less' : 'Read more...'}</Text>
                            </View>
                        </View>
                    </Animated.View>
                  <Animated.View entering={FadeInDown.delay(400).duration(1000).springify()} >
                       <PDFDownloader />
                    </Animated.View>
                    {/* --- ADD THIS: The entire rating block --- */}
                    <Animated.View entering={FadeInDown.delay(500).duration(1000).springify()} style={styles.ratingContainer}>
                       
                        
                        {isSubmitting ? (
                            <ActivityIndicator size="large" color="#fff" />
                        ) : userRating > 0 ? (
                            <View style={styles.ratedBlock}>
                                <Text style={styles.ratedText}>You have already rated this course</Text>
                                <Rating
                                    type='star'
                                    ratingCount={5}
                                    imageSize={25}
                                    readonly
                                    startingValue={userRating}
                                    tintColor='#151527'
                                    ratingColor='#ff8353' // Match background
                                />
                            </View>
                        ) : !videoEnded ? (
                            <Text style={styles.ratingInfoText}>Please complete the video to enable rating.</Text>
                        ) : (
                            <Rating
                                type='star'
                                ratingCount={5}
                                imageSize={25}
                                showRating
                                onFinishRating={handleRatingSubmit}
                                tintColor='#151527' // Match background
                                ratingColor='#ff8353'
                            />
                        )}
                    </Animated.View>

                  
                </ScrollView>

                <Animated.View entering={FadeInRight.delay(400).duration(1000).springify()}>
                    <TouchableOpacity
                        onPress={() => router.push('/Chatbot')}
                        className="relative"
                    >
                        <Ionicons className='absolute bottom-24 right-2 bg-[#151527] p-4 rounded-full shadow-lg' name="chatbubble-ellipses-outline" size={30} color="#ff8353" />
                    </TouchableOpacity>
                </Animated.View>
            </LinearGradient>
        </SafeAreaView>
    );
}

// --- ADD THIS: New styles for the rating section ---
const styles = StyleSheet.create({
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#151527' },
    errorText: { fontFamily: 'NataSans-SemiBold', color: 'white', fontSize: 16 },
    Btn_text: { fontFamily: 'NataSans-SemiBold' },
    courseName: { fontSize: 25, textAlign: 'center', color: '#ff8353' },
    detailLabel: { fontFamily: 'NataSans-SemiBold', color: '#ff8353' },
    // --- RATING STYLES ---
    ratingContainer: {
        
        marginBottom: 20,
        padding: 10,
        backgroundColor: '#151527', // Semi-transparent version of your background
        borderRadius: 15,
        borderWidth: 1,
        
        alignItems: 'center',
    },
    ratingTitle: {
        fontSize: 20,
        color: 'white',
        fontFamily: 'NataSans-SemiBold',
        marginBottom: 15,
    },
    ratingInfoText: {
        color: '#ccc',
        fontFamily: 'NataSans-SemiBold',
        textAlign: 'center',
    },
    ratedBlock: {
        alignItems: 'center',
    },
    ratedText: {
        color: 'white',
        fontFamily: 'NataSans-SemiBold',
        fontSize: 14,
        marginBottom: 10,
    },
});