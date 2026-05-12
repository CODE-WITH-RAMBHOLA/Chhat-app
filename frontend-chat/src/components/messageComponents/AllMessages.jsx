import React, { Fragment, useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { VscCheckAll } from "react-icons/vsc";
import { CgChevronDoubleDown } from "react-icons/cg";
import { MdDeleteOutline } from "react-icons/md";
import { toast } from "react-toastify";
import {
    SimpleDateAndTime,
    SimpleDateMonthDay,
    SimpleTime,
} from "../../utils/formateDateTime";
import { addAllMessages } from "../../redux/slices/messageSlice";

const AllMessages = ({ allMessage }) => {
    const chatBox = useRef();
    const dispatch = useDispatch();
    const adminId = useSelector((store) => store.auth?._id);
    const isTyping = useSelector((store) => store?.condition?.isTyping);

    const handleDeleteMessage = async (messageId) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this message?");
        if (!confirmDelete) return;

        const token = localStorage.getItem("token");
        try {
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/message/${messageId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                toast.success("Message deleted");
                // Update local state by filtering out the deleted message
                const newMessages = allMessage.filter(msg => msg._id !== messageId);
                dispatch(addAllMessages(newMessages));
            } else {
                toast.error(data.message || "Failed to delete message");
            }
        } catch (error) {
            console.error(error);
            toast.error("Error deleting message");
        }
    };

    const [scrollShow, setScrollShow] = useState(true);
    // Handle Chat Box Scroll Down
    const handleScrollDownChat = () => {
        if (chatBox.current) {
            chatBox.current.scrollTo({
                top: chatBox.current.scrollHeight,
                // behavior: "auto",
            });
        }
    };
    // Scroll Button Hidden
    useEffect(() => {
        handleScrollDownChat();
        if (chatBox.current.scrollHeight == chatBox.current.clientHeight) {
            setScrollShow(false);
        }
        const handleScroll = () => {
            const currentScrollPos = chatBox.current.scrollTop;
            if (
                currentScrollPos + chatBox.current.clientHeight <
                chatBox.current.scrollHeight - 30
            ) {
                setScrollShow(true);
            } else {
                setScrollShow(false);
            }
        };
        const chatBoxCurrent = chatBox.current;
        chatBoxCurrent.addEventListener("scroll", handleScroll);
        return () => {
            chatBoxCurrent.removeEventListener("scroll", handleScroll);
        };
    }, [allMessage, isTyping]);

    return (
        <>
            {scrollShow && (
                <div
                    className="absolute bottom-16 right-4 cursor-pointer z-20 font-light text-white/50 bg-black/80 hover:bg-black hover:text-white p-1.5 rounded-full"
                    onClick={handleScrollDownChat}
                >
                    <CgChevronDoubleDown title="Scroll Down" fontSize={24} />
                </div>
            )}
            <div
                className="flex flex-col w-full px-3 gap-1 py-2 overflow-y-auto overflow-hidden scroll-style h-[66vh]"
                ref={chatBox}
            >
                {allMessage?.map((message, idx) => {
                    return (
                        <Fragment key={message._id}>
                            <div className="sticky top-0 flex w-full justify-center z-10">
                                {new Date(
                                    allMessage[idx - 1]?.updatedAt
                                ).toDateString() !==
                                    new Date(
                                        message?.updatedAt
                                    ).toDateString() && (
                                    <span className="text-xs font-light mb-2 mt-1 text-white/50 bg-black h-7 w-fit px-5 rounded-md flex items-center justify-center cursor-pointer">
                                        {SimpleDateMonthDay(message?.updatedAt)}
                                    </span>
                                )}
                            </div>
                            <div
                                className={`flex items-start gap-1 ${
                                    message?.sender?._id === adminId
                                        ? "flex-row-reverse text-white"
                                        : "flex-row text-black"
                                }`}
                            >
                                {message?.chat?.isGroupChat &&
                                    message?.sender?._id !== adminId &&
                                    (allMessage[idx + 1]?.sender?._id !==
                                    message?.sender?._id ? (
                                        <img
                                            src={message?.sender?.image}
                                            alt=""
                                            className="h-9 w-9 rounded-full"
                                        />
                                    ) : (
                                        <div className="h-9 w-9 rounded-full"></div>
                                    ))}
                                <div
                                    className={`${
                                        message?.sender?._id === adminId
                                            ? "bg-gradient-to-tr to-blue-600 from-cyan-600 rounded-s-2xl rounded-tr-sm rounded-br-2xl shadow-[0_4px_15px_rgba(6,182,212,0.2)] text-white"
                                            : "bg-[#1E293B] border border-slate-700/50 rounded-e-2xl rounded-tl-sm rounded-bl-2xl shadow-lg text-slate-200"
                                    } py-2 px-3 min-w-[80px] text-start flex flex-col relative max-w-[85%] group transition-all`}
                                >
                                    {message?.chat?.isGroupChat &&
                                        message?.sender?._id !== adminId && (
                                            <span className="text-xs font-bold text-start text-green-900">
                                                {message?.sender?.firstName}
                                            </span>
                                        )}
                                    <div
                                        className={`mt-1 pb-1.5 ${
                                            message?.sender?._id == adminId
                                                ? "pr-16"
                                                : "pr-12"
                                        }`}
                                    >
                                        {message?.messageType === "image" ? (
                                            <img src={message.message} alt="Shared Image" className="max-w-[200px] md:max-w-[250px] rounded-lg mt-1 object-cover cursor-pointer hover:opacity-90 transition-opacity" onClick={() => window.open(message.message, '_blank')} />
                                        ) : message?.messageType === "video" ? (
                                            <video src={message.message} controls className="max-w-[200px] md:max-w-[250px] rounded-lg mt-1 object-cover" />
                                        ) : (
                                            <span className="text-[15px] leading-relaxed break-words block">
                                                {message?.message}
                                            </span>
                                        )}
                                        <span
                                            className="text-[10px] font-medium absolute bottom-1.5 right-2.5 flex items-center gap-1.5 opacity-80"
                                            title={SimpleDateAndTime(
                                                message?.updatedAt
                                            )}
                                        >
                                            {SimpleTime(message?.updatedAt)}
                                            {message?.sender?._id ===
                                                adminId && (
                                                <VscCheckAll
                                                    color="currentColor"
                                                    fontSize={14}
                                                />
                                            )}
                                        </span>
                                    </div>
                                    {message?.sender?._id === adminId && (
                                        <div 
                                            className="absolute top-1/2 -translate-y-1/2 -left-8 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-red-400 hover:text-red-500 bg-[#0B1120] p-1.5 rounded-full shadow-lg"
                                            onClick={() => handleDeleteMessage(message._id)}
                                            title="Delete message"
                                        >
                                            <MdDeleteOutline size={16} />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Fragment>
                    );
                })}
                {isTyping && (
                    <div id="typing-animation">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                )}
            </div>
        </>
    );
};

export default AllMessages;
