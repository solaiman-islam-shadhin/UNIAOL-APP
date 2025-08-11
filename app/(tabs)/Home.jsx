import { View, Text, StatusBar, FlatList, StyleSheet, Image, TouchableOpacity, Pressable } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Animated, { FadeIn, FadeInDown, FadeInLeft, FadeInRight, FadeInUp, FadeOut, FadeOutUp } from 'react-native-reanimated';
import CourseData from '../../store/CourseData';
import { useState } from 'react';
import { ScrollView } from 'react-native-virtualized-view';
import Feather from '@expo/vector-icons/Feather';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';



const Home = () => {
  const router = useRouter()
  const filterData = CourseData.filter((item) => item.sold_course > 2500).sort((a, b) => b.sold_course - a.sold_course);
  CourseData.sort((a, b) => a.price - b.price);
  const discountData = CourseData.filter((item) => item.sold_course > 2500).sort((a, b) => a.sold_course - b.sold_course);
  CourseData.sort((a, b) => a.price - b.price);

  const VerticalScroll = ({ item }) => (
    <Pressable onPress={() => router.push(`/ViewDetails/${item.id}`)}>
      <View className='w-full h-80 p-4 border-b-2 border-[#ff8353] rounded-xl  overflow-hidden  mb-4  '>
        <BlurView intensity={10} tint="light" className='absolute right-0 top-0 left-0 bottom-0' />
        <Image source={{ uri: item.image }} className="rounded-md   mb-2 w-full h-44" />
        <View className='mt-2' >
          <Text style={styles.Btn_text} className='text-white  text-lg pt-2 border-t-2 border-spacing-y-3 border-dotted border-[#ff8353] '>{item.course_name}</Text>
          <Text style={styles.Btn_text} className='text-white  text-lg'>{item.course_code}</Text>
          <Text style={styles.Btn_text} className='text-white  text-lg'>{item.faculty}</Text>

        </View>
      </View>
    </Pressable>
  );
  const topSelling = ({ item }) => (
    <Pressable onPress={() => router.push(`/ViewDetails/${item.id}`)}>
      
      <View className='border-b-2 border-[#ff8353] w-[310px] h-60 rounded-lg overflow-hidden  mb-4 p-2 mr-4  '>
        <BlurView intensity={10} tint="light" className='absolute right-0 top-0 left-0 bottom-0' />
        <Image source={{ uri: item.image }} className="rounded-md  border-t-2 border-[#ff8353] mb-2 w-full h-36" />
        <View className='mt-2' >
          <Text style={styles.Btn_text} className='text-white pt-2  text-lg border-t-2 border-spacing-y-3 border-dotted border-[#ff8353] '>{item.course_name}</Text>
          <Text style={styles.Btn_text} className='text-white  text-lg'>{item.course_code}</Text>
          <Text style={styles.Btn_text} className='text-white  text-lg'>{item.faculty}</Text>

        </View>
        
      </View>
    </Pressable>
  );
  const discount = ({ item }) => (
    <Pressable onPress={() => router.push(`/ViewDetails/${item.id}`)}>
      
      <View className='border-b-2 border-[#ff8353] w-[310px] h-60 rounded-lg overflow-hidden  mb-4 p-2 mr-4  '>
        <BlurView intensity={10} tint="light" className='absolute right-0 top-0 left-0 bottom-0' />
        <Image source={{ uri: item.image }} className="rounded-md  border-t-2 border-[#ff8353] mb-2 w-full h-36" />
        <View className='mt-2' >
          <Text style={styles.Btn_text} className='text-white pt-2  text-lg border-t-2 border-spacing-y-3 border-dotted border-[#ff8353] '>{item.course_name}</Text>
          <Text style={styles.Btn_text} className='text-white  text-lg'>{item.course_code}</Text>
          <Text style={styles.Btn_text} className='text-white  text-lg'>{item.faculty}</Text>

        </View>
        
      </View>
    </Pressable>
  );
  return (
    <SafeAreaView contentContainerStyle={{ height: '100%', }} >
      <LinearGradient className='bg-[#151527] px-3 ' colors={['#151527','#0e1636', '#ff8353','#000000','transparent']} start={{ x: 0.8, y: 0.2 }} end={{ x: 1.9, y: 0.6 }} >
        <StatusBar style={"dark-content"} className='bg-[#151527]'></StatusBar>
        <View className='felx flex-row justify-between items-center my-3 border-b-2 border-[#ff8353] pb-2'>
          <Text style={styles.Home_text} className=''>UNISOL</Text>
          <View className='felx flex-row justify-center items-center gap-3 '>
            <TouchableOpacity onPress={() => router.push("Search")}>
              <Feather name="search" size={24} color="#ff8353" />
            </TouchableOpacity>
            <TouchableOpacity>
              <Ionicons name="notifications" size={24} color="#ff8353" />
            </TouchableOpacity>
          </View>
        </View>
        <ScrollView>
          <View>
            <Text style={styles.Btn_text} className=' text-3xl  my-5 text-center  text-white  '>Top Selling courses.....</Text>
          </View>
          <FlatList className='mb-5'
            horizontal={true}
            data={filterData}
            renderItem={topSelling}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
          />
          <View>
            <Text style={styles.Btn_text} className=' text-3xl  mb-5 text-center  text-white  '>Discount Ongoing....</Text>
          </View>
          <FlatList className='mb-5'
            horizontal={true}
            data={discountData}
            renderItem={discount}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
          />
          <Text style={styles.Btn_text} className=' text-3xl  mb-5 text-center  text-white '>
            Browse our courses....
          </Text>
          <FlatList className='mb-20'
            data={CourseData}
            renderItem={VerticalScroll}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
          />
        </ScrollView>
      </LinearGradient>

    </SafeAreaView >
  )
}
const styles = StyleSheet.create({
  Home_text: {
    fontSize: 30,
    fontFamily: 'Cinzel-Medium',
    padding: 2,
    color: "#ff8353",

  },
  Btn_text: {
    fontFamily: 'JosefinSans-SemiBold',
  }
});
export default Home;