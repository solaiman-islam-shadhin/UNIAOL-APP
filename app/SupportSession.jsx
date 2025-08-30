import { View, Text, TouchableOpacity, ScrollView, StatusBar, Linking, Alert, ActivityIndicator, StyleSheet } from 'react-native';
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

// --- Firestore/Auth Imports ---
import { collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../config/FireBAseConfig';

const SUPPORT_LINKS = {
    'CSE': 'https://meet.google.com/bex-tdnb-gfb',
    'Pharmacy': 'https://meet.google.com/bex-tdnb-gfb',
    'EEE': 'https://meet.google.com/bex-tdnb-gfb',
    'Textile': 'https://meet.google.com/bex-tdnb-gfb',
};

const DEPARTMENTS = ['CSE', 'Pharmacy', 'EEE', 'Textile'];

export default function SupportSession() {
    const router = useRouter();
    const [selectedDept, setSelectedDept] = useState(null);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [purchasedCourses, setPurchasedCourses] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [currentDateTime, setCurrentDateTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentDateTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    // --- CORRECTED: This now fetches from the 'myCourses' subcollection ---
    const fetchPurchasedCourses = useCallback(async (department) => {
        const user = auth.currentUser;
        if (!user) {
            Alert.alert("Authentication Error", "You must be logged in to view your courses.");
            return;
        }

        setIsLoading(true);
        try {
            // This query now correctly targets the user's 'myCourses' subcollection
            // and filters by the selected department.
            const coursesRef = collection(db, "users", user.uid, "myCourses");
            const q = query(coursesRef, where('department', '==', department));

            const querySnapshot = await getDocs(q);
            const courses = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            
            setPurchasedCourses(courses);
        } catch (error) {
            console.error("Failed to fetch purchased courses:", error);
            Alert.alert("Error", "Could not fetch your course list.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleDeptSelect = (dept) => {
        setSelectedDept(dept);
        fetchPurchasedCourses(dept);
    };
    
    const handleCourseSelect = (course) => {
        setSelectedCourse(course);
    };

    const handleJoinCall = async (url) => {
        const canOpen = await Linking.canOpenURL(url);
        if (canOpen) {
            await Linking.openURL(url);
        } else {
            Alert.alert("Error", "Could not open the meeting link.");
        }
    };

    // --- Step 3: Render the final support session card ---
    const renderSchedule = () => {
        const currentDay = currentDateTime.getDay();
        const currentHour = currentDateTime.getHours();
        const isDayActive = currentDay >= 0 && currentDay <= 6; // Sunday to Thursday
        const isTimeActive = currentHour >= 9 && currentHour < 22; // 9 AM to 10 PM
        const isActive = isDayActive && isTimeActive;
        const meetLink = SUPPORT_LINKS[selectedDept];

        return (
            <View>
                <TouchableOpacity className="flex-row items-center justify-center mb-5 p-2.5" onPress={() => setSelectedCourse(null)}>
                    <Ionicons name="arrow-back" size={18} color="#ff8353" />
                    <Text style={styles.sub_text} className="text-[#ff8353] text-base font-natasans-semibold ml-2 underline">Choose a different course</Text>
                </TouchableOpacity>

                <View className="bg-white/10 p-5 rounded-2xl items-center">
                    <View className="items-center mb-5">
                        <Text style={styles.sub_text} className="text-xl font-natasans-bold text-white mb-2 text-center">{selectedCourse.course_name}</Text>
                        <Text style={styles.sub_text} className="text-base font-natasans-regular text-white/80">Support Hours: Sun - Thu, 9 AM - 10 PM</Text>
                    </View>
                    <TouchableOpacity
                        className={`flex-row items-center justify-center py-4 px-10 rounded-full w-4/5 ${isActive ? 'bg-[#ff8353]' : 'bg-gray-600'}`}
                        disabled={!isActive}
                        onPress={() => handleJoinCall(meetLink)}
                    >
                        <MaterialCommunityIcons name="google-classroom" size={20} color="white" />
                        <Text style={styles.sub_text} className="text-white text-lg font-natasans-semibold ml-2.5">{isActive ? 'Join Now' : 'Offline'}</Text>
                    </TouchableOpacity>
                </View>

                <View className="flex-row items-center justify-center mt-5 p-3 bg-black/20 rounded-xl">
                    <View className={`w-3 h-3 rounded-full mr-2.5 ${isActive ? 'bg-green-500' : 'bg-red-500'}`} />
                    <Text style={styles.sub_text} className="text-white font-natasans-semibold text-base">Support is currently {isActive ? 'ACTIVE' : 'INACTIVE'}</Text>
                </View>
            </View>
        );
    };
    
    // --- Step 2: Render the course selection list ---
    const renderCourseSelection = () => {
        if (isLoading) {
            return <ActivityIndicator size="large" color="#ff8353" />;
        }

        return (
            <View>
                <TouchableOpacity className="flex-row items-center justify-center mb-5 p-2.5" onPress={() => setSelectedDept(null)}>
                    <Ionicons name="arrow-back" size={18} color="#ff8353" />
                    <Text style={styles.sub_text} className="text-[#ff8353] text-base font-natasans-semibold ml-2 underline">Choose a different department</Text>
                </TouchableOpacity>

                {purchasedCourses.length > 0 ? (
                    <View className="p-5 bg-white/5 rounded-2xl">
                        <Text style={styles.sub_text} className="text-2xl font-natasans-bold text-white mb-5 text-center">Select a Purchased Course</Text>
                        {purchasedCourses.map(course => (
                            <TouchableOpacity key={course.id} className="w-full bg-[#ff8353]/20 py-4 rounded-xl mb-4 border border-[#ff8353]" onPress={() => handleCourseSelect(course)}>
                                <Text style={styles.sub_text} className="text-white text-lg font-natasans-semibold text-center">{course.course_name}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                ) : (
                    <View className="items-center p-5 bg-white/10 rounded-2xl">
                        <Text style={styles.sub_text} className="text-2xl font-natasans-bold text-white mb-2.5 text-center">No Courses Found</Text>
                        <Text style={styles.sub_text} className="text-base font-natasans-regular text-white/70 text-center mb-7">You have not purchased any courses in the {selectedDept} department yet.</Text>
                        <TouchableOpacity className="w-full bg-[#ff8353] py-4 rounded-full" onPress={() => router.push('/BrowseCourses')}>
                            <Text style={styles.sub_text} className="text-white text-lg font-natasans-semibold text-center">Purchase a Course</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        );
    };

    // --- Step 1: Render the department selection ---
    const renderDepartmentSelection = () => (
        <View className="items-center p-5 bg-white/5 rounded-2xl">
            <Text  style={styles.sub_text} className="text-2xl font-natasans-bold text-white mb-2.5">Select Your Department</Text>
            <Text  style={styles.sub_text} className="text-base font-natasans-regular text-white/70 text-center mb-7">Please choose your department to see support options for your purchased courses.</Text>
            {DEPARTMENTS.map(dept => (
                <TouchableOpacity key={dept} className="w-full bg-[#ff8353]/20 py-4 rounded-xl mb-4 border border-[#ff8353]" onPress={() => handleDeptSelect(dept)}>
                    <Text style={styles.sub_text} className="text-white text-lg font-natasans-semibold text-center">{dept}</Text>
                </TouchableOpacity>
            ))}
        </View>
    );

    return (
        <SafeAreaView className="flex-1">
            <StatusBar barStyle={"light-content"} backgroundColor='#151527' />
            <LinearGradient className="flex-1" colors={['#151527', '#0e1636', '#ff8353']} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }}>
                <View className="flex-row items-center justify-between mt-4 px-5 pt-2.5 pb-2.5">
                    <TouchableOpacity onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={28} color="#ff8353" />
                    </TouchableOpacity>
                    <Text style={styles.header} className=" text-[#ff8353]">Support Session</Text>
                    <View style={{ width: 28 }} />
                </View>
                <ScrollView contentContainerStyle={{ padding: 20 }}>
                    {!selectedDept
                        ? renderDepartmentSelection()
                        : !selectedCourse
                            ? renderCourseSelection()
                            : renderSchedule()
                    }
                </ScrollView>
            </LinearGradient>
        </SafeAreaView>
    );
}




const styles = StyleSheet.create({
    header: { fontSize: 32, fontFamily: 'Cinzel-Bold',  },
    sub_text: { fontFamily: 'NataSans-SemiBold',  },

})