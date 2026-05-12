const Chat = require("../models/chat");
const Message = require("../models/message");

const createMessage = async (req, res) => {
	const { message, chatId, messageType } = req.body;
	if (message) {
		const newMessage = await Message.create({
			sender: req.user._id,
			message: message,
			messageType: messageType || "text",
			chat: chatId,
		});
		const chat = await Chat.findByIdAndUpdate(chatId, {
			latestMessage: newMessage._id,
		});
		const fullMessage = await Message.findById(newMessage._id)
			.populate("sender", "-password")
			.populate({
				path: "chat",
				populate: { path: "users groupAdmin", select: "-password" },
			});
		return res.status(201).json({ data: fullMessage });
	} else {
		return res.status(400).json({ message: "Message not provide" });
	}
};

const allMessage = async (req, res) => {
	const chatId = req.params.chatId;
	const messages = await Message.find({ chat: chatId })
		.populate("sender", "-password")
		.populate("chat");
	return res.status(200).json({ data: messages });
};

const clearChat = async (req, res) => {
	const chatId = req.params.chatId;
	await Message.deleteMany({ chat: chatId });
	return res.status(200).json({ message: "success" });
};

const deleteMessage = async (req, res) => {
	const messageId = req.params.messageId;
	try {
		await Message.findByIdAndDelete(messageId);
		return res.status(200).json({ message: "Message deleted successfully", id: messageId });
	} catch (err) {
		return res.status(500).json({ message: "Error deleting message" });
	}
};

module.exports = { createMessage, allMessage, clearChat, deleteMessage };
