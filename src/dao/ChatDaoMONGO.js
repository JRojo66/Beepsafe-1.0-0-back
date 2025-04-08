import { chatModel } from "./models/chatModel.js";

export class ChatDaoMONGO {
    addMessage = async (chatUser, chatMessage) => {
        return await chatModel.create({chatUser, chatMessage});         
    };
}