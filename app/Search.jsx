import { useEffect, useMemo, useState } from 'react';
import { FlatList, Image, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown, FadeInLeft, FadeInUp } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import CourseData from '../store/CourseData';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import LottieView from 'lottie-react-native';




const router = useRouter();



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
    <View style={[styles.componentContainer, style]}>
      <View className=' flex-row gap-2 items-center mb-5' >
        <TouchableOpacity onPress={() => router.back()} >
          <Ionicons name="arrow-back-circle-outline" size={40} color="#ff8353" />
        </TouchableOpacity>
        <TextInput className="flex-1 border-2 rounded-xl px-2 py-4 "
          style={styles.searchInput}
          placeholder="Search courses..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#ff8353"
        />
      </View>
      <FlatList
        data={filteredData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={<View className='felx justify-center items-center mt-20'>
          
          {searchQuery ? <View>
           <Animated.View entering={FadeInUp.delay(300).duration(1500).springify()}>
            <LottieView style={{ width: 300, height: 250 }} source={require('../aBvnkrMp1I.json')} autoPlay loop />
          </Animated.View>

        </View> : <View>
          <Animated.View entering={FadeInUp.delay(300).duration(1500).springify()}>
            <LottieView style={{ width: 300, height: 250 }} source={require('../AJhyCw6I0K.json')} autoPlay loop />
          </Animated.View>
        </View>}</View>}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={10}
      />
    </View>
  );
};

const Search = () => {
  const renderProductItem = ({ item }) => (
    <Animated.View entering={FadeInLeft.delay(200).duration(1000).springify()} className='border-b-2 border-[#ff8353] w-full h-80 p-4 rounded-xl  overflow-hidden bg-transparent mb-4  '>
      <BlurView intensity={10} tint="light" className='absolute right-0 top-0 left-0 bottom-0' />
      <Image source={{ uri: item.image }} className="rounded-md  border-t-2 border-[#ff8353] mb-2 w-full h-44" />
      <View className='mt-2' >
        <Text className='text-white font-semibold overflow-y-scroll overflow-x-scroll text-lg border-t-2 border-spacing-y-3 border-dotted border-[#ff8353] '>{item.course_name}</Text>
        <Text className='text-white font-semibold overflow-y-scroll overflow-x-scroll text-lg'>{item.course_code}</Text>
        <Text className='text-white font-semibold overflow-y-scroll overflow-x-scroll text-lg'>{item.faculty}</Text>
        <Text className='text-white font-semibold overflow-y-scroll overflow-x-scroll text-lg'>{item.sold_course}</Text>
      </View>
    </Animated.View>
  );


  return (
    <SafeAreaView style={styles.container}>
      
      <Text style={styles.header}>Course Catalog</Text>
      <SearchableList
        fullData={CourseData}
        searchKey="name"
        renderItem={renderProductItem}
        style={styles.listStyle}
      />
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#151527',
  },
  header: {
    fontSize: 28,
    fontFamily: 'Cinzel-Medium',
    color: '#ff8353',
    paddingHorizontal: 10,
    paddingTop: 20,
    paddingBottom: 10,
  },
  listStyle: {
    paddingHorizontal: 10,
  },
  // Styles for the SearchableList component itself
  componentContainer: {
    flex: 1,
    width: '100%',
  },
  searchInput: {
    borderColor: '#ff8353',
    backgroundColor: '#151527',
    fontSize: 16,
    color: '#ff8353',
    fontFamily: 'Roboto-Regular',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#888',
  },
  // Styles for the items rendered by your renderProductItem function

  text: {
    fontSize: 16,
    marginVertical: 2,
    textAlign: 'justify',
    fontFamily: 'Roboto-SemiBold',
  },

});

export default Search;
