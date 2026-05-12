import React, { useEffect, useRef, useState } from "react";
import { FaImage, FaVideo, FaPaperPlane } from "react-icons/fa";
import { MdOutlineClose } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { setSendLoading, setTyping } from "../../redux/slices/conditionSlice";
import {
	addNewMessage,
	addNewMessageId,
} from "../../redux/slices/messageSlice";
import { LuLoader } from "react-icons/lu";
import { toast } from "react-toastify";
import socket from "../../socket/socket";
import { storage } from "../../firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

let lastTypingTime;
const MessageSend = ({ chatId }) => {
	const imageFile = useRef();
	const videoFile = useRef();
	const [mediaBox, setMediaBox] = useState(false);
	const [mediaURL, setMediaURL] = useState("");
	const [mediaType, setMediaType] = useState("");
	const [uploadProgress, setUploadProgress] = useState(0);
	const [newMessage, setMessage] = useState("");
	
	const dispatch = useDispatch();
	const isSendLoading = useSelector(
		(store) => store?.condition?.isSendLoading
	);
	const isSocketConnected = useSelector(
		(store) => store?.condition?.isSocketConnected
	);
	const selectedChat = useSelector((store) => store?.myChat?.selectedChat);
	const isTyping = useSelector((store) => store?.condition?.isTyping);

	useEffect(() => {
		socket.on("typing", () => dispatch(setTyping(true)));
		socket.on("stop typing", () => dispatch(setTyping(false)));
	}, []);

	const handleMediaUpload = async (file, type) => {
		if (!file) return;
		
		const url = URL.createObjectURL(file);
		setMediaURL(url);
		setMediaType(type);
		setMediaBox(true);
		setUploadProgress(1); // Show uploading state
		
		const fileRef = ref(storage, `chatMedia/${Date.now()}_${file.name}`);
		const uploadTask = uploadBytesResumable(fileRef, file);
		
		uploadTask.on(
			"state_changed",
			(snapshot) => {
				const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
				setUploadProgress(progress);
			},
			(error) => {
				console.error("Upload error:", error);
				toast.error("Upload Failed!");
				clearMediaFile();
			},
			async () => {
				const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
				
				socket.emit("stop typing", selectedChat._id);
				dispatch(setSendLoading(true));
				const token = localStorage.getItem("token");
				fetch(`${import.meta.env.VITE_BACKEND_URL}/api/message`, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`,
					},
					body: JSON.stringify({
						message: downloadURL,
						messageType: type,
						chatId: chatId,
					}),
				})
					.then((res) => res.json())
					.then((json) => {
						dispatch(addNewMessageId(json?.data?._id));
						dispatch(addNewMessage(json?.data));
						socket.emit("new message", json.data);
						dispatch(setSendLoading(false));
						clearMediaFile();
					})
					.catch((err) => {
						console.log(err);
						dispatch(setSendLoading(false));
						toast.error("Media Sending Failed");
						clearMediaFile();
					});
			}
		);
	};

	const onSelectImage = () => {
		if (imageFile.current?.files[0]) {
			handleMediaUpload(imageFile.current.files[0], "image");
		}
	};

	const onSelectVideo = () => {
		if (videoFile.current?.files[0]) {
			handleMediaUpload(videoFile.current.files[0], "video");
		}
	};

	const clearMediaFile = () => {
		if(imageFile.current) imageFile.current.value = "";
		if(videoFile.current) videoFile.current.value = "";
		setMediaURL("");
		setMediaBox(false);
		setUploadProgress(0);
	};

	const handleSendMessage = async () => {
		if (newMessage?.trim()) {
			const message = newMessage?.trim();
			setMessage("");
			socket.emit("stop typing", selectedChat._id);
			dispatch(setSendLoading(true));
			const token = localStorage.getItem("token");
			fetch(`${import.meta.env.VITE_BACKEND_URL}/api/message`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({
					message: message,
					messageType: "text",
					chatId: chatId,
				}),
			})
				.then((res) => res.json())
				.then((json) => {
					dispatch(addNewMessageId(json?.data?._id));
					dispatch(addNewMessage(json?.data));
					socket.emit("new message", json.data);
					dispatch(setSendLoading(false));
				})
				.catch((err) => {
					console.log(err);
					dispatch(setSendLoading(false));
					toast.error("Message Sending Failed");
				});
		}
	};

	const handleTyping = (e) => {
		setMessage(e.target?.value);
		if (!isSocketConnected) return;
		if (!isTyping) {
			socket.emit("typing", selectedChat._id);
		}
		lastTypingTime = new Date().getTime();
		let timerLength = 3000;
		let stopTyping = setTimeout(() => {
			let timeNow = new Date().getTime();
			let timeDiff = timeNow - lastTypingTime;
			if (timeDiff > timerLength) {
				socket.emit("stop typing", selectedChat._id);
			}
		}, timerLength);
		return () => clearTimeout(stopTyping);
	};

	return (
		<div className="relative">
			{mediaBox && (
				<div className="border border-slate-700/50 rounded-2xl absolute bottom-full mb-3 left-4 bg-[#0B1120]/90 backdrop-blur-md w-72 h-56 p-2 shadow-2xl z-50">
					{mediaType === "image" ? (
						<img src={mediaURL} alt="media" className="h-full w-full object-contain rounded-xl" />
					) : (
						<video src={mediaURL} className="h-full w-full object-contain rounded-xl" controls />
					)}
					<MdOutlineClose
						title="Cancel"
						size={28}
						className="absolute top-3 right-3 cursor-pointer text-white bg-red-500/80 hover:bg-red-500 rounded-full p-1.5 shadow-lg transition-colors"
						onClick={clearMediaFile}
					/>
					{uploadProgress > 0 && uploadProgress < 100 && (
						<div className="absolute bottom-2 left-2 right-2 bg-slate-900/80 rounded-full h-3 p-0.5">
							<div className="bg-cyan-500 h-full rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
						</div>
					)}
				</div>
			)}
			
			<form
				className="w-full flex items-center gap-3 p-3 bg-[#0B1120]/60 backdrop-blur-xl border-t border-slate-700/50"
				onSubmit={(e) => e.preventDefault()}
			>
				<label htmlFor="image-upload" className="cursor-pointer p-2 rounded-xl hover:bg-slate-700/40 text-cyan-400 transition-colors">
					<FaImage title="Send Photo" size={22} />
				</label>
				<input ref={imageFile} type="file" accept="image/*" id="image-upload" className="hidden" onChange={onSelectImage} />

				<label htmlFor="video-upload" className="cursor-pointer p-2 rounded-xl hover:bg-slate-700/40 text-blue-400 transition-colors">
					<FaVideo title="Send Video" size={22} />
				</label>
				<input ref={videoFile} type="file" accept="video/*" id="video-upload" className="hidden" onChange={onSelectVideo} />

				<div className="flex-1 relative">
					<input
						type="text"
						className="w-full bg-[#0F172A]/80 border border-slate-600/50 text-slate-200 px-4 py-2.5 rounded-2xl focus:outline-none focus:ring-1 focus:ring-cyan-500/50 placeholder-slate-500"
						placeholder="Type a message..."
						value={newMessage}
						onChange={(e) => handleTyping(e)}
						onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
					/>
				</div>
				
				<button
					onClick={handleSendMessage}
					disabled={!newMessage?.trim() || isSendLoading}
					className="p-3 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white shadow-lg hover:shadow-cyan-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-95"
				>
					{isSendLoading ? (
						<LuLoader title="Sending..." size={20} className="animate-spin" />
					) : (
						<FaPaperPlane title="Send" size={20} className={newMessage?.trim() ? "" : "opacity-70"} />
					)}
				</button>
			</form>
		</div>
	);
};

export default MessageSend;
