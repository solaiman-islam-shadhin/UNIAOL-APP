
import { useEffect, useRef, useState, useMemo } from 'react';
import { View, Text, StatusBar, FlatList, StyleSheet, Image, TouchableOpacity, Pressable, ActivityIndicator, BackHandler, Modal, Dimensions } from 'react-native';
import { ScrollView } from 'react-native-virtualized-view';
import Feather from '@expo/vector-icons/Feather';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter, useFocusEffect } from 'expo-router';
import { collection, getDocs } from 'firebase/firestore';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { db } from '../../config/FireBAseConfig';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from "@react-navigation/native";


const Home = () => {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const navigation = useNavigation();

  const [loopedFilterData, setLoopedFilterData] = useState([]);
  const [loopedDiscountData, setLoopedDiscountData] = useState([]);

  const flatListRef = useRef(null);
  const autoplayIndex = useRef(0);
  const discountFlatListRef = useRef(null);
  const discountAutoplayIndex = useRef(0);

  const [exitModalVisible, setExitModalVisible] = useState(false);
//backhandler


  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        setExitModalVisible(true);
        return true;
      };
      const backHandler = BackHandler.addEventListener("hardwareBackPress", onBackPress);
      return () => backHandler.remove();
    }, [])
  );
 
//fetching data

  useEffect(() => {
    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "CourseData"));
        const items = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setSlides(items);
      } catch (error) {
      alert(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filterData = useMemo(() => {
    return [...slides]
      .filter((item) => item.sold_course > 2500)
      .sort((a, b) => b.sold_course - a.sold_course);
  }, [slides]);

  const discountData = useMemo(() => {
    return [...slides]
      .filter((item) => item.price >2000)
      .sort((a, b) => a.price - b.price);
  }, [slides]);


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
      flatListRef.current?.scrollToOffset({
        offset: autoplayIndex.current * fullCardWidth,
        animated: true,
      });

      if (autoplayIndex.current >= filterData.length) {
        setTimeout(() => {
          flatListRef.current?.scrollToOffset({ offset: 0, animated: false });
          autoplayIndex.current = 0;
        }, 800);
      }
    }, 3000);
    return () => clearInterval(timer);
  }, [filterData]);


  useEffect(() => {
    if (discountData.length === 0) return;
    const timer = setInterval(() => {
      discountAutoplayIndex.current = discountAutoplayIndex.current + 1;
      discountFlatListRef.current?.scrollToOffset({
        offset: discountAutoplayIndex.current * fullCardWidth,
        animated: true,
      });

      if (discountAutoplayIndex.current >= discountData.length) {
        setTimeout(() => {
          discountFlatListRef.current?.scrollToOffset({ offset: 0, animated: false });
          discountAutoplayIndex.current = 0;
        }, 800);
      }
    }, 3500);
    return () => clearInterval(timer);
  }, [discountData]);
  
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
        <Text style={styles.loadingText}>Loading Courses...</Text>
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
        onRequestClose={() => {
          setExitModalVisible(!exitModalVisible);
        }}
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
        <View style={styles.header} className='mt-2'>
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
        <TouchableOpacity onPress={() => router.push('/Chatbot')} className="relative">
          <Ionicons className='absolute bottom-24 right-2 bg-[#151527] p-4 rounded-full shadow-lg' name="chatbubble-ellipses-outline" size={30} color="#ff8353" />
        </TouchableOpacity>
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
    fontFamily: 'Cinzel-SemiBold',
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
  Btn_text_price: {
    fontFamily: 'NataSans-Bold',
  },
  sectionTitle: {
    fontFamily: 'NataSans-SemiBold',
    fontSize: 26,
  
   
  },
  horizontalCard: {
    width: 340,
    height: 315,
    borderRadius: 10,
    marginRight: 16,
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
    fontSize: 18,
  },
  cardSubtitle: {
    color: 'white',
    fontSize: 16,
    opacity: 0.8,
  },
  horizontalImage: {
    width: '100%',
    height: 200,
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