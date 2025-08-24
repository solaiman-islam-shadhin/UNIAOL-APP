import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { View, Text, StatusBar, FlatList, StyleSheet, Image, TouchableOpacity, Pressable, ActivityIndicator, BackHandler, Modal, RefreshControl, Alert } from 'react-native';
import { ScrollView } from 'react-native-virtualized-view';
import Feather from '@expo/vector-icons/Feather';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter, useFocusEffect } from 'expo-router';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { db, auth } from '../../config/FireBAseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from "@react-navigation/native";
import { useRefresh } from '../../config/useRefresh'; // Ensure this path is correct

const Home = () => {
    const [slides, setSlides] = useState([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const navigation = useNavigation();

    // Set initial state to the guest view
    const [displayName, setDisplayName] = useState('UNISOL');
    const [userImage, setUserImage] = useState(null);

    const [loopedFilterData, setLoopedFilterData] = useState([]);
    const [loopedDiscountData, setLoopedDiscountData] = useState([]);

    const flatListRef = useRef(null);
    const autoplayIndex = useRef(0);
    const discountFlatListRef = useRef(null);
    const discountAutoplayIndex = useRef(0);

    const [exitModalVisible, setExitModalVisible] = useState(false);

    const fetchUserData = useCallback(async () => {
        const user = auth.currentUser;
        if (user) {
            const docRef = doc(db, "users", user.uid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const userData = docSnap.data();
                const name = userData.name ? userData.name.split(' ')[0] : 'User';
                setDisplayName(`Hi, ${name}`);
                setUserImage(userData.imageUrl || null);
            } else {
                setDisplayName('Hi, User');
                setUserImage(null);
            }
        }
    }, []);

    const fetchCourseData = useCallback(async () => {
        try {
            const querySnapshot = await getDocs(collection(db, "CourseData"));
            const items = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setSlides(items);
        } catch (error) {
            Alert.error("Failed to fetch course data:", error);
        }
    }, []);

    const refreshAllData = useCallback(async () => {
        await Promise.all([fetchCourseData(), fetchUserData()]);
    }, [fetchCourseData, fetchUserData]);

    const { isRefreshing, onRefresh } = useRefresh(refreshAllData);

    useEffect(() => {
        const initialLoad = async () => {
            setLoading(true);
            await refreshAllData();
            setLoading(false);
        };
        initialLoad();
    }, [refreshAllData]);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                fetchUserData();
            } else {
                setDisplayName('UNISOL');
                setUserImage(null);
            }
        });
        return () => unsubscribe();
    }, [fetchUserData]);

    useFocusEffect(
        useCallback(() => {
            // This will refetch user data every time the screen comes into focus
            fetchUserData(); 
            
            const onBackPress = () => {
                setExitModalVisible(true);
                return true;
            };
            const backHandler = BackHandler.addEventListener("hardwareBackPress", onBackPress);
            return () => backHandler.remove();
        }, [fetchUserData])
    );

    const filterData = useMemo(() => slides.filter(item => item.sold_course > 2500).sort((a, b) => b.sold_course - a.sold_course), [slides]);
    const discountData = useMemo(() => slides.filter(item => item.price > 2000).sort((a, b) => a.price - b.price), [slides]);
    
    // Autoplaying carousel logic
    useEffect(() => {
        if (filterData.length > 0) {
            setLoopedFilterData([...filterData, filterData[0]]);
        }
        if (discountData.length > 0) {
            setLoopedDiscountData([...discountData, discountData[0]]);
        }
    }, [filterData, discountData]);

    const cardWidth = 340;
    const cardSpacing = 16;
    const fullCardWidth = cardWidth + cardSpacing;

    useEffect(() => {
        const unsubscribe = navigation.addListener("focus", () => {
            autoplayIndex.current = 0;
            flatListRef.current?.scrollToOffset({ offset: 0, animated: false });
            discountAutoplayIndex.current = 0;
            discountFlatListRef.current?.scrollToOffset({ offset: 0, animated: false });
        });
        return unsubscribe;
    }, [navigation]);

    useEffect(() => {
        if (filterData.length === 0) return;
        const timer = setInterval(() => {
            autoplayIndex.current = autoplayIndex.current + 1;
            if (autoplayIndex.current >= loopedFilterData.length) {
                autoplayIndex.current = 0;
                flatListRef.current?.scrollToOffset({ offset: 0, animated: false });
            } else {
                flatListRef.current?.scrollToOffset({
                    offset: autoplayIndex.current * fullCardWidth,
                    animated: true,
                });
            }
        }, 3000);
        return () => clearInterval(timer);
    }, [filterData, loopedFilterData.length, fullCardWidth]);

    useEffect(() => {
        if (discountData.length === 0) return;
        const timer = setInterval(() => {
            discountAutoplayIndex.current = discountAutoplayIndex.current + 1;
             if (discountAutoplayIndex.current >= loopedDiscountData.length) {
                discountAutoplayIndex.current = 0;
                discountFlatListRef.current?.scrollToOffset({ offset: 0, animated: false });
            } else {
                discountFlatListRef.current?.scrollToOffset({
                    offset: discountAutoplayIndex.current * fullCardWidth,
                    animated: true,
                });
            }
        }, 3500);
        return () => clearInterval(timer);
    }, [discountData, loopedDiscountData.length, fullCardWidth]);


    const HorizontalCard = ({ item }) => (
        <View>
            <LinearGradient style={styles.horizontalCard} className=' p-2' colors={['#8e5d4c', '#607597']} start={{ x: 0.5, y: 0.2 }} end={{ x: 0.2, y: 0.8 }}>
                <Pressable onPress={() => router.push(`/ViewDetails/${item.id}`)}>
                    <View>
                        <Image source={{ uri: item.image }} style={styles.horizontalImage} />
                        <View style={styles.cardContent}>
                            <Text style={[styles.Btn_text, styles.cardTitle]}>{item.course_name}</Text>
                            <Text style={[styles.Btn_text, styles.cardSubtitle]}>{item.course_code}</Text>
                            <Text style={[styles.Btn_text, styles.cardSubtitle]}>{item.faculty}</Text>
                        </View>
                    </View>
                </Pressable>
            </LinearGradient>
        </View>
    );

    const HorizontalCard_2 = ({ item }) => (
        <View>
            <LinearGradient style={styles.horizontalCard} className='p-2' colors={['#3c5b93', '#b18561']} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }}>
                <Pressable onPress={() => router.push(`/ViewDetails/${item.id}`)}>
                    <View>
                        <Image source={{ uri: item.image }} style={styles.horizontalImage} />
                        <View style={styles.cardContent}>
                            <Text style={[styles.Btn_text, styles.cardTitle]}>{item.course_name}</Text>
                            <Text style={[styles.Btn_text, styles.cardSubtitle]}>{item.course_code}</Text>
                            <Text style={[styles.Btn_text, styles.cardSubtitle]}>{item.faculty}</Text>
                        </View>
                    </View>
                </Pressable>
            </LinearGradient>
        </View>
    );

    if (loading) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#ff8353" />
                <Text style={styles.loadingText}>Loading...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <StatusBar barStyle={"light-content"} backgroundColor='#151527' />
            <Modal
                animationType="fade"
                transparent={true}
                visible={exitModalVisible}
                onRequestClose={() => setExitModalVisible(!exitModalVisible)}
            >
                <View style={styles.modalBackdrop}>
                    <View className="bg-[#151527]  rounded-2xl w-4/5 p-5 shadow-lg items-center">
                        <Text className="text-white text-2xl text-center" style={styles.Btn_text}>Leaving so soon?</Text>
                        <Text className="text-white/80 text-base text-center my-4" style={styles.Btn_text}>Are you sure you want to exit?</Text>
                        <View className="flex-row justify-around mt-4 w-full">
                            <TouchableOpacity className="border-2 border-[#ff8353] rounded-full py-3 flex-1 mr-2" onPress={() => setExitModalVisible(false)}>
                                <Text className="text-[#ff8353] text-lg text-center" style={styles.Btn_text}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity className="bg-[#ff8353] rounded-full py-3 flex-1 ml-2" onPress={() => { setExitModalVisible(false); BackHandler.exitApp(); }}>
                                <Text className="text-white text-lg text-center" style={styles.Btn_text}>Exit</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            <LinearGradient className='flex-1 px-3' colors={['#151527', '#0e1636', '#ff8353']} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }}>
                
                <View style={styles.header}>
                    <Pressable style={styles.headerPressable} onPress={() => router.push("Profile")}>
                        {displayName !== 'UNISOL'  ? (
                                <Image source={{ uri: userImage }} style={styles.profileImage} />
                            ) : (
                                <Ionicons name="person-circle-outline" size={50} color="#ff8353" style={styles.avatarIcon} />
                            )
                        }
                        <Text style={displayName === 'UNISOL' ? styles.Home_text_Guest : styles.Home_text} numberOfLines={1}>
                            {displayName}
                        </Text>
                    </Pressable>
                    <View style={styles.headerIcons}>
                        <TouchableOpacity onPress={() => router.push("Search")}>
                            <Feather name="search" size={28} color="#ff8353" />
                        </TouchableOpacity>
                        <TouchableOpacity>
                            <Ionicons name="notifications-outline" size={28} color="#ff8353" />
                        </TouchableOpacity>
                    </View>
                </View>

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={isRefreshing}
                            onRefresh={onRefresh}
                            colors={['#ff8353']}
                            tintColor={'#ff8353'}
                        />
                    }
                >
                    <View className='mt-5 border-2 border-dotted rounded-2xl border-y-white border-x-[#ff8353] p-2'>
                        <Text style={styles.Hero_text_1} className='text-white text-5xl text-left'>Unlock Your Potential........</Text>
                        <Text style={styles.Hero_text_1} className='text-[#ff8353] text-[41px] my-2'>Master New Skills.</Text>
                        <Text style={styles.Hero_text} className='text-gray-400 text-xl'>Join thousands of learners on Unisol and access high-quality courses from top instructors, anytime, anywhere. Your journey to excellence starts here.</Text>
                    </View>

                    <Text style={styles.sectionTitle} className='border-b-2 border-dotted w-full text-center my-6 pb-2 border-b-white text-white'>Top Selling Courses..</Text>
                    <FlatList
                        ref={flatListRef}
                        horizontal
                        data={loopedFilterData}
                        renderItem={HorizontalCard}
                        keyExtractor={(item, index) => `${item.id}-${index}`}
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingHorizontal: 16 }}
                        snapToInterval={fullCardWidth}
                        decelerationRate="fast"
                        bounces={false}
                    />

                    <Text style={styles.sectionTitle} className='border-b-2 border-dotted w-full text-center my-6 pb-2 border-b-white text-white'>Discount Ongoing %</Text>
                    <FlatList
                        ref={discountFlatListRef}
                        horizontal
                        data={loopedDiscountData}
                        renderItem={HorizontalCard_2}
                        keyExtractor={(item, index) => `${item.id}-${index}`}
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
                        snapToInterval={fullCardWidth}
                        decelerationRate="fast"
                        bounces={false}
                    />

                    <TouchableOpacity className="mb-24" onPress={() => router.push('BrowseCourses')}>
                        <Text style={styles.sectionTitle} className='border-2 py-2 rounded-xl w-full text-center border-white bg-[#151527] text-white'>Browse Our Courses...</Text>
                    </TouchableOpacity>
                </ScrollView>
                <TouchableOpacity onPress={() => router.push('/Chatbot')} className="absolute bottom-24 right-5 bg-[#151527] p-4 rounded-full">
                    <Ionicons name="chatbubble-ellipses-outline" size={30} color="#ff8353" />
                </TouchableOpacity>
            </LinearGradient>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#151527' },
    loadingText: { marginTop: 10, color: '#ff8353', fontSize: 16, fontFamily: 'NataSans-SemiBold' },
    header: {
        marginTop: 16,
        flexDirection: 'row',
        borderBottomWidth: 2,
        paddingBottom: 12,
        borderColor: '#ff8353',
        width: '100%',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    headerPressable: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    headerIcons: { flexDirection: 'row', gap: 15 },
    profileImage: { width: 50, height: 50, borderRadius: 25, marginRight: 10, borderWidth: 1.5, borderColor: '#ff8353' },
    avatarIcon: { marginRight: 10 },
    Home_text: { fontSize: 30, fontFamily: 'NataSans-SemiBold', color: "#ff8353", flexShrink: 1 },
    Home_text_Guest: { fontSize: 30, fontFamily: 'Cinzel-SemiBold', color: "#ff8353", flexShrink: 1 },
    Hero_text_1: { fontFamily: 'NataSans-Bold' },
    Hero_text: { fontFamily: 'NataSans-Regular' },
    Btn_text: { fontFamily: 'NataSans-SemiBold' },
    Btn_text_price: { fontFamily: 'NataSans-Bold' },
    sectionTitle: { fontFamily: 'NataSans-SemiBold', fontSize: 26 },
    horizontalCard: { width: 340, height: 260, borderRadius: 10, marginRight: 16 },
    cardContent: { marginTop: 8, borderTopWidth: 2, borderStyle: 'solid', borderColor: '#ff8353', paddingTop: 8 },
    cardTitle: { color: 'white', fontSize: 18 },
    cardSubtitle: { color: 'white', fontSize: 16, opacity: 0.8 },
    horizontalImage: { width: '100%', height: 150, borderRadius: 8, marginBottom: 8 },
    modalBackdrop: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)' },
});

export default Home;
