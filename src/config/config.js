import dotenv from "dotenv";

dotenv.config(
    {
        path: "./src/.env.development", 
        override: true
    }
)

export const config={
    PORT: process.env.PORT||8080,
    MONGO_URL: process.env.MONGO_URL, 
    DB_NAME: process.env.DB_NAME,
    SECRET: process.env.SECRET,
    RUN_MODE: process.env.RUN_MODE,
    GMAIL_PASS: process.env.GMAIL_PASS,
    ADMIN_EMAIL: process.env.ADMIN_EMAIL,
    ADMIN_PASS: process.env.ADMIN_PASS,
    ROOT_URL: process.env.ROOT_URL,
}