import { View, Text, StatusBar, FlatList, StyleSheet, Image, TouchableOpacity, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import { ScrollView } from 'react-native-virtualized-view';
import Feather from '@expo/vector-icons/Feather';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { LinearGradient } from 'expo-linear-gradient';
import { db } from '../../config/FireBAseConfig'; 


const Home = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true); // State for loading indicator
  const router = useRouter();

  useEffect(() => {

    const fetchCourses = async () => {
      try {
        // Corrected collection name to "courses"
        const coursesCollectionRef = collection(db, "CourseData");
        const q = query(coursesCollectionRef, orderBy("price", "asc"));
        const querySnapshot = await getDocs(q);
        
        // Corrected: Use .map() to create a new array
        const coursesList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setCourses(coursesList);
      } catch (error) {
        console.error("Error fetching courses: ", error);
      } finally {
        setLoading(false); // Stop loading indicator
      }
    };
    fetchCourses();
  }, []);

  // --- Derived Data ---
  // These now correctly use the 'courses' state without modifying it directly
  const filterData = [...courses].filter((item) => item.sold_course > 2500).sort((a, b) => b.sold_course - a.sold_course);
  const discountData = [...courses].filter((item) => item.sold_course > 2500).sort((a, b) => a.sold_course - b.sold_course);

  // --- Render Components ---
  const VerticalScroll = ({ item }) => (
    <Pressable onPress={() => router.push(`/ViewDetails/${item.id}`)}>
      <View style={styles.verticalCard}>
        <BlurView intensity={10} tint="light" style={StyleSheet.absoluteFill} />
        <Image source={{ uri: item.image }} style={styles.verticalImage} />
        <View style={styles.cardContent}>
            
          <Text style={[styles.Btn_text, styles.cardTitle]}>{item.course_name}</Text>
          <Text style={[styles.Btn_text, styles.cardSubtitle]}>{item.course_code}</Text>
          <Text style={[styles.Btn_text, styles.cardSubtitle]}>{item.faculty}</Text>
        </View>
      </View>
    </Pressable>
  );

  const HorizontalCard = ({ item }) => (
    // Corrected navigation to use item.id for consistency
    <Pressable onPress={() => router.push(`/ViewDetails/${item.id}`)}>
      <View style={styles.horizontalCard}>
        <BlurView intensity={10} tint="light" style={StyleSheet.absoluteFill} />
        <Image source={{ uri: item.image }} style={styles.horizontalImage} />
        <View style={styles.cardContent}>
         
          <Text style={[styles.Btn_text, styles.cardTitle]}>{item.course_name}</Text>
          <Text style={[styles.Btn_text, styles.cardSubtitle]}>{item.course_code}</Text>
          <Text style={[styles.Btn_text, styles.cardSubtitle]}>{item.faculty}</Text>
        </View>
      </View>
    </Pressable>
  );

  // --- Loading View ---
  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ff8353" />
        <Text style={styles.loadingText}>Loading Courses...</Text>
      </SafeAreaView>
    );
  }

  // --- Main Render ---
  return (
    <SafeAreaView >
      <StatusBar barStyle={"light-content"} backgroundColor='#151527' />
      <LinearGradient className='px-3' colors={['#151527', '#0e1636', '#ff8353']} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }}>
      <View style={styles.header}>
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
        <Text style={styles.sectionTitle}>Top Selling Courses</Text>
        <FlatList
          horizontal
          data={filterData}
          renderItem={HorizontalCard}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        />

        <Text style={styles.sectionTitle}>Discount Ongoing</Text>
        <FlatList
          horizontal
          data={discountData}
          renderItem={HorizontalCard}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        />

        <Text style={styles.sectionTitle}>Browse Our Courses</Text>
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
  container: {
    flex: 1,
    
    paddingHorizontal: 12,
  },
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
    fontFamily: 'JosefinSans-SemiBold',
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
  Btn_text: {
    fontFamily: 'JosefinSans-SemiBold',
  },
  sectionTitle: {
    fontFamily: 'JosefinSans-SemiBold',
    backgroundColor: '#ff8353',
    color: '#151527',
    fontSize: 24,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginTop: 20,
    marginBottom: 15,
    overflow: 'hidden',
    alignSelf: 'flex-start',
  },
  verticalCard: {
    height: 300,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    borderBottomWidth: 2,
    borderColor: '#ff8353',
    padding: 12,
  },
  horizontalCard: {
    width: 310,
    height: 250,
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: 16,
    borderBottomWidth: 2,
    borderColor: '#ff8353',
    padding: 8,
  },
  cardContent: {
    marginTop: 8,
    borderTopWidth: 2,
    borderStyle: 'dotted',
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
});

export default Home;
