import React from "react";
import { MdChat } from "react-icons/md";

const ChatNotSelected = () => {
	return (
		<div className="h-full w-full bg-[#0B0A11] flex flex-col justify-center items-center">
			<div className="w-16 h-16 rounded-full bg-[#1A1825] flex items-center justify-center mb-4 shadow-lg border border-[#2D2A3D]">
				<MdChat size={28} className="text-[#6366F1]" />
			</div>
			<h1 className="text-slate-500 font-medium tracking-wide">Select a chat to start messaging</h1>
			
			<div className="absolute bottom-8 w-12 h-12 rounded-full border border-slate-700/50 flex items-center justify-center text-slate-400 cursor-pointer hover:bg-slate-800 hover:text-white transition-all">
				<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
				</svg>
			</div>
		</div>
	);
};

export default ChatNotSelected;
