import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Image, Pressable, StatusBar } from 'react-native'
import React, { useState, useEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context';
import {useRouter } from 'expo-router';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '../config/FireBAseConfig';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
// Card Component (copied from Home screen for reuse)
const VerticalScroll = ({ item }) => {
  const router = useRouter();
  return (
    <View>
      <LinearGradient style={styles.verticalCard} colors={['#6a546d', '#5a71a4']} start={{ x: 0.5, y: 0.2 }} end={{ x: 0.2, y: 0.8 }}>
        <Pressable onPress={() => router.push(`/ViewDetails/${item.id}`)}>
          <View className=''>
            <Image source={{ uri: item.image }} style={styles.verticalImage} />
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
};

const BrowseCourses = () => {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');
 const router = useRouter();
  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const coursesCollectionRef = collection(db, "CourseData");
        const q = query(coursesCollectionRef, orderBy("price", "asc"));
        const querySnapshot = await getDocs(q);
        const coursesList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setCourses(coursesList);
      } catch (error) {
        alert(error)
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const browseCourses = courses.filter(course => {
    if (activeFilter === 'All') {
      return true;
    }
    return course.department && course.department.toLowerCase() === activeFilter.toLowerCase();
  });

  return (
    <SafeAreaView  className='flex-1'>
       <StatusBar barStyle={"light-content"} backgroundColor='#151527' />
 
      <LinearGradient className='flex-1 px-3' colors={['#151527', '#0e1636', '#ff8353']} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }}>

         <View style={styles.header} className='mt-2'>
          <Text style={styles.Home_text}>UNISOL</Text>
          <View style={styles.headerIcons}>
            <TouchableOpacity onPress={() => router.push("Search")}>
              <Feather name="search" size={24} color="#ff8353" />
            </TouchableOpacity>
           <TouchableOpacity className='' onPress={() => router.back()}>
          <MaterialCommunityIcons name="backburger" size={26} color="#ff8353" />
        </TouchableOpacity>
          </View>
        </View>
        {/* Filter Buttons */}
        <View style={styles.filterContainer} className=''>
          {['All', 'CSE', 'EEE', 'Pharmacy', 'Textile'].map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterButton,
                activeFilter === filter && styles.activeFilterButton
              ]}
              onPress={() => setActiveFilter(filter)}
            >
              <Text style={[
                styles.filterButtonText,
                activeFilter === filter && styles.activeFilterButtonText
              ]}>
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#ff8353" style={{flex: 1}} />
        ) : browseCourses.length > 0 ? (
          <FlatList
            data={browseCourses}
            renderItem={({ item }) => <VerticalScroll item={item} />}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        ) : (
          <View style={styles.noCoursesContainer}>
            <Text style={styles.noCoursesText}>No courses available in this department.</Text>
          </View>
        )}
         <TouchableOpacity onPress={() => router.push('/Chatbot')} className="relative">
          <Ionicons className='absolute bottom-24 right-2 bg-[#151527] p-4 rounded-full shadow-lg' name="chatbubble-ellipses-outline" size={30} color="#ff8353" />
        </TouchableOpacity>
      </LinearGradient>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  
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
  // Filter button styles
  filterContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 15,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ff8353',
  },
  activeFilterButton: {
    backgroundColor: '#ff8353',
  },
  filterButtonText: {
    color: '#ff8353',
    fontFamily: 'NataSans-SemiBold',
  },
  activeFilterButtonText: {
    color: '#151527',
  },
  // No courses message styles
  noCoursesContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noCoursesText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'NataSans-Regular',
  },
  // Card styles (copied from Home)
  Btn_text: { fontFamily: 'NataSans-SemiBold' },
  verticalCard: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    padding:10
  },
  verticalImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  cardContent: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 2,
    borderColor: '#ff8353',
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
});

export default BrowseCourses;