import { model, Schema, Types } from "mongoose";
const Chat =  model(
    "Chat",
    new Schema(
        {
            participants: [
                {
                    type: Types.ObjectId,
                    ref: "User",
                    required: true
                }
            ],
            messages: [
                {
                    type: Types.ObjectId,
                    ref: "Message"
                }
            ]
        },  
        {
            timestamps: true
        }
    )
);
export default Chat;