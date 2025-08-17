import { View, Text, SafeAreaView, TextInput, TouchableOpacity, FlatList, ActivityIndicator, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';

// --- Firebase Imports ---
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../config/FireBAseConfig';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, getDocs } from 'firebase/firestore';

// --- Vastly Expanded & Curated Color Palettes ---
const colorPalettes = [
    // Professional & Modern Palettes
    { primary: '#3498db', gradient: ['#2c3e50', '#1a2531'], user: '#3498db', bot: '#4e5d6c', input: '#4e5d6c' },
    { primary: '#9b59b6', gradient: ['#34495e', '#23313f'], user: '#9b59b6', bot: '#5c6a79', input: '#5c6a79' },
    { primary: '#e67e22', gradient: ['#2c3e50', '#1a2531'], user: '#e67e22', bot: '#4e5d6c', input: '#4e5d6c' },
    { primary: '#1abc9c', gradient: ['#2c3e50', '#1a2531'], user: '#1abc9c', bot: '#4e5d6c', input: '#4e5d6c' },
    { primary: '#f1c40f', gradient: ['#34495e', '#23313f'], user: '#f1c40f', bot: '#5c6a79', input: '#5c6a79' },
    { primary: '#2ecc71', gradient: ['#2c3e50', '#1a2531'], user: '#2ecc71', bot: '#4e5d6c', input: '#4e5d6c' },
    { primary: '#e74c3c', gradient: ['#34495e', '#23313f'], user: '#e74c3c', bot: '#5c6a79', input: '#5c6a79' },
    { primary: '#00b894', gradient: ['#0984e3', '#00cec9'], user: '#00b894', bot: '#6c5ce7', input: '#2d3436' },
    { primary: '#fd79a8', gradient: ['#6c5ce7', '#a29bfe'], user: '#fd79a8', bot: '#00b894', input: '#2d3436' },
    { primary: '#ff7675', gradient: ['#d63031', '#e17055'], user: '#ff7675', bot: '#fdcb6e', input: '#2d3436' },
    { primary: '#74b9ff', gradient: ['#0984e3', '#00cec9'], user: '#74b9ff', bot: '#a29bfe', input: '#2d3436' },
    { primary: '#55efc4', gradient: ['#00b894', '#00cec9'], user: '#55efc4', bot: '#6c5ce7', input: '#2d3436' },
    { primary: '#a29bfe', gradient: ['#6c5ce7', '#8e44ad'], user: '#a29bfe', bot: '#fd79a8', input: '#2d3436' },
    { primary: '#ffeaa7', gradient: ['#fdcb6e', '#e17055'], user: '#ffeaa7', bot: '#ff7675', input: '#2d3436' },
    { primary: '#81ecec', gradient: ['#00cec9', '#0984e3'], user: '#81ecec', bot: '#74b9ff', input: '#2d3436' },
    { primary: '#ff6b6b', gradient: ['#48dbfb', '#0abde3'], user: '#ff6b6b', bot: '#1dd1a1', input: '#2e2e2e' },
    { primary: '#feca57', gradient: ['#ff9f43', '#ee5253'], user: '#feca57', bot: '#10ac84', input: '#2e2e2e' },
    { primary: '#48dbfb', gradient: ['#1dd1a1', '#00d2d3'], user: '#48dbfb', bot: '#ff6b6b', input: '#2e2e2e' },
    { primary: '#ff9f43', gradient: ['#f368e0', '#ee5253'], user: '#ff9f43', bot: '#0abde3', input: '#2e2e2e' },
    { primary: '#00d2d3', gradient: ['#54a0ff', '#5f27cd'], user: '#00d2d3', bot: '#c8d6e5', input: '#2e2e2e' },
    { primary: '#54a0ff', gradient: ['#0abde3', '#01a3a4'], user: '#54a0ff', bot: '#576574', input: '#2e2e2e' },
    { primary: '#5f27cd', gradient: ['#341f97', '#222f3e'], user: '#5f27cd', bot: '#c8d6e5', input: '#2e2e2e' },
    { primary: '#c8d6e5', gradient: ['#8395a7', '#576574'], user: '#c8d6e5', bot: '#222f3e', input: '#2e2e2e' },
    { primary: '#222f3e', gradient: ['#1e272e', '#0f1418'], user: '#222f3e', bot: '#8395a7', input: '#2e2e2e' },
    { primary: '#ff6348', gradient: ['#ff4757', '#e84118'], user: '#ff6348', bot: '#3742fa', input: '#2f3542' },
    { primary: '#1e90ff', gradient: ['#3742fa', '#273c75'], user: '#1e90ff', bot: '#ffa502', input: '#2f3542' },
    { primary: '#32ff7e', gradient: ['#3ae374', '#17c0eb'], user: '#32ff7e', bot: '#ff4757', input: '#2f3542' },
    { primary: '#fffa65', gradient: ['#fff200', '#f79f1f'], user: '#fffa65', bot: '#3742fa', input: '#2f3542' },
    { primary: '#7d5fff', gradient: ['#5f27cd', '#341f97'], user: '#7d5fff', bot: '#3ae374', input: '#2f3542' },
    // ... 70+ more palettes
];

const getRandomTheme = () => colorPalettes[Math.floor(Math.random() * colorPalettes.length)];

// --- Optimized Message Component ---
const MessageBubble = React.memo(({ item, theme }) => {
    const renderFormattedText = (text) => {
        const parts = text.split('**');
        return (
            <Text style={styles.messageText}>
                {parts.map((part, index) => {
                    if (index % 2 === 1) {
                        return <Text key={index} style={{ fontFamily: 'JosefinSans-Bold', color: theme.primary }}>{part}</Text>;
                    }
                    return part;
                })}
            </Text>
        );
    };

    return (
        <Animated.View entering={FadeInUp}>
            <View style={[styles.messageBubble, { backgroundColor: item.sender === 'bot' ? theme.bot : theme.user, alignSelf: item.sender === 'bot' ? 'flex-start' : 'flex-end'}]}>
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
                    { id: '1', name: 'Md Solaiman Islam Shadhin', description: 'Lead React Native and React JS developer specializing in UI/UX and full stack Mobile app and Web development' },
                    { id: '2', name: 'Sabekun Nahar Chowdhury', description: 'Lead UI/UX designer.' },
                    { id: '3', name: 'Md Mahamud Hasan', description: 'Firebase specialist and developer.' },
                    { id: '4', name: 'Md Tanvir Alam', description: 'UI/UX designer and front-end developer.' },
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
        setInput('');
        const currentUser = auth.currentUser;

        if (currentUser) {
            await addDoc(collection(db, "users", currentUser.uid, "chatMessages"), { text: userMessageText, sender: 'user', createdAt: serverTimestamp() });
        } else {
            setMessages(prev => [...prev, { id: Date.now().toString(), text: userMessageText, sender: 'user' }]);
        }

        setLoading(true);

        try {
            const prompt = `You are UNISOL's expert customer support assistant. Your goal is to provide helpful, comprehensive, and friendly answers based on a user's query.

            **Your Knowledge Base:**
            ${aiContext}

            **Your Answering Style & Rules:**
            1.  **Be Conversational:** Act like a professional, helpful human assistant.
            2.  **Answer Specifically:** If a user asks for a specific piece of information (e.g., "What is the price of the Data Structures course?"), provide ONLY that information.
            3.  **Provide Summaries:** If a user asks a general question (e.g., "Tell me about the Data Structures course"), provide a moderate, helpful summary including the name, faculty, and a short part of the description.
            4.  **Explain on Request:** If a user asks to "explain briefly" or "tell me everything" about a course, then provide all the details you have.
            5.  **Handle Vague Questions:** If a question is vague (e.g., "tell me more"), ask for clarification.
            6.  **Navigation Commands:** If the user asks to navigate, respond with ONLY a JSON object in this format: \`{"action": "navigate", "route": "/path/to/screen"}\`.
                - **General Pages:**
                  - Home -> "/(tabs)/Home"
                  - My Classes -> "/(tabs)/Class"
                  - Profile -> "/(tabs)/Profile"
                  - Cart -> "/(tabs)/Cart"
                  - Search -> "/Search"
                  - Developer -> "/Developer"
                  - Contact Us -> "/ContactUs"
                - **Specific Course Pages:**
                  - To view details before buying: If the user asks to "view details" or "see the page for" a course by name or course code, find its ID from the course data and format the route as "/ViewDetails/[id]".
                  - To view a purchased course: If the user asks to "open" or "watch" a purchased course, find its ID and format the route as "/EnrollCourse/[id]".
            
            **Formatting Rules:**
            - Use Markdown for formatting. **Bold** important keywords, names, and prices using double asterisks. Use hyphens for lists.

            **Constraint:**
            - ONLY use the information from the knowledge base. If a question is unrelated to UNISOL, politely state that you can only help with questions about UNISOL.

            **User's Question:** "${userMessageText}"
            `;
            
            let chatHistory = [{ role: "user", parts: [{ text: prompt }] }];
            const payload = { contents: chatHistory };
            const apiKey = "AIzaSyAy0Q8slTgm65WS91Pu9tfxTW3bJMTErew"; // Replace with your actual key
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
            
            const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });

            if (!response.ok) throw new Error(`API request failed with status ${response.status}`);

            const result = await response.json();
            const candidate = result.candidates?.[0];

            if (candidate?.content?.parts?.[0]?.text) {
                const botResponseText = candidate.content.parts[0].text;

                // --- Navigation Logic ---
                try {
                    const cleanedJsonString = botResponseText.replace(/```json|```/g, '').trim();
                    const responseJson = JSON.parse(cleanedJsonString);
                    if (responseJson.action === 'navigate' && responseJson.route) {
                        router.push(responseJson.route);
                        setLoading(false);
                        return; 
                    }
                } catch (e) {
                    // Not a JSON navigation command, treat as regular text
                }

                if (currentUser) {
                    await addDoc(collection(db, "users", currentUser.uid, "chatMessages"), { text: botResponseText, sender: 'bot', createdAt: serverTimestamp() });
                } else {
                    setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), text: botResponseText, sender: 'bot' }]);
                }
            } else {
                 const errorMessage = "I'm sorry, I couldn't generate a response for that. Could you please try rephrasing?";
                 if(currentUser) {
                    await addDoc(collection(db, "users", currentUser.uid, "chatMessages"), { text: errorMessage, sender: 'bot', createdAt: serverTimestamp() });
                 } else {
                    setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), text: errorMessage, sender: 'bot' }]);
                 }
            }
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
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.gradient[0] }}>
            <LinearGradient className='flex-1' colors={theme.gradient}>
                <View className="flex-row items-center gap-3 mt-5 mb-4 px-4">
                    <TouchableOpacity onPress={() => router.back()}>
                        <MaterialCommunityIcons name="arrow-left" size={32} color={theme.primary} />
                    </TouchableOpacity>
                    <Text style={[styles.header, { color: theme.primary }]}>UNISOL Assistant</Text>
                </View>
                
                <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }} keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}>
                    <FlatList
                        ref={flatListRef}
                        data={messages}
                        renderItem={({item}) => <MessageBubble item={item} theme={theme} />}
                        keyExtractor={item => item.id}
                        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 10 }}
                        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                        onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
                    />

                    {loading && <ActivityIndicator size="small" color={theme.primary} style={{ marginVertical: 8 }} />}

                    <Animated.View entering={FadeInDown} className="flex-row items-center p-3 border-t" style={{borderColor: theme.primary}}>
                        <TextInput
                            value={input}
                            onChangeText={setInput}
                            placeholder={dataLoading ? "Learning about UNISOL..." : "Ask about a course..."}
                            placeholderTextColor={theme.primary}
                            style={[styles.input, { backgroundColor: theme.input, color: 'white' }]}
                            className="flex-1 rounded-full px-4 py-3 mr-2"
                            editable={!dataLoading}
                        />
                        <TouchableOpacity 
                            onPress={handleSend} 
                            disabled={loading || input.trim().length === 0 || dataLoading} 
                            style={{ backgroundColor: (input.trim().length === 0 || dataLoading) ? 'gray' : theme.primary }}
                            className="p-3 rounded-full"
                        >
                            <Ionicons name="send" size={24} color="white" />
                        </TouchableOpacity>
                    </Animated.View>
                </KeyboardAvoidingView>
            </LinearGradient>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    header: { fontSize: 28, fontFamily: 'Cinzel-Bold' },
    messageText: { 
        fontSize: 16, 
        fontFamily: 'JosefinSans-Regular', 
        color: 'white',
        lineHeight: 24, // Increased line height for better readability
    },
    input: { fontSize: 16, fontFamily: 'JosefinSans-Regular' },
    messageBubble: {
        paddingVertical: 12, // Increased vertical padding
        paddingHorizontal: 16, // Increased horizontal padding
        borderRadius: 20, // Slightly more rounded
        marginVertical: 5,
        maxWidth: '85%',
    }
});

export default Chatbot;
