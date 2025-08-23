import { useEffect, useMemo, useState } from 'react';
import { FlatList, Image, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import Animated, { FadeInLeft, FadeInUp } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import LottieView from 'lottie-react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { collection, getDocs, query } from 'firebase/firestore';
import { db } from '../config/FireBAseConfig'; 



const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
};


const SearchableList = ({ fullData, renderItem, style }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const filteredData = useMemo(() => {
    if (!debouncedSearchQuery) {
      return [];
    }
    return fullData.filter((item) => {
      return Object.values(item).some(value =>
        typeof value === 'string' && value.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
      );
    });
  }, [debouncedSearchQuery, fullData]);

  return (
    <View className='flex-1 w-full'>
      <TextInput
        className="border-2 border-[#ff8353] rounded-xl mb-5 px-3 py-4 text-white"
        style={styles.font}
        placeholder="Search courses, faculty, and more..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholderTextColor="#ff8353"
      />

      <FlatList
        data={filteredData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={<View className='flex justify-center items-center mt-20'>
          {searchQuery ? (
            <View>
              <LottieView style={{ width: 300, height: 250 }} source={require('../Lottie_Animations/aBvnkrMp1I.json')} autoPlay loop />
              <Text className='text-[#ff8353] text-lg -mt-5 text-center' style={styles.font}>No courses found...</Text>
            </View>
          ) : (
            <View>
              <LottieView style={{ width: 300, height: 250 }} source={require('../Lottie_Animations/AJhyCw6I0K.json')} autoPlay loop />
              <Text className='text-[#ff8353] text-lg -mt-5 text-center' style={styles.font}>Start typing to search</Text>
            </View>
          )}
        </View>}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={10}
      />
    </View>
  );
};

const Search = () => {
  // --- State for Firestore data and loading ---
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
const router = useRouter();
  // --- Fetch data from Firestore on component mount ---
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const coursesCollectionRef = collection(db, "CourseData");
        const q = query(coursesCollectionRef);
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

  const renderProductItem = ({ item }) => (
    <Pressable onPress={() => router.push(`/ViewDetails/${item.id}`)}>
      <Animated.View entering={FadeInLeft.delay(200).duration(1000).springify()} className='border-b-2 border-[#ff8353] w-full h-80 p-4 rounded-xl overflow-hidden mb-4'>
        <BlurView intensity={10} tint="light" className='absolute right-0 top-0 left-0 bottom-0' />
        <Image source={{ uri: item.image }} className="rounded-md mb-2 w-full h-44" />
        <View className='mt-2 pt-2 border-t-2 border-dotted border-[#ff8353]'>
          <Text className='text-white text-lg' style={styles.font}>{item.course_name}</Text>
          <Text className='text-white text-base opacity-80' style={styles.font}>{item.course_code}</Text>
          <Text className='text-white text-base opacity-80' style={styles.font}>{item.faculty}</Text>
        </View>
      </Animated.View>
    </Pressable>
  );

  return (
    <SafeAreaView className='flex-1 px-3 bg-[#151527]'>
      <View className='flex-row mt-6 pb-3 items-center mb-3 gap-3'>
        <TouchableOpacity className='' onPress={() => router.back()}>
          <MaterialCommunityIcons name="backburger" size={32} color="#ff8353" />
        </TouchableOpacity>
        <Text className='text-4xl text-[#ff8353]' style={styles.headerFont}>Course Catalog</Text>
      </View>
      {loading ? (
        <View className='flex-1 justify-center items-center'>
            <ActivityIndicator size="large" color="#ff8353" />
        </View>
      ) : (
        <SearchableList
          fullData={courses} // Use data from Firestore
          renderItem={renderProductItem}
        />
      )}
              <TouchableOpacity
          onPress={() => router.push('Chatbot')}
          className="relative  "
        >
          <Ionicons className='absolute bottom-24 right-2 bg-[#ff8353] p-4 rounded-full shadow-lg' name="chatbubble-ellipses-outline" size={30} color="#151527" />
        </TouchableOpacity>
    </SafeAreaView>
  );
};

// You still need StyleSheet for custom fonts
const styles = StyleSheet.create({
  headerFont: {
    fontFamily: 'Cinzel-Medium',
  },
  font: {
    fontFamily: 'NataSans-SemiBold',
  },
});

export default Search;
