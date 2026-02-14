import StudentLayout from "@/components/layout/StudentLayout";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageCircle, Send, Bot, User, Sparkles, Info } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { Streamdown } from "streamdown";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function Chatbot() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: history, isLoading: historyLoading } = trpc.chatbot.getHistory.useQuery({ limit: 20 });
  
  const sendMutation = trpc.chatbot.sendMessage.useMutation({
    onSuccess: (data) => {
      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: data.response,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    },
    onError: (error) => {
      if (error.message.includes("Limite")) {
        toast.error(error.message);
      } else {
        toast.error("Erreur lors de l'envoi du message");
      }
    },
  });

  // Load history on mount
  useEffect(() => {
    if (history && history.length > 0 && messages.length === 0) {
      const loadedMessages: Message[] = [];
      history.reverse().forEach((h) => {
        loadedMessages.push({
          id: `user-${h.id}`,
          role: "user",
          content: h.message,
          timestamp: new Date(h.createdAt),
        });
        loadedMessages.push({
          id: `assistant-${h.id}`,
          role: "assistant",
          content: h.response,
          timestamp: new Date(h.createdAt),
        });
      });
      setMessages(loadedMessages);
    }
  }, [history]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      await sendMutation.mutateAsync({ message: userMessage.content });
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <StudentLayout>
      <div className="max-w-4xl mx-auto h-[calc(100vh-12rem)]">
        <Card className="h-full flex flex-col">
          <CardHeader className="border-b">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-primary/10">
                <Bot className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="flex items-center gap-2">
                  Assistant Sklora
                  <Sparkles className="h-4 w-4 text-gold" />
                </CardTitle>
                <CardDescription>
                  Votre tuteur IA disponible 24/7 pour vous aider
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          {/* Messages Area */}
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            {historyLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <Skeleton className="h-20 flex-1 rounded-lg" />
                  </div>
                ))}
              </div>
            ) : messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8">
                <Bot className="h-16 w-16 text-primary/30 mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  Bienvenue sur l'assistant Sklora !
                </h3>
                <p className="text-muted-foreground max-w-md mb-6">
                  Je suis là pour vous aider dans votre apprentissage. Posez-moi des questions sur les cours, demandez des explications ou des conseils.
                </p>
                <div className="grid gap-2 w-full max-w-md">
                  <Button
                    variant="outline"
                    className="justify-start text-left h-auto py-3"
                    onClick={() => setInput("Peux-tu m'expliquer les concepts clés de ma dernière leçon ?")}
                  >
                    <MessageCircle className="h-4 w-4 mr-2 shrink-0" />
                    Explique-moi les concepts clés de ma dernière leçon
                  </Button>
                  <Button
                    variant="outline"
                    className="justify-start text-left h-auto py-3"
                    onClick={() => setInput("Comment puis-je améliorer mes résultats aux quiz ?")}
                  >
                    <MessageCircle className="h-4 w-4 mr-2 shrink-0" />
                    Comment améliorer mes résultats aux quiz ?
                  </Button>
                  <Button
                    variant="outline"
                    className="justify-start text-left h-auto py-3"
                    onClick={() => setInput("Donne-moi des conseils pour maintenir ma motivation")}
                  >
                    <MessageCircle className="h-4 w-4 mr-2 shrink-0" />
                    Conseils pour maintenir ma motivation
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${
                      message.role === "user" ? "flex-row-reverse" : ""
                    }`}
                  >
                    <Avatar className="h-10 w-10 shrink-0">
                      {message.role === "assistant" ? (
                        <>
                          <AvatarFallback className="bg-primary/10">
                            <Bot className="h-5 w-5 text-primary" />
                          </AvatarFallback>
                        </>
                      ) : (
                        <>
                          <AvatarImage src={user?.avatarUrl || undefined} />
                          <AvatarFallback>
                            {user?.name?.charAt(0)?.toUpperCase() || "U"}
                          </AvatarFallback>
                        </>
                      )}
                    </Avatar>
                    <div
                      className={`max-w-[80%] p-4 rounded-2xl ${
                        message.role === "user"
                          ? "chat-bubble-user"
                          : "chat-bubble-assistant"
                      }`}
                    >
                      {message.role === "assistant" ? (
                        <Streamdown>{message.content}</Streamdown>
                      ) : (
                        <p>{message.content}</p>
                      )}
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex gap-3">
                    <Avatar className="h-10 w-10 shrink-0">
                      <AvatarFallback className="bg-primary/10">
                        <Bot className="h-5 w-5 text-primary" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="chat-bubble-assistant p-4 rounded-2xl">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>

          {/* Input Area */}
          <div className="p-4 border-t">
            <div className="flex items-center gap-2 mb-2">
              <Info className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                20 messages par jour • L'assistant utilise le contenu de vos cours pour répondre
              </span>
            </div>
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Posez votre question..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button onClick={handleSend} disabled={!input.trim() || isLoading}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </StudentLayout>
  );
}
