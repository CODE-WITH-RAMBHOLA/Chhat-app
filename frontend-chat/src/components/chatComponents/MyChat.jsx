import React, { useEffect, useState } from "react";
import { FaPlus } from "react-icons/fa";
import { FiSearch } from "react-icons/fi";
import { addMyChat, addSelectedChat } from "../../redux/slices/myChatSlice";
import { useDispatch, useSelector } from "react-redux";
import {
    setChatLoading,
    setGroupChatBox,
} from "../../redux/slices/conditionSlice";
import ChatShimmer from "../loading/ChatShimmer";
import getChatName, { getChatImage } from "../../utils/getChatName";
import { VscCheckAll } from "react-icons/vsc";
import { SimpleTime } from "../../utils/formateDateTime";

const MyChat = () => {
    const dispatch = useDispatch();
    const myChat = useSelector((store) => store.myChat.chat);
    const authUserId = useSelector((store) => store?.auth?._id);
    const selectedChat = useSelector((store) => store?.myChat?.selectedChat);
    const isChatLoading = useSelector(
        (store) => store?.condition?.isChatLoading
    );
    const newMessageId = useSelector((store) => store?.message?.newMessageId);
    const isGroupChatId = useSelector((store) => store.condition.isGroupChatId);
	
	const [activeTab, setActiveTab] = useState("All"); // All, Personal, Groups

    useEffect(() => {
        const getMyChat = () => {
            dispatch(setChatLoading(true));
            const token = localStorage.getItem("token");
            fetch(`${import.meta.env.VITE_BACKEND_URL}/api/chat`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            })
                .then(async (res) => {
                    if (!res.ok) throw new Error("Failed to fetch chat data");
                    return res.json();
                })
                .then((json) => {
                    dispatch(addMyChat(json?.data || []));
                    dispatch(setChatLoading(false));
                })
                .catch((err) => {
                    console.log(err);
                    dispatch(setChatLoading(false));
                });
        };
        getMyChat();
    }, [newMessageId, isGroupChatId]);

	const filteredChats = myChat.filter(chat => {
		if (activeTab === "All") return true;
		if (activeTab === "Groups") return chat.isGroupChat;
		if (activeTab === "Personal") return !chat.isGroupChat;
		return true;
	});

	// Colors for avatars
	const colors = ["bg-purple-500", "bg-cyan-500", "bg-pink-500", "bg-orange-500", "bg-blue-500"];

    return (
        <div className="w-full h-full flex flex-col">
            {/* Header */}
            <div className="px-6 pt-7 pb-5 w-full flex justify-between items-center text-white">
                <h1 className="text-2xl font-bold tracking-wide">Messages</h1>
                <div
                    className="flex items-center justify-center w-10 h-10 border border-slate-700/80 rounded-[12px] cursor-pointer hover:bg-slate-800 transition-colors text-slate-300 shadow-sm hover:shadow-md"
                    title="Create New Group"
                    onClick={() => dispatch(setGroupChatBox())}
                >
                    <FaPlus size={14} />
                </div>
            </div>
			
			{/* Search */}
			<div className="px-6 pb-6">
				<div className="w-full bg-[#1A1825] border border-[#2D2A3D] rounded-[14px] flex items-center px-4 py-3 shadow-inner">
					<FiSearch className="text-slate-400 mr-3" size={20} />
					<input 
						type="text" 
						placeholder="Search..." 
						className="bg-transparent border-none outline-none text-[15px] text-slate-200 w-full placeholder-slate-500"
					/>
				</div>
			</div>

			{/* Tabs */}
			<div className="px-6 flex gap-3 mb-5">
				{["All", "Personal", "Groups"].map((tab) => (
					<div 
						key={tab}
						onClick={() => setActiveTab(tab)}
						className={`px-5 py-2 rounded-full text-[15px] font-medium cursor-pointer transition-all border ${
							activeTab === tab 
							? "bg-[#2A273A] text-white border-slate-600 shadow-sm" 
							: "bg-transparent text-slate-400 border-transparent hover:text-slate-200 hover:bg-[#1A1825]"
						}`}
					>
						{tab}
					</div>
				))}
			</div>

            <div className="flex flex-col w-full px-4 gap-1 py-2 overflow-y-auto overflow-hidden scroll-style flex-1">
                {isChatLoading ? (
                    <ChatShimmer />
                ) : (
                    <>
                        {filteredChats?.length === 0 && (
                            <div className="w-full h-full flex justify-center pt-10 text-slate-500">
                                <span className="text-sm">No chats found.</span>
                            </div>
                        )}
                        {filteredChats?.map((chat, index) => {
							const chatName = getChatName(chat, authUserId);
							const initial = chatName ? chatName.charAt(0).toUpperCase() : "U";
							const bgColor = colors[index % colors.length];

                            return (
                                <div
                                    key={chat?._id}
                                    className={`w-full p-4 rounded-2xl flex justify-between items-center cursor-pointer transition-all ${
                                        selectedChat?._id == chat?._id
                                            ? "bg-[#1A1825]"
                                            : "hover:bg-[#1A1825]/50"
                                    }`}
                                    onClick={() => dispatch(addSelectedChat(chat))}
                                >
									<div className="flex items-center gap-4 w-[75%]">
										{/* Avatar */}
										<div className="relative shrink-0">
											{chat.isGroupChat ? (
												<div className={`w-[52px] h-[52px] rounded-full ${bgColor} flex items-center justify-center text-white font-bold text-xl shadow-lg`}>
													{initial}
												</div>
											) : (
												<div className={`w-[52px] h-[52px] rounded-full ${bgColor} flex items-center justify-center text-white font-bold text-xl shadow-lg`}>
													{initial}
												</div>
											)}
											{/* Online indicator dot - fake for UI */}
											{!chat.isGroupChat && (
												<div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full ring-[3px] ring-[#110F18]"></div>
											)}
										</div>
										
										{/* Text content */}
										<div className="flex flex-col flex-1 truncate">
											<span className="text-[17px] font-semibold text-slate-200 flex items-center gap-2 truncate">
												{chatName}
												{chat.isGroupChat && (
													<svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
													</svg>
												)}
											</span>
											<span className="text-[14px] text-slate-400 truncate flex items-center gap-1.5 mt-0.5">
												{chat?.latestMessage && chat?.latestMessage?.sender?._id === authUserId && (
													<VscCheckAll className="text-blue-400" fontSize={16} />
												)}
												<span className="truncate">
													{chat?.latestMessage ? chat?.latestMessage?.message : "New chat created"}
												</span>
											</span>
										</div>
									</div>

									{/* Right side info */}
									<div className="flex flex-col items-end gap-2">
										<span className="text-[12px] font-medium text-slate-500">
											{chat?.latestMessage ? SimpleTime(chat?.latestMessage?.createdAt) : ''}
										</span>
										{/* Unread badge mock based on index to match screenshot roughly */}
										{index < 3 && (
											<div className="w-[20px] h-[20px] rounded-full bg-[#8B5CF6] text-white text-[11px] font-bold flex items-center justify-center">
												{index === 0 ? '3' : index === 1 ? '' : '7'}
											</div>
										)}
									</div>
                                </div>
                            );
                        })}
                    </>
                )}
            </div>
        </div>
    );
};

export default MyChat;
