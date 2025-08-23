import { View, Text, TextInput, TouchableOpacity, FlatList, ActivityIndicator, StyleSheet, KeyboardAvoidingView, Platform, BackHandler } from 'react-native';
import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
// --- Firebase Imports ---
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../config/FireBAseConfig';
import { ApiKey } from '../config/ApiKey'
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, getDocs, deleteDoc, writeBatch } from 'firebase/firestore';

// --- Color Palettes ---
const colorPalettes = [
    // --- High-Contrast Dark Themes ---
    { primary: '#33C5FF', gradient: ['#1D2B34', '#10181D'], user: '#2A3C44', bot: '#3C525A', input: '#2A3C44', text: '#FFFFFF' },
    { primary: '#7BFFAF', gradient: ['#1A1D21', '#0F1012'], user: '#2C3531', bot: '#424F4A', input: '#2C3531', text: '#FFFFFF' },
    { primary: '#FFD479', gradient: ['#2B2118', '#1C150F'], user: '#423425', bot: '#5A4A35', input: '#423425', text: '#FFFFFF' },
    { primary: '#FF8A8A', gradient: ['#2A1D22', '#1B1216'], user: '#452D35', bot: '#5F424A', input: '#452D35', text: '#FFFFFF' },
    { primary: '#C299FF', gradient: ['#221F33', '#151320'], user: '#36304F', bot: '#4D466D', input: '#36304F', text: '#FFFFFF' },
    { primary: '#4ECCA3', gradient: ['#232931', '#1A1F24'], user: '#393E46', bot: '#4E5663', input: '#393E46', text: '#FFFFFF' },
    { primary: '#FFC0CB', gradient: ['#31112C', '#1E0A1B'], user: '#512D4A', bot: '#704264', input: '#512D4A', text: '#FFFFFF' },
    { primary: '#FF9F45', gradient: ['#2E232F', '#1C161D'], user: '#4A3A4C', bot: '#675269', input: '#4A3A4C', text: '#FFFFFF' },
    { primary: '#45A29E', gradient: ['#0B0C10', '#0B0C10'], user: '#1F2833', bot: '#2C3A47', input: '#1F2833', text: '#FFFFFF' },
    { primary: '#F2F2F2', gradient: ['#0D0D0D', '#0D0D0D'], user: '#242424', bot: '#3D3D3D', input: '#242424', text: '#FFFFFF' },

    // --- High-Contrast Light Themes ---
    { primary: '#0052D4', gradient: ['#F5F7FA', '#E8EEF2'], user: '#FFFFFF', bot: '#E8EEF2', input: '#FFFFFF', text: '#1A1A1A' },
    { primary: '#D42E7A', gradient: ['#FCEFF6', '#F8E7F0'], user: '#FFFFFF', bot: '#FCEFF6', input: '#FFFFFF', text: '#1A1A1A' },
    { primary: '#1B8A5A', gradient: ['#EFF8F3', '#E6F2EB'], user: '#FFFFFF', bot: '#EFF8F3', input: '#FFFFFF', text: '#1A1A1A' },
    { primary: '#7B4BFF', gradient: ['#F2F0FC', '#E9E6F9'], user: '#FFFFFF', bot: '#F2F0FC', input: '#FFFFFF', text: '#1A1A1A' },
    { primary: '#C44E00', gradient: ['#FFF4EC', '#FCEFE2'], user: '#FFFFFF', bot: '#FFF4EC', input: '#FFFFFF', text: '#1A1A1A' },
    { primary: '#006D77', gradient: ['#E0FEFF', '#D2FAFB'], user: '#FFFFFF', bot: '#E0FEFF', input: '#FFFFFF', text: '#1A1A1A' },
    { primary: '#D90429', gradient: ['#FCECEC', '#F9E3E3'], user: '#FFFFFF', bot: '#FCECEC', input: '#FFFFFF', text: '#1A1A1A' },
    { primary: '#540B0E', gradient: ['#F9EAEA', '#F2DDDD'], user: '#FFFFFF', bot: '#F9EAEA', input: '#FFFFFF', text: '#1A1A1A' },
    { primary: '#036666', gradient: ['#E6F5F5', '#DDF0F0'], user: '#FFFFFF', bot: '#E6F5F5', input: '#FFFFFF', text: '#1A1A1A' },
    { primary: '#386641', gradient: ['#F2FAF4', '#E9F5EB'], user: '#FFFFFF', bot: '#F2FAF4', input: '#FFFFFF', text: '#1A1A1A' },
];

