
import { Tabs } from 'expo-router'
import TabBar from '../../components/TabBar';

const _layout = () => {
    return (
        <Tabs tabBar={props =><TabBar {...props}/>} screenOptions={{
            headerShown: false
            
          
        }}>
            <Tabs.Screen name="Home" options={{
                title: "Home",
            }} />
            <Tabs.Screen name="Class" options={{
                title: "My-Classes", 
            }} />
            <Tabs.Screen name="Cart" options={{
                title: "Cart",
            }} />

            <Tabs.Screen name="Profile" options={{
                title: "Profile", 
            }} />

        </Tabs>

    )
}

export default _layout