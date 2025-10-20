import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import OpenAI from "openai";


const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: "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",
    dangerouslyAllowBrowser: true,
});



const AIChatBuddy = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Array<{ role: "user" | "ai"; content: string }>>([
        {
            role: "ai",
            content: "Hi! I'm your AI Study Buddy! 🤖 I can help you with:\n\n• Explaining concepts\n• Study tips\n• Motivation\n• Answering questions\n\nWhat can I help you with today?",
        },
    ]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage = input;
        setInput("");
        setMessages(prev => [...prev, { role: "user", content: userMessage }]);
        setIsTyping(true);

        // Here you would integrate with actual AI API
        // For now, we'll show instructions on how to integrate

        // inside handleSend, after setIsTyping(true) and after you push the user message
        try {
            const openrouterKey = "YOUR_OPENROUTER_KEY_HERE"; // <-- paste your key here (local only)
            const resp = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${openrouterKey}`,
                    // Optional headers OpenRouter sometimes suggests:
                    // "HTTP-Referer": window.location.origin,
                    // "X-Title": "MyStudyApp"
                },
                body: JSON.stringify({
                    model: "openai/gpt-4o", // change if you want another model (e.g. "openai/gpt-3.5-turbo")
                    messages: [
                        {
                            role: "system",
                            content:
                                "You are AiStudyBuddy, a direct, helpful study assistant for Secondary 1 students in Egypt. Help with Arabic, Math, Science, English, and History. Explain step-by-step, summarize, and quiz shortly."
                        },
                        { role: "user", content: userMessage }
                    ],
                    // optional: max_tokens, temperature, etc.
                    max_tokens: 800,
                    temperature: 0.2
                }),
            });

            if (!resp.ok) {
                // read the body for error details
                const errText = await resp.text();
                console.error("OpenRouter error:", resp.status, errText);
                setMessages(prev => [
                    ...prev,
                    { role: "ai", content: `⚠️ OpenRouter error ${resp.status}: ${errText}` }
                ]);
            } else {
                const data = await resp.json();
                // typical OpenRouter response follows OpenAI shape; adjust if your model/provider differs
                const aiReply = data?.choices?.[0]?.message?.content || "No reply.";
                setMessages(prev => [...prev, { role: "ai", content: aiReply }]);
            }
        } catch (err) {
            console.error("Fetch error:", err);
            setMessages(prev => [
                ...prev,
                { role: "ai", content: "⚠️ Network error while contacting OpenRouter. Check console." }
            ]);
        } finally {
            setIsTyping(false);
        }


    };


    return (
        <>
            {/* Floating Chat Button */}
            <motion.button
                className="fixed bottom-24 right-6 z-40 w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-2xl hover:shadow-purple-500/50"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(!isOpen)}
            >
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>

                {/* Pulse Animation */}
                <motion.div
                    className="absolute inset-0 rounded-full bg-purple-400"
                    initial={{ scale: 1, opacity: 0.5 }}
                    animate={{ scale: 1.5, opacity: 0 }}
                    transition={{ duration: 2, repeat: Infinity }}
                />
            </motion.button>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        className="fixed bottom-44 right-6 w-96 h-[500px] z-40"
                    >
                        <Card className="glass-strong h-full flex flex-col luxury-shadow border-2 border-accent/30">
                            {/* Header */}
                            <div className="p-4 border-b border-border/30 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-primary">AI Study Buddy</h3>
                                        <p className="text-xs text-muted-foreground">Always here to help!</p>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setIsOpen(false)}
                                    className="h-8 w-8 p-0"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </Button>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                {messages.map((message, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                                    >
                                        <div
                                            className={`max-w-[80%] p-3 rounded-xl ${message.role === "user"
                                                ? "bg-accent text-accent-foreground"
                                                : "glass border border-border/30"
                                                }`}
                                        >
                                            <p className="text-sm whitespace-pre-line">{message.content}</p>
                                        </div>
                                    </motion.div>
                                ))}

                                {isTyping && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="flex justify-start"
                                    >
                                        <div className="glass border border-border/30 p-3 rounded-xl">
                                            <div className="flex gap-1">
                                                <motion.div
                                                    className="w-2 h-2 bg-accent rounded-full"
                                                    animate={{ y: [0, -5, 0] }}
                                                    transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                                                />
                                                <motion.div
                                                    className="w-2 h-2 bg-accent rounded-full"
                                                    animate={{ y: [0, -5, 0] }}
                                                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                                                />
                                                <motion.div
                                                    className="w-2 h-2 bg-accent rounded-full"
                                                    animate={{ y: [0, -5, 0] }}
                                                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                                                />
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </div>

                            {/* Input */}
                            <div className="p-4 border-t border-border/30">
                                <div className="flex gap-2">
                                    <Textarea
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter" && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSend();
                                            }
                                        }}
                                        placeholder="Ask me anything..."
                                        className="glass min-h-[60px] resize-none"
                                    />
                                    <Button
                                        onClick={handleSend}
                                        disabled={!input.trim() || isTyping}
                                        className="premium-button self-end"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                        </svg>
                                    </Button>
                                </div>
                                <p className="text-xs text-muted-foreground mt-2">
                                    Press Enter to send, Shift+Enter for new line
                                </p>
                            </div>

                            {/* Quick Actions */}
                            <div className="p-4 pt-0 flex gap-2 overflow-x-auto">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="glass whitespace-nowrap"
                                    onClick={() => setInput("How can I stay motivated?")}
                                >
                                    💪 Motivation
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="glass whitespace-nowrap"
                                    onClick={() => setInput("Give me study tips")}
                                >
                                    📚 Study Tips
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="glass whitespace-nowrap"
                                    onClick={() => setInput("How's my progress?")}
                                >
                                    📊 Progress
                                </Button>
                            </div>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default AIChatBuddy;