import {  SafeAreaView,View, Text, StatusBar, FlatList, StyleSheet, Image, TouchableOpacity, Pressable, ActivityIndicator, BackHandler, Alert, Modal } from 'react-native';
import { useEffect, useState } from 'react';
import { ScrollView } from 'react-native-virtualized-view';
import Feather from '@expo/vector-icons/Feather';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter, useFocusEffect } from 'expo-router'; // Import useFocusEffect
import { BlurView } from 'expo-blur';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { LinearGradient } from 'expo-linear-gradient'; // Corrected typo in path
import React from 'react';
import { db } from '../../config/FireBAseConfig';



const Home = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true); // State for loading indicator
  const router = useRouter();
  const [exitModalVisible, setExitModalVisible] = useState(false); // State for custom exit modal

  // --- Add Back Button Exit Logic ---
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        setExitModalVisible(true); // Show the custom modal instead of the default alert
        return true; // Prevents default back button behavior
      };

      // Add the event listener when the screen is focused
      const backHandler = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress
      );

      // Remove the event listener when the screen is unfocused
      return () => backHandler.remove();
    }, [])
  );

  useEffect(() => {

    const fetchCourses = async () => {
      try {
        // Corrected collection name from "CourseData" to "courses"
        const coursesCollectionRef = collection(db, "CourseData");
        const q = query(coursesCollectionRef, orderBy("price", "asc"));
        const querySnapshot = await getDocs(q);

        const coursesList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setCourses(coursesList);
      } catch (error) {
        console.error("Error fetching courses: ", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const filterData = [...courses].filter((item) => item.sold_course > 2500).sort((a, b) => b.sold_course - a.sold_course);
  const discountData = [...courses].filter((item) => item.sold_course > 2500).sort((a, b) => a.sold_course - b.sold_course);

  const VerticalScroll = ({ item }) => (
    <View>
      <LinearGradient style={styles.verticalCard} className=' ' colors={['#6a546d', '#5a71a4']} start={{ x: 0.5, y: 0.2 }} end={{ x: 0.2, y: 0.8 }}>
        <Pressable onPress={() => router.push(`/ViewDetails/${item.id}`)}>
          <View >

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

  const HorizontalCard = ({ item }) => (
    <View>
      <LinearGradient style={styles.horizontalCard} className='mr-4 p-2' colors={['#8e5d4c', '#607597']} start={{ x: 0.5, y: 0.2 }} end={{ x: 0.2, y: 0.8 }}>
        <Pressable onPress={() => router.push(`/ViewDetails/${item.id}`)}>
          <View >

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
      <LinearGradient style={styles.horizontalCard} className='mr-4 p-2' colors={['#b18561', '#3c5b93']} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }}>
        <Pressable onPress={() => router.push(`/ViewDetails/${item.id}`)}>
          <View >

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
        <Text style={styles.loadingText}>Loading Courses...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar barStyle={"light-content"} backgroundColor='#151527' />

      {/* --- Custom Exit Modal --- */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={exitModalVisible}
        onRequestClose={() => {
          setExitModalVisible(!exitModalVisible);
        }}
      >
        <View style={styles.modalBackdrop}>
          <View className="bg-[#151527]  rounded-2xl w-4/5 p-5 shadow-lg items-center">

            <Text className="text-white text-2xl text-center" style={styles.Btn_text}>Leaving so soon?</Text>
            <Text className="text-white/80 text-base text-center my-4" style={styles.Btn_text}>Are you sure you want to exit?</Text>
            <View className="flex-row justify-around mt-4 w-full">
              <TouchableOpacity
                className="border-2 border-[#ff8353] rounded-full py-3 flex-1 mr-2"
                onPress={() => setExitModalVisible(false)}
              >
                <Text className="text-[#ff8353] text-lg text-center" style={styles.Btn_text}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="bg-[#ff8353] rounded-full py-3 flex-1 ml-2"
                onPress={() => {
                  setExitModalVisible(false); // Hide modal before exiting
                  BackHandler.exitApp();
                }}
              >
                <Text className="text-white text-lg text-center" style={styles.Btn_text}>Exit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <LinearGradient className='flex-1 px-3' colors={['#151527', '#0e1636', '#ff8353']} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }}>
        <View style={styles.header} className='mt-5'>
          <Text style={styles.Home_text}>UNISOL</Text>
          <View style={styles.headerIcons}>
            <TouchableOpacity onPress={() => router.push("Search")}>
              <Feather name="search" size={24} color="#ff8353" />
            </TouchableOpacity>
            <TouchableOpacity>
              <Ionicons name="notifications-outline" size={24} color="#ff8353" />
            </TouchableOpacity>
          </View>
        </View>
      

        <ScrollView showsVerticalScrollIndicator={false}>

          <View className='my-5'>
            <Text style={styles.Hero_text_1} className='text-white text-5xl text-left'>
              Unlock Your Potential.
            </Text>
            <Text style={styles.Hero_text_1} className='text-[#ff8353] text-[41px] my-2'>
              Master New Skills.
            </Text>
            <Text style={styles.Hero_text} className='text-gray-400 text-xl'>
              Join thousands of learners on Unisol and access high-quality courses from top instructors, anytime, anywhere. Your journey to excellence starts here.
            </Text>
          </View>

          

          {/* #8e5d4c */}
          <Text style={styles.sectionTitle} className='border-b-2 w-full border-b-white text-white'>Top Selling Courses..</Text>
          <FlatList
            horizontal
            data={filterData}
            renderItem={HorizontalCard}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          />

          <Text style={styles.sectionTitle} className='border-b-2 w-full border-b-white text-white'>Discount Ongoing %</Text>
          <FlatList
            horizontal
            data={discountData}
            renderItem={HorizontalCard_2}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          />

          <Text style={styles.sectionTitle} className='border-b-2 w-full border-b-white text-white'>Browse Our Courses...</Text>
          <FlatList
            data={courses}
            renderItem={VerticalScroll}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: 100 }}
            scrollEnabled={false}
          />
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#151527',
  },
  loadingText: {
    marginTop: 10,
    color: '#ff8353',
    fontSize: 16,
    fontFamily: 'NataSans-SemiBold',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#ff8353',
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 15,
  },
  Home_text: {
    fontSize: 30,
    fontFamily: 'Cinzel-Medium',
    color: "#ff8353",
  },
  Hero_text_1: {
    fontFamily: 'NataSans-Bold',

  },
  Hero_text: {
    fontFamily: 'NataSans-Regular',

  },
  Btn_text: {
    fontFamily: 'NataSans-SemiBold',
  },
  sectionTitle: {
    fontFamily: 'NataSans-SemiBold',
    fontSize: 20,
    paddingVertical: 5,
    marginTop: 10,
    marginBottom: 15,
    overflow: 'hidden',
    alignSelf: 'flex-start',
  },
  verticalCard: {
    height: 300,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    padding: 12,
  },
  horizontalCard: {
    width: 320,
    height: 260,
    borderRadius: 10


  },
  cardContent: {
    marginTop: 8,
    borderTopWidth: 2,
    borderStyle: 'solid',
    borderColor: '#ff8353',
    paddingTop: 8,
  },
  cardTitle: {
    color: 'white',
    fontSize: 16,
  },
  cardSubtitle: {
    color: 'white',
    fontSize: 14,
    opacity: 0.8,
  },
  verticalImage: {
    width: '100%',
    height: 180,
    borderRadius: 8,
    marginBottom: 8,
  },
  horizontalImage: {
    width: '100%',
    height: 144,
    borderRadius: 8,
    marginBottom: 8,
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)'
  },
});
export default Home;
