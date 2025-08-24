
import { Tabs } from 'expo-router'
import TabBar from '../../components/TabBar';

const _layout = () => {
    return (
        <Tabs tabBar={props =><TabBar {...props}/>} screenOptions={{
            headerShown: false
            
          
        }}>
            <Tabs.Screen name="Home" options={{ unmountOnBlur: false }} />
            <Tabs.Screen name="Class" options={{ unmountOnBlur: false }} />
            <Tabs.Screen name="Cart" options={{ unmountOnBlur: false }} />
            <Tabs.Screen name="Profile" ooptions={{ unmountOnBlur: false }} />

        </Tabs>

    )
}

export default _layout