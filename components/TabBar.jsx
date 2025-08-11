import { View, Text, Pressable, StyleSheet } from 'react-native'
import React from 'react'
import { PlatformPressable } from '@react-navigation/elements';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import Ionicons from '@expo/vector-icons/Ionicons';
import Entypo from '@expo/vector-icons/Entypo';


export default function TabBar({ state, descriptors, navigation }) {
const icons ={
    Home : (props)=><FontAwesome5 name="home" size={20} color="#a6a7aa" {...props} />,
    Class : (props)=><Entypo name="folder-video" size={20} color="#a6a7aa" {...props}/>,
    Cart : (props)=><Ionicons name="cart" size={20} color="#a6a7aa" {...props} />,
    Profile: (props)=><Ionicons name="person-sharp" size={20}color="#a6a7aa" {...props} />
}

    return (
        <View  className="bg-[#151527] flex-row mb-2 absolute -bottom-0  justify-center items-center px-1 py-3  mx-5 rounded-full  ">
            {state.routes.map((route, index) => {
                const { options } = descriptors[route.key];
                const label =
                    options.tabBarLabel !== undefined
                        ? options.tabBarLabel
                        : options.title !== undefined
                            ? options.title
                            : route.name;

                const isFocused = state.index === index;

                const onPress = () => {
                    const event = navigation.emit({
                        type: 'tabPress',
                        target: route.key,
                        canPreventDefault: true,
                    });

                    if (!isFocused && !event.defaultPrevented) {
                        navigation.navigate(route.name, route.params);
                    }
                };

                const onLongPress = () => {
                    navigation.emit({
                        type: 'tabLongPress',
                        target: route.key,
                    });
                };

                return (
                    <Pressable

                        accessibilityState={isFocused ? { selected: true } : {}}
                        accessibilityLabel={options.tabBarAccessibilityLabel}
                        testID={options.tabBarButtonTestID}
                        onPress={onPress}
                        style={{ flex: 1 }}
                        className="justify-center items-center "
                    >
                        {
                            icons[route.name]({
                                color: isFocused ? "#ff8353" : "#a6a7aa"
                            })
                        }
                        <Text style={{ color: isFocused ? "#ff8353" : "#a6a7aa",fontSize:12,fontFamily:'JosefinSans-SemiBold'}}>
                            {label}
                        </Text>
                    </Pressable>
                );
            })}
        </View>
    )
}