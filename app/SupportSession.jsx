import { View, Text, TouchableOpacity, ScrollView, StatusBar, Linking, Alert, StyleSheet } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

// --- Simplified data with just the meet links per department ---
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
    const [currentDateTime, setCurrentDateTime] = useState(new Date());

    // Update the current time every minute to keep the button state accurate
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentDateTime(new Date());
        }, 1000 * 60); // Update every 60 seconds

        return () => clearInterval(timer); // Cleanup on component unmount
    }, []);

    const handleDeptSelect = (dept) => {
        setSelectedDept(dept);
    };

    const handleJoinCall = async (url) => {
        const supported = await Linking.canOpenURL(url);
        if (supported) {
            await Linking.openURL(url);
        } else {
            Alert.alert(`Error`, `Could not open the meeting link.`);
        }
    };

    const renderSchedule = () => {
        const currentDay = currentDateTime.getDay(); // 0=Sunday, 5=Friday, 6=Saturday
        const currentHour = currentDateTime.getHours(); // 0-23

        // --- UNIFIED SCHEDULE LOGIC ---
        // Active on Sunday (0) through Thursday (4)
        const isDayActive = currentDay >= 0 && currentDay <= 4;
        // Active from 9 AM (9) up to 10 PM (22)
        const isTimeActive = currentHour >= 9 && currentHour < 22;
        const isActive = isDayActive && isTimeActive;

        const meetLink = SUPPORT_LINKS[selectedDept];

        return (
            <View >
                <TouchableOpacity className="flex-row items-center justify-center mb-5 p-2.5" onPress={() => setSelectedDept(null)}>
                     <Ionicons name="arrow-back" size={18} color="#ff8353" />
                    <Text style={styles.sub_text} className="text-[#ff8353] text-base  ml-2 underline">Choose a different department</Text>
                </TouchableOpacity>

                <View className="bg-white/10 p-5 rounded-2xl items-center">
                    <View className="items-center mb-5">
                        <Text style={styles.sub_text} className="text-xl  text-white mb-2">{selectedDept} Support</Text>
                        <Text style={styles.sub_text} className="text-base  text-white/80">Available: Sunday - Thursday</Text>
                        <Text style={styles.sub_text} className="text-base  text-white/80">Time: 9:00 AM - 10:00 PM</Text>
                    </View>
                    <TouchableOpacity
                        className={`flex-row items-center justify-center py-4 px-10 rounded-full w-4/5 ${isActive ? 'bg-[#ff8353]' : 'bg-[#555]'}`}
                        disabled={!isActive}
                        onPress={() => handleJoinCall(meetLink)}
                    >
                        <MaterialCommunityIcons name="google-classroom" size={20} color="white" />
                        <Text style={styles.sub_text} className="text-white text-lg  ml-2.5">{isActive ? 'Join Now' : 'Offline'}</Text>
                    </TouchableOpacity>
                </View>

        
                <View className="flex-row items-center justify-center mt-5 p-3 bg-black/20 rounded-xl">
                    <View className={`w-3 h-3 rounded-full mr-2.5 ${isActive ? 'bg-green-500' : 'bg-red-500'}`} />
                    <Text style={styles.sub_text} className="text-white  text-base">
                        Support is currently {isActive ? 'ACTIVE' : 'INACTIVE'}
                    </Text>
                </View>
            </View>
        );
    };

    const renderDepartmentSelection = () => (
        <View className="items-center p-5 bg-white/5 rounded-2xl">
            <Text style={styles.sub_text}  className="text-2xl font-natasans-bold text-white mb-2.5">Select Your Department</Text>
            <Text style={styles.sub_text}  className="text-base  text-white/70 text-center mb-7">Please choose your department to see the support session details.</Text>
            {DEPARTMENTS.map(dept => (
                <TouchableOpacity key={dept} className="w-full bg-[#ff8353]/20 py-4 rounded-xl mb-4 border border-[#ff8353]" onPress={() => handleDeptSelect(dept)}>
                    <Text style={styles.sub_text}  className="text-white text-lg  text-center">{dept}</Text>
                </TouchableOpacity>
            ))}
        </View>
    );

    return (
        <SafeAreaView className="flex-1">
            <StatusBar barStyle={"light-content"} backgroundColor='#151527' />
            <LinearGradient className="flex-1" colors={['#151527', '#0e1636', '#ff8353']} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }}>
                <View className="flex-row items-center mt-4 justify-between px-5 pt-2.5 pb-2.5">
                    <TouchableOpacity onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={28} color="#ff8353" />
                    </TouchableOpacity>
                    <Text style={styles.header} className="  text-[#ff8353]">Support Session</Text>
                    <View style={{ width: 28 }} />
                </View>
                <ScrollView contentContainerStyle={{padding: 20}}>
                    {selectedDept ? renderSchedule() : renderDepartmentSelection()}
                </ScrollView>
            </LinearGradient>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    header: { fontSize: 32, fontFamily: 'Cinzel-Bold',  },
    sub_text: { fontFamily: 'NataSans-SemiBold',  },

})