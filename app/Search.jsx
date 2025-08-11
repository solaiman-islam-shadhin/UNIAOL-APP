import { useEffect, useMemo, useState } from 'react';
import { FlatList, Image, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown, FadeInLeft, FadeInUp } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import CourseData from '../store/CourseData';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
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
    <View className='flex-1 w-full'>
      <TextInput className=" border-2 border-[#ff8353] rounded-xl mb-5 px-3 py-4 text-white "
        placeholder="Search courses..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholderTextColor="#ff8353"
      />

      <FlatList
        data={filteredData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={<View className='felx justify-center items-center mt-20'>
          {searchQuery ? <View>
            <View entering={FadeInUp.delay(300).duration(1500).springify()}>
              <LottieView style={{ width: 300, height: 250 }} source={require('../Lottie_Animations/aBvnkrMp1I.json')} autoPlay loop />
            </View>
          </View> : <View>
            <View entering={FadeInUp.delay(300).duration(1500).springify()}>
              <LottieView style={{ width: 300, height: 250 }} source={require('../Lottie_Animations/AJhyCw6I0K.json')} autoPlay loop />
            </View>
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
    <Pressable onPress={() => router.push(`/ViewDetails/${item.id}`)}>
      <View entering={FadeInLeft.delay(200).duration(1000).springify()} className='border-b-2 border-[#ff8353] w-full h-80 p-4 rounded-xl  overflow-hidden bg-transparent mb-4  '>
        <BlurView intensity={10} tint="light" className='absolute right-0 top-0 left-0 bottom-0' />
        <Image source={{ uri: item.image }} className="rounded-md  border-t-2 border-[#ff8353] mb-2 w-full h-44" />
        <View className='mt-2' >
          <Text className='text-white font-semibold overflow-y-scroll overflow-x-scroll text-lg pt-2 border-t-2 border-spacing-y-3 border-dotted border-[#ff8353] '>{item.course_name}</Text>
          <Text className='text-white font-semibold overflow-y-scroll overflow-x-scroll text-lg'>{item.course_code}</Text>
          <Text className='text-white font-semibold overflow-y-scroll overflow-x-scroll text-lg'>{item.faculty}</Text>

        </View>
      </View>
    </Pressable>
  );


  return (
   <SafeAreaView style={styles.container} className='px-3 flex-1 overflow-hidden bg-[#151527]'>
        <View className='flex flex-row items-center mb-3 gap-3 '>
          <TouchableOpacity className='relative top-1 ' onPress={() => router.back()} >
            <MaterialCommunityIcons name="backburger" size={32} color="#ff8353" />
          </TouchableOpacity>
          <Text style={styles.header}>Course Catalog</Text>
        </View>
      <SearchableList
        fullData={CourseData}
        searchKey="name"
        renderItem={renderProductItem}
      />
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  header: {
    fontSize: 28,
    fontFamily: 'Cinzel-Medium',
    color: '#ff8353',
    paddingHorizontal: 0,
    paddingTop: 20,
    paddingBottom: 10,
  },
  searchInput: {
    borderColor: '#ff8353',
    fontSize: 16,
    color: '#ff8353',
    fontFamily: 'Roboto-Regular',
  },
  text: {
    fontSize: 16,
    marginVertical: 2,
    textAlign: 'justify',
    fontFamily: 'Roboto-SemiBold',
  },

});

export default Search;
