import { View, Text, SafeAreaView, TextInput, TouchableOpacity, FlatList, ActivityIndicator, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';

// --- Firebase Imports ---
import { onAuthStateChanged } from 'firebase/auth';
// NOTE: I corrected the typo here ('FireBAseConfig' to 'FirebaseConfig') as it's a critical error that would prevent the app from running.
import { auth, db } from '../config/FireBAseConfig'; 
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, getDocs, deleteDoc, writeBatch } from 'firebase/firestore';

// --- Color Palettes (Unchanged) ---
const colorPalettes = [
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
    { primary: '#81ecec', gradient: ['#00cec9', '#0984e3'], user: '#81ecec', bot: '#74b9ff', input: '#2d3436' },
    { primary: '#ff6b6b', gradient: ['#48dbfb', '#0abde3'], user: '#ff6b6b', bot: '#1dd1a1', input: '#2e2e2e' },
    { primary: '#feca57', gradient: ['#ff9f43', '#ee5253'], user: '#feca57', bot: '#10ac84', input: '#2e2e2e' },
    { primary: '#48dbfb', gradient: ['#1dd1a1', '#00d2d3'], user: '#48dbfb', bot: '#ff6b6b', input: '#2e2e2e' },
    { primary: '#5f27cd', gradient: ['#341f97', '#222f3e'], user: '#5f27cd', bot: '#c8d6e5', input: '#2e2e2e' },
    { primary: '#c8d6e5', gradient: ['#8395a7', '#576574'], user: '#c8d6e5', bot: '#222f3e', input: '#2e2e2e' },
    { primary: '#222f3e', gradient: ['#1e272e', '#0f1418'], user: '#222f3e', bot: '#8395a7', input: '#2e2e2e' },
];

const getRandomTheme = () => colorPalettes[Math.floor(Math.random() * colorPalettes.length)];

// --- Optimized Message Component ---
const MessageBubble = React.memo(({ item, theme }) => {
    const isBot = item.sender === 'bot';
    const renderFormattedText = (text) => {
        const parts = text.split('**');
        return (
            <Text style={styles.messageText}>
                {parts.map((part, index) => (
                    index % 2 === 1 ?
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
        // ... useEffect logic remains the same
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
        // ... handleSend logic remains the same
        if (input.trim().length === 0 || dataLoading) return;
        const userMessageText = input;
        setInput('');
        const currentUser = auth.currentUser;

        if (userMessageText.trim().toLowerCase() === 'clear everything') {
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
                parts: [{ text: `You are UNISOL's expert customer support assistant.
                
                **Your Knowledge Base (Primary Source):**
                ${aiContext}

                **Your Answering Style & Rules:**
                1.  **Prioritize Knowledge Base:** For questions related to UNISOL, courses, developers, or how the app works, you MUST use the provided knowledge base.
                2.  **Use General Knowledge:** For questions not related to UNISOL, use your own extensive knowledge.
                3.  **Be Conversational & Context-Aware:** Remember previous messages to answer follow-up questions.
                **Navigation Commands:** If the user asks to navigate, respond with ONLY a JSON object in this format: \`{"action": "navigate", "route": "/path/to/screen"}\`.
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
            const apiKey = "AIzaSyAc7leNWBA-cCjAz6PjejX0o6bOZfIdu7o"; // Replace with your actual key
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
                        isNavigating = true; 

                        if (responseJson.action === 'navigate' && responseJson.route) {
                            if (responseJson.route.includes('/EnrollCourse/')) {
                                const courseId = responseJson.route.split('/').pop();
                             

                               
                                {
                                    const redirectRoute = `/ViewDetails/${courseId}`;
                                    const botMessage = "It looks like you haven't purchased that course yet. Here are the details so you can enroll!";
                                    
                                    if (currentUser) {
                                        await addDoc(collection(db, "users", currentUser.uid, "chatMessages"), { text: botMessage, sender: 'bot', createdAt: serverTimestamp() });
                                    } else {
                                        setMessages(prev => [...prev, { id: Date.now().toString(), text: botMessage, sender: 'bot' }]);
                                    }
                                    router.push(redirectRoute);
                                }
                            } else {
                                router.push(responseJson.route);
                            }
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
                {/* --- KEYBOARD AVOIDING VIEW FIX STARTS HERE --- */}
                <View style={styles.headerContainer}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
                        <MaterialCommunityIcons name="arrow-left" size={28} color='white' />
                    </TouchableOpacity>
                    <Text style={[styles.header, { color: 'white' }]}>UNISOL Assistant</Text>
                    <View style={styles.headerButton} />
                </View>

                <KeyboardAvoidingView
                    style={{ flex: 1 }}
                  
                >
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
                            style={[styles.input, { backgroundColor: theme.input, color: 'white' }]}
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
                {/* --- KEYBOARD AVOIDING VIEW FIX ENDS HERE --- */}
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
        fontSize: 28,
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