import { model, Schema, Types } from "mongoose";
const inviteSchema = new Schema(
    {
        user: { type: Types.ObjectId, ref: "User", required: true },
        invitedBy: { type: Types.ObjectId, ref: "User", required: true },
        status: { type: String, enum: ["pending", "accepted", "declined"], default: "pending" }
    },
    { _id: false, timestamps: true }
);

const Chat =  model(
    "Chat",
    new Schema(
        {
            type: {
                type: String,
                enum: ["article", "topic"],
                default: undefined
            },
            title: { type: String, trim: true, maxlength: 100 },
            topic: { type: String, trim: true, maxlength: 200 },
            category: { type: String, default: "Тематические обсуждения" },
            post: { type: Types.ObjectId, ref: "Post" },
            owner: { type: Types.ObjectId, ref: "User" },
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
            ],
            invitations: [inviteSchema]
        },  
        {
            timestamps: true
        }
    )
);
Chat.schema.index({ type: 1, post: 1 }, { unique: true, partialFilterExpression: { type: "article" } });
Chat.schema.index({ participants: 1, updatedAt: -1 });
export default Chat;