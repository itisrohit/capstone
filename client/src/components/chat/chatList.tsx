"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Search, MessageSquareDot } from "lucide-react";
import { cn } from "@/lib/utils";
import { ChatItem, useChatStore } from "@/store/chatStore";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useSidebar } from "@/components/layout/sidebar";

export default function ChatList({
    onSelectChat,
    mobileView,
    selectedChatId,
}: {
    onSelectChat: (chat: ChatItem) => void; 
    mobileView?: boolean;
    selectedChatId: string | null;
}) {
    const { toggleSidebar } = useSidebar();
    const [searchTerm, setSearchTerm] = useState("");
    
    // Add subscription to typing users state for real-time updates
    const chatList = useChatStore(state => state.chatList);
    const typingUsers = useChatStore(state => state.typingUsers);
    
    const filteredChats = searchTerm
        ? chatList.filter((chat) =>
                chat.name.toLowerCase().includes(searchTerm.toLowerCase())
          )
        : chatList;

    const handleChatSelection = (chat: ChatItem) => {
        onSelectChat(chat);
    };
    
    // Helper function to check if someone is typing in this chat
    const isUserTypingInChat = (chatId: string) => {
        if (!typingUsers[chatId]) return false;
        return Object.values(typingUsers[chatId]).some(isTyping => isTyping === true);
    };

    return (
		<div
			className={cn(
				"flex flex-col h-full border-r bg-background",
				// Only apply width-based classes for desktop view
				!mobileView && "w-80"
			)}
		>
			{/* Add Menu Button for Mobile View */}
			{mobileView && (
				<Button
					variant="ghost"
					size="icon"
					onClick={toggleSidebar}
					className="fixed bottom-4 right-4 h-12 w-12 rounded-full bg-background/95 shadow-md border border-border/60 md:hidden"
					aria-label="Menu"
				>
					<ChevronLeft className="h-5 w-5 text-muted-foreground" />
				</Button>
			)}

			{/* Search bar - adjusted height to match header */}
			<div className="h-[73px] p-4 border-b flex items-center">
				<div className="relative w-full">
					<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
					<Input
						placeholder="Search chats..."
						className="pl-10 bg-accent/50"
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
					/>
				</div>
			</div>

			{/* Chat list */}
			<div className="flex-1 overflow-y-auto">
				{filteredChats.length === 0 ? (
					<div className="flex items-center justify-center h-full text-muted-foreground">
						No chats found
					</div>
				) : (
					filteredChats.map((chat) => {
                        // Check if someone is typing in this chat
                        const isTyping = isUserTypingInChat(chat.id);
                        
                        return (
                            <div
                                key={chat.id}
                                className={cn(
                                    "flex items-center p-4 gap-3 cursor-pointer transition-colors",
                                    "hover:bg-accent/50",
                                    selectedChatId === chat.id && "bg-accent"
                                )}
                                onClick={() => handleChatSelection(chat)}
                            >
                                {/* Keep avatar section */}
                                <div className="relative">
                                    <Avatar className="h-12 w-12 border">
                                        <AvatarImage src={chat.avatar || undefined} alt={chat.name} />
                                        <AvatarFallback>
                                            {chat.name.split(" ").map((n) => n[0]).join("").substring(0, 2)}
                                        </AvatarFallback>
                                    </Avatar>
                                    {chat.online && (
                                        <span
                                            className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-background"
                                            aria-hidden="true"
                                        />
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-baseline">
                                        <h3 className={cn(
                                            "font-medium truncate",
                                            chat.unread > 0 && "font-semibold"
                                        )}>
                                            {chat.name}
                                        </h3>
                                        <span className={cn(
                                            "text-xs whitespace-nowrap ml-2",
                                            chat.unread > 0 ? "text-primary font-medium" : "text-muted-foreground"
                                        )}>
                                            {chat.timestamp}
                                        </span>
                                    </div>
                                    
                                    {/* Show typing indicator in chat list when someone is typing */}
                                    {isTyping && selectedChatId !== chat.id ? (
                                        <p className="text-sm truncate text-green-600 dark:text-green-500 font-medium flex items-center gap-1">
                                            <MessageSquareDot className="h-3.5 w-3.5" /> 
                                            typing...
                                        </p>
                                    ) : (
                                        <p className={cn(
                                            "text-sm truncate",
                                            chat.unread > 0
                                                ? "text-foreground font-medium"
                                                : "text-muted-foreground"
                                        )}>
                                            {chat.lastMessage}
                                        </p>
                                    )}
                                </div>

                                {chat.unread > 0 && (
                                    <div className="min-w-[20px] h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center ml-2">
                                        {chat.unread}
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
		</div>
	);
}