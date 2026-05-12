import React, { useEffect } from "react";
import { MdChat } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import UserSearch from "../components/chatComponents/UserSearch";
import MyChat from "../components/chatComponents/MyChat";
import MessageBox from "../components/messageComponents/MessageBox";
import ChatNotSelected from "../components/chatComponents/ChatNotSelected";
import {
	setChatDetailsBox,
	setSocketConnected,
	setUserSearchBox,
} from "../redux/slices/conditionSlice";
import socket from "../socket/socket";
import { addAllMessages, addNewMessage } from "../redux/slices/messageSlice";
import {
	addNewChat,
	addNewMessageRecieved,
	deleteSelectedChat,
} from "../redux/slices/myChatSlice";
import { toast } from "react-toastify";
import { receivedSound } from "../utils/notificationSound";
let selectedChatCompare;

const Home = () => {
	const selectedChat = useSelector((store) => store?.myChat?.selectedChat);
	const dispatch = useDispatch();
	const isUserSearchBox = useSelector(
		(store) => store?.condition?.isUserSearchBox
	);
	const authUserId = useSelector((store) => store?.auth?._id);

	// socket connection
	useEffect(() => {
		if (!authUserId) return;
		socket.emit("setup", authUserId);
		socket.on("connected", () => dispatch(setSocketConnected(true)));
	}, [authUserId]);

	// socket message received
	useEffect(() => {
		selectedChatCompare = selectedChat;
		const messageHandler = (newMessageReceived) => {
			if (
				selectedChatCompare &&
				selectedChatCompare._id === newMessageReceived.chat._id
			) {
				dispatch(addNewMessage(newMessageReceived));
			} else {
				receivedSound();
				dispatch(addNewMessageRecieved(newMessageReceived));
			}
		};
		socket.on("message received", messageHandler);

		return () => {
			socket.off("message received", messageHandler);
		};
	});

	// socket clear chat messages
	useEffect(() => {
		const clearChatHandler = (chatId) => {
			if (chatId === selectedChat?._id) {
				dispatch(addAllMessages([]));
				toast.success("Cleared all messages");
			}
		};
		socket.on("clear chat", clearChatHandler);
		return () => {
			socket.off("clear chat", clearChatHandler);
		};
	});
	// socket delete chat messages
	useEffect(() => {
		const deleteChatHandler = (chatId) => {
			dispatch(setChatDetailsBox(false));
			if (selectedChat && chatId === selectedChat._id) {
				dispatch(addAllMessages([]));
			}
			dispatch(deleteSelectedChat(chatId));
			toast.success("Chat deleted successfully");
		};
		socket.on("delete chat", deleteChatHandler);
		return () => {
			socket.off("delete chat", deleteChatHandler);
		};
	});

	// socket chat created
	useEffect(() => {
		const chatCreatedHandler = (chat) => {
			dispatch(addNewChat(chat));
			toast.success("Created & Selected chat");
		};
		socket.on("chat created", chatCreatedHandler);
		return () => {
			socket.off("chat created", chatCreatedHandler);
		};
	});

	return (
		<div className="flex w-full h-[calc(100vh-64px)] md:h-[calc(100vh-80px)] bg-[#0B0A11] overflow-hidden">
			{/* Very Thin Sidebar */}
			<div className="w-[80px] h-full bg-[#110F18] border-r border-[#1C1A28] hidden sm:flex flex-col items-center py-6 justify-between shrink-0">
				<div className="flex flex-col gap-6">
					<div 
						className={`w-12 h-12 rounded-[14px] flex items-center justify-center cursor-pointer transition-all ${!isUserSearchBox ? 'bg-[#6366F1]/20 text-[#818CF8] border border-[#6366F1]/30 shadow-[0_0_15px_rgba(99,102,241,0.2)]' : 'text-slate-400 hover:bg-[#1A1825] hover:text-white border border-transparent'}`}
						onClick={() => isUserSearchBox && dispatch(setUserSearchBox())}
						title="Chats"
					>
						<MdChat size={22} />
					</div>
					<div 
						className={`w-12 h-12 rounded-[14px] flex items-center justify-center cursor-pointer transition-all group ${isUserSearchBox ? 'bg-[#6366F1]/20 text-[#818CF8] border border-[#6366F1]/30 shadow-[0_0_15px_rgba(99,102,241,0.2)]' : 'text-slate-400 hover:bg-[#1A1825] hover:text-white border border-transparent'}`}
						onClick={() => !isUserSearchBox && dispatch(setUserSearchBox())}
						title="Search New Users"
					>
						<svg className="w-[22px] h-[22px] group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
						</svg>
					</div>
					<div className="w-12 h-12 rounded-[14px] text-slate-400 flex items-center justify-center cursor-pointer hover:bg-[#1A1825] hover:text-white border border-transparent transition-all group">
						<svg className="w-[22px] h-[22px] group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
						</svg>
					</div>
					<div className="w-12 h-12 rounded-[14px] text-slate-400 flex items-center justify-center cursor-pointer hover:bg-[#1A1825] hover:text-white border border-transparent transition-all group">
						<svg className="w-[22px] h-[22px] group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
						</svg>
					</div>
				</div>
				<div className="flex flex-col gap-6">
					<div className="w-12 h-12 rounded-[14px] text-slate-400 flex items-center justify-center cursor-pointer hover:bg-[#1A1825] hover:text-white border border-transparent transition-all group relative" onClick={() => dispatch(setNotificationBox(true))}>
						<svg className="w-[22px] h-[22px] group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
						</svg>
						<span className="absolute top-2 right-3 w-2 h-2 bg-[#EC4899] rounded-full ring-2 ring-[#110F18]"></span>
					</div>
					<div className="w-12 h-12 rounded-[14px] text-slate-400 flex items-center justify-center cursor-pointer hover:bg-[#1A1825] hover:text-white border border-transparent transition-all group">
						<svg className="w-[22px] h-[22px] group-hover:rotate-90 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
						</svg>
					</div>
				</div>
			</div>

			<div
				className={`${
					selectedChat && "hidden"
				} sm:block sm:w-[380px] w-full h-full bg-[#110F18] border-r border-[#1C1A28] relative flex flex-col shrink-0`}
			>
				{isUserSearchBox ? <UserSearch /> : <MyChat />}
			</div>
			
			<div
				className={`${
					!selectedChat && "hidden"
				} sm:block flex-1 w-full h-full bg-[#0B0A11] relative overflow-hidden`}
			>
				{selectedChat ? (
					<MessageBox chatId={selectedChat?._id} />
				) : (
					<ChatNotSelected />
				)}
			</div>
		</div>
	);
};

export default Home;