const getRandomTheme = () => colorPalettes[Math.floor(Math.random() * colorPalettes.length)];

// --- Optimized Message Component ---
const MessageBubble = React.memo(({ item, theme }) => {
    const isBot = item.sender === 'bot';
    // Use the new theme.text property for the text color, defaulting to white.
    const textColor = theme.text || '#FFFFFF';

    const renderFormattedText = (text) => {
        const parts = text.split('**');
        return (
            // Apply the dynamic text color here
            <Text style={[styles.messageText, { color: textColor }]}>
                {parts.map((part, index) => (
                    index % 2 === 1 ?
                        // The primary color is now only for bolded highlights
                        <Text key={index} style={{ fontFamily: 'JosefinSans-Bold', color: theme.primary }}>{part}</Text> :
                        part
                ))}
            </Text>
        );
    };

    return (
        <Animated.View entering={FadeInUp}>
            <View style={[
                styles.messageBubble,
                isBot ? styles.botBubble : styles.userBubble,
                { backgroundColor: isBot ? theme.bot : theme.user }
            ]}>
                {renderFormattedText(item.text)}
            </View>
        </Animated.View>
    );
});

const Chatbot = () => {
    const router = useRouter();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [aiContext, setAiContext] = useState('');
    const [dataLoading, setDataLoading] = useState(true);
    const [theme, setTheme] = useState(getRandomTheme());
    const flatListRef = useRef();

    useEffect(() => {
        setTheme(getRandomTheme());
        const fetchDataForAI = async () => {
            try {
                const coursesCollectionRef = collection(db, "CourseData");
                const coursesSnapshot = await getDocs(coursesCollectionRef);
                const coursesList = coursesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

                const developerData = [
                    {
                        id: '1',
                        name: 'Md Solaiman Islam Shadhin',
                        description: 'Lead React Native and React JS developer specializing in UI/UX and full stack Mobile app and Web development. A passionate and hardworking student of Computer Science and Engineering at Southeast University, Bangladesh, he is the chief architect behind the UNISOL app\'s seamless user experience and robust functionality.'
                    },
                    {
                        id: '2',
                        name: 'Sabekun Nahar Chowdhury',
                        description: 'Lead UI/UX designer. A creative and dedicated student of Computer Science and Engineering at Southeast University, Bangladesh, she is the mind behind UNISOL\'s intuitive and visually appealing interface, focusing on user-centric design principles.'
                    },
                    {
                        id: '3',
                        name: 'Md Mahamud Hasan',
                        description: 'Firebase specialist and developer. As a hardworking student of Computer Science and Engineering at Southeast University, Bangladesh, he ensures the app\'s data is secure, fast, and reliable by managing the entire backend infrastructure on Firebase.'
                    },
                    {
                        id: '4',
                        name: 'Md Tanvir Alam',
                        description: 'UI/UX designer and front-end developer. A passionate student of Computer Science and Engineering at Southeast University, Bangladesh, he works closely with the team to translate creative visions into functional and beautiful user interfaces.'
                    },
                ];
                const appInfoContext = `UNISOL is an educational app. Contact Information: Phone - 01882808626, Facebook - www.facebook.com/sis8952/.`;
                const appFlowContext = `How the app works: Users browse courses on the Home page. To buy, they tap a course to see details, then can "Add to Cart" or "Buy Now". Payment is via Card, bKash, or Nagad. Purchased courses appear in "My Classes" for video viewing.`;
                const developerContext = JSON.stringify(developerData);
                const courseContext = JSON.stringify(coursesList);

                const fullContext = `
                    **Your Knowledge Base:**
                    - **About UNISOL & How to Contact:** ${appInfoContext}
                    - **How the App Works:** ${appFlowContext}
                    - **The Developers:** ${developerContext}
                    - **Available Courses (Full Details):** ${courseContext}
                `;
                setAiContext(fullContext);

            } catch (error) {
                console.error("Error fetching data for chatbot:", error);
            } finally {
                setDataLoading(false);
            }
        };

        fetchDataForAI();

        const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
            if (user) {
                const chatQuery = query(collection(db, "users", user.uid, "chatMessages"), orderBy("createdAt", "asc"));
                const unsubscribeFirestore = onSnapshot(chatQuery, (querySnapshot) => {
                    const history = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    if (history.length === 0) {
                        setMessages([{ id: '1', text: 'Hello! As a logged-in user, your chat history will be saved. How can I help?', sender: 'bot' }]);
                    } else {
                        setMessages(history);
                    }
                });
                return () => unsubscribeFirestore();
            } else {
                setMessages([{ id: '1', text: 'Hello! I am the UNISOL assistant. As a guest, your chat will not be saved. How can I help?', sender: 'bot' }]);
            }
        });

        return () => unsubscribeAuth();
    }, []);


    const handleSend = async () => {
        if (input.trim().length === 0 || dataLoading) return;
        const userMessageText = input;
        const command = userMessageText.trim().toLowerCase();
        setInput('');
        const currentUser = auth.currentUser;

        // --- NEW: Command to close the app ---
        if (command === 'close the app' || command === 'exit app' || command === 'quit') {
            const closingMessage = { id: Date.now().toString(), text: "Certainly. Closing the app now. Goodbye!", sender: 'bot' };
            setMessages(prev => [...prev, closingMessage]);
            // Use a short delay to allow the message to render before the app closes
            setTimeout(() => {
                BackHandler.exitApp(); // This will only work on Android
            }, 1000);
            return;
        }

        if (command === 'clear everything' || command === 'clear chat history' || command === 'clear chat') {
            const resetMessage = { id: '1', text: 'Your chat history has been cleared. How can I help you?', sender: 'bot' };
            if (currentUser) {
                setLoading(true);
                const chatMessagesRef = collection(db, "users", currentUser.uid, "chatMessages");
                const querySnapshot = await getDocs(chatMessagesRef);
                const batch = writeBatch(db);
                querySnapshot.forEach(doc => {
                    batch.delete(doc.ref);
                });
                await batch.commit();
                setMessages([resetMessage]);
                setLoading(false);
            } else {
                setMessages([resetMessage]);
            }
            return;
        }

        const newUserMessage = { id: Date.now().toString(), text: userMessageText, sender: 'user' };
        const updatedMessages = [...messages, newUserMessage];
        setMessages(updatedMessages);

        if (currentUser) {
            addDoc(collection(db, "users", currentUser.uid, "chatMessages"), { text: userMessageText, sender: 'user', createdAt: serverTimestamp() });
        }

        setLoading(true);
        try {
            const systemInstruction = {
                role: "system",
                parts: [{
                    text: `You are UNISOL's expert customer support assistant.
                
                **Your Knowledge Base (Primary Source):**
                ${aiContext}

                **Your Answering Style & Rules:**
                1.  **Prioritize Knowledge Base:** For questions related to UNISOL, courses, developers, or how the app works, you MUST use the provided knowledge base.
                2.  **Use General Knowledge:** For questions not related to UNISOL, use your own extensive knowledge.
                3.  **Be Conversational & Context-Aware:** Remember previous messages to answer follow-up questions.
                4.  **Navigation Commands:** If a navigation action is required, your ENTIRE response must be ONLY the JSON object and nothing else.
                 - **General Pages:**
                   - Home -> "/(tabs)/Home"
                   - My Classes -> "/(tabs)/Class"
                   - Profile -> "/(tabs)/Profile"
                   - Cart -> "/(tabs)/Cart"
                   - Search -> "/Search"
                   - Developer -> "/Developer"
                   - Contact Us -> "/ContactUs"
                   -Browse Courses -> "/BrowseCourses"
                   - **Specific Course Pages:**
                   - To view details before buying: format the route as "/ViewDetails/[id]".
                   - To watch or open a course: your ONLY action is to navigate them to the main class page using this exact route: \`{"action": "navigate", "route": "/(tabs)/Class"}\`.
                5.  **Formatting:** Use Markdown. **Bold** important terms.
                `}]
            };

            const conversationHistoryForAPI = updatedMessages.map(msg => ({
                role: msg.sender === 'bot' ? 'model' : 'user',
                parts: [{ text: msg.text }]
            }));

            const payload = {
                contents: conversationHistoryForAPI,
                systemInstruction: systemInstruction,
            };
            const apiKey = ApiKey;
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;

            const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            if (!response.ok) throw new Error(`API request failed with status ${response.status}`);
            const result = await response.json();
            const candidate = result.candidates?.[0];

            if (candidate?.content?.parts?.[0]?.text) {
                const botResponseText = candidate.content.parts[0].text;

                const jsonMatch = botResponseText.match(/{[\s\S]*}/);
                let isNavigating = false;

                if (jsonMatch && jsonMatch[0]) {
                    try {
                        const responseJson = JSON.parse(jsonMatch[0]);
                        if (responseJson.action === 'navigate' && responseJson.route) {
                            isNavigating = true;
                            router.push(responseJson.route);
                        }
                    } catch (e) {
                        isNavigating = false;
                    }
                }

                if (!isNavigating) {
                    if (currentUser) {
                        await addDoc(collection(db, "users", currentUser.uid, "chatMessages"), { text: botResponseText, sender: 'bot', createdAt: serverTimestamp() });
                    } else {
                        setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), text: botResponseText, sender: 'bot' }]);
                    }
                }

            } else { throw new Error("No response from API"); }
        } catch (error) {
            console.error("Gemini API error:", error);
            const errorMessageText = "Sorry, I'm having trouble connecting. Please try again later.";
            if (currentUser) {
                await addDoc(collection(db, "users", currentUser.uid, "chatMessages"), { text: errorMessageText, sender: 'bot', createdAt: serverTimestamp() });
            } else {
                setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), text: errorMessageText, sender: 'bot' }]);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <LinearGradient style={{ flex: 1 }} colors={theme.gradient}>
            <SafeAreaView style={styles.container}>
                <KeyboardAvoidingView
                    style={{ flex: 1 }}

                >
                    <View style={styles.headerContainer}>
                        <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
                            <MaterialCommunityIcons name="arrow-left" size={28} color={theme.primary} />
                        </TouchableOpacity>
                        <Text style={[styles.header, { color: theme.primary }]}>UNISOL Assistant</Text>
                        <View style={styles.headerButton} />
                    </View>

                    <View style={styles.chatContainer}>
                        <FlatList
                            ref={flatListRef}
                            data={messages}
                            renderItem={({ item }) => <MessageBubble item={item} theme={theme} />}
                            keyExtractor={item => item.id}
                            contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 20, paddingBottom: 10 }}
                            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                            onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
                        />
                        {loading && <ActivityIndicator size="small" color={theme.primary} style={{ marginVertical: 8 }} />}
                    </View>

                    <View style={[styles.inputContainer, { borderTopColor: theme.input }]}>
                        <TextInput
                            value={input}
                            onChangeText={setInput}
                            placeholder={dataLoading ? "Learning about UNISOL..." : "Ask about a course..."}
                            placeholderTextColor={theme.primary + '80'}
                            style={[styles.input, { backgroundColor: theme.input, color: theme.text }]}
                            editable={!dataLoading}
                        />
                        <TouchableOpacity
                            onPress={handleSend}
                            disabled={loading || input.trim().length === 0 || dataLoading}
                            style={[styles.sendButton, { backgroundColor: (input.trim().length === 0 || dataLoading) ? 'gray' : theme.primary }]}
                        >
                            <Ionicons name="send" size={22} color="white" />
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        paddingTop: 15,
        paddingBottom: 10,
    },
    headerButton: {
        width: 40,
    },
    header: {
        fontSize: 24,
        fontFamily: 'Cinzel-Bold',
    },
    chatContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.2)',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        overflow: 'hidden',
    },
    messageText: {
        fontSize: 16,
        fontFamily: 'JosefinSans-Regular',
        color: 'white',
        lineHeight: 24,
    },
    messageBubble: {
        paddingVertical: 12,
        paddingHorizontal: 18,
        marginVertical: 5,
        maxWidth: '85%',
    },
    userBubble: {
        alignSelf: 'flex-end',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 5,
    },
    botBubble: {
        alignSelf: 'flex-start',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        borderBottomRightRadius: 20,
        borderBottomLeftRadius: 5,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderTopWidth: 1,
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    input: {
        flex: 1,
        borderRadius: 25,
        paddingHorizontal: 18,
        paddingVertical: 12,
        fontSize: 16,
        fontFamily: 'JosefinSans-Regular',
        marginRight: 8,
    },
    sendButton: {
        padding: 12,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
    }
});

export default Chatbot;