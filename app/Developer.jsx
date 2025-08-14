import { View, Text, SafeAreaView, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import React from 'react';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Animated, { FadeInUp } from 'react-native-reanimated';

// --- Developer Data ---
const developers = [
    {
        id: '1',
        name: 'MD.Solaiman Islam Shadhin',
        description: 'Lead React Native and React JS developer specializing in UI/UX and full stack Mobile app and Web development',
        image: 'https://scontent-sin6-2.xx.fbcdn.net/v/t39.30808-6/491932379_2144108269387914_8599008879674339284_n.jpg?_nc_cat=109&ccb=1-7&_nc_sid=a5f93a&_nc_eui2=AeHlIJdXTkU1M70uY0mMwv9vLkPMDAqo2WwuQ8wMCqjZbJbSWEwzHX7bX5tVTbv-W8BmbwHpps4jxHfkP_nQMle_&_nc_ohc=ajGhvBXsoaMQ7kNvwHk5Jfy&_nc_oc=AdmV-72yH17yF_Tf5D-8nvVCwOK_PATYQcXAhdpk4w2INCAG8f1-kKpJ4_a519Ora4DzkNgBhDRBtB69O6Mi_GYL&_nc_zt=23&_nc_ht=scontent-sin6-2.xx&_nc_gid=cmfyIJhy-m9gt9mPE5aAyA&oh=00_AfU6bxsDSoVPIm9UZH6mQuYFk1UqEk_BYYdRMCIOAz2QLA&oe=68A3B9E2',
    },
    {
        id: '2',
        name: 'Sabekun Nahar Chouwdhury',
        description: 'UI/UX designer who translates complex requirements into beautiful, functional app interfaces.',
        image: 'https://tse1.mm.bing.net/th/id/OIP.9t7htXFPzrmIc-dsCkNzhwHaD5?rs=1&pid=ImgDetMain&o=7&rm=3',
    },
    {
        id: '3',
        name: 'Mehedi Hasan Parvez',
        description: 'Firebase specialist and developer with a passion for creating robust APIs and ensuring seamless data flow between the app and server.',
        image: 'https://media-sin11-1.cdn.whatsapp.net/v/t61.24694-24/363035589_6401489473294078_4682999899759549692_n.jpg?ccb=11-4&oh=01_Q5Aa2QGScx7e-D9myD0soOkmx5h5bY43I5UHXyc1JHYkJoGSMg&oe=68AB0FA4&_nc_sid=5e03e0&_nc_cat=104',
    },
    {
        id: '4',
        name: 'MD.Tanvir Alam',
        description: 'UI/UX designer and front-end developer who translates complex requirements into beautiful, functional app interfaces.',
        image: 'https://media-sin2-1.cdn.whatsapp.net/v/t61.24694-24/315763494_545296157028687_2937590678254268355_n.jpg?ccb=11-4&oh=01_Q5Aa2QFHmT5Lau05ta3V4t3Zgx5ASKX0Hc2bGdFEBTNReFF4PA&oe=68AB1DBD&_nc_sid=5e03e0&_nc_cat=100',
    },
];

export default function Developer() {
    const router = useRouter();

    return (
        <SafeAreaView className="flex-1">
            <LinearGradient className='flex-1 px-4' colors={['#151527', '#0e1636', '#ff8353']} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }}>
                <View className="flex-row items-center gap-3 mt-5 mb-6">
                    <TouchableOpacity className='relative top-1' onPress={() => router.back()}>
                        <MaterialCommunityIcons name="backburger" size={32} color="#ff8353" />
                    </TouchableOpacity>
                    <Text style={styles.header} className="text-[#ff8353]">Our Team</Text>
                </View>

                <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
                    {developers.map((dev, index) => (
                        <Animated.View key={dev.id} entering={FadeInUp.delay(index * 150).duration(600).springify()}>
                            <View className="w-full bg-white/10 rounded-xl border border-white/20 p-4 mb-6 flex-row items-center">
                                <Image
                                    source={{ uri: dev.image }}
                                    className="w-24 h-24 rounded-full border-2 border-[#ff8353]"
                                />
                                <View className="flex-1 ml-4">
                                    <Text style={styles.name} className="text-white">{dev.name}</Text>
                                    <Text style={styles.description} className="text-white/80 mt-1">{dev.description}</Text>
                                </View>
                            </View>
                        </Animated.View>
                    ))}
                </ScrollView>
            </LinearGradient>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    header: {
        fontSize: 32,
        fontFamily: 'Cinzel-Bold',
    },
    name: {
        fontSize: 22,
        fontFamily: 'JosefinSans-Bold',
    },
    description: {
        fontSize: 14,
        fontFamily: 'JosefinSans-Regular',
        textAlign: 'justify',
    },
});
