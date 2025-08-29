import { View, Text, Image, StatusBar, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView, Alert } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInUp, FadeInRight, FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import YoutubePlayer from 'react-native-youtube-iframe';
import Ionicons from '@expo/vector-icons/Ionicons';
// --- Firebase Imports ---
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../config/FireBAseConfig';
import PDFDownloader from '../pdf/[PDFDownloader]';

export default function id() {
    const router = useRouter();
    const { id } = useLocalSearchParams(); 

    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isExpanded, setIsExpanded] = useState(false);

    useEffect(() => {
        const fetchCourseDetails = async () => {
            if (!id) {
                setLoading(false);
                return;
            }
            try {
                const docRef = doc(db, "CourseData", id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setCourse({ id: docSnap.id, ...docSnap.data() });
                }
            } catch (error) {
                console.error("Error fetching course details:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCourseDetails();
    }, [id]);

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
                        {/* --- YouTube Player --- */}
                        <View className="mt-8 rounded-xl overflow-hidden border-2 border-[#ff8353]">
                           <YoutubePlayer
                                height={200}
                                videoId={course.video}
                                play ={true} 
                                
                            />
                        </View>
                        
                        <View className="mt-6 ">
                            <Text style={[styles.Btn_text, styles.courseName]}>{course.course_name}</Text>
                            <View className="mt-4 pt-4 border-t-2 border-dotted border-[#ff8353]">
                                <Text className="text-white font-semibold text-base mb-2"><Text style={styles.detailLabel}>Faculty : </Text>{course.faculty}</Text>
                                <Text numberOfLines={isExpanded ? undefined : 10} className="text-white font-semibold text-justify text-base"><Text style={styles.detailLabel}>Description : </Text>{course.description}</Text>
                                <Text className="text-[#ff8353] mt-2" onPress={toggleText}>{isExpanded ? 'Read less' : 'Read more...'}</Text>
                            </View>
                        </View>
                    </Animated.View>
                
       

       <Animated.View entering={FadeInDown.delay(400).duration(1000).springify()} >
         <PDFDownloader  />
       </Animated.View>
        </ScrollView>


        <Animated.View entering={FadeInRight.delay(400).duration(1000).springify()}>
             <TouchableOpacity
          onPress={() => router.push('/Chatbot')}
          className="relative  "
        >
          <Ionicons className='absolute bottom-24 right-2 bg-[#151527] p-4 rounded-full shadow-lg' name="chatbubble-ellipses-outline" size={30} color="#ff8353" />
        </TouchableOpacity>
        </Animated.View>
            </LinearGradient>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#151527' },
    errorText: { fontFamily: 'JosefinSans-SemiBold', color: 'white', fontSize: 18 },
    Btn_text: { fontFamily: 'JosefinSans-SemiBold' },
    courseName: { fontSize: 28, textAlign: 'center', color: '#ff8353' },
    detailLabel: { fontFamily: 'JosefinSans-SemiBold', color: '#ff8353' },
});
