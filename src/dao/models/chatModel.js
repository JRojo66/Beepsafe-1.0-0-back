import mongoose from "mongoose";

const chatCollection = "chat";
const chatSchema = new mongoose.Schema({
    chatUser: String,
    chatMessage: String,
},
{
    timestamps: true,
}
);

export const chatModel = mongoose.model(chatCollection, chatSchema);