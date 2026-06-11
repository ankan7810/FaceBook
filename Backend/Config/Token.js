import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config({
    path: './.env'
}); 

export const genToken = async (id) => {
    try {
        const token = jwt.sign({ id }, process.env.JWT_SECRET,{
            expiresIn: "10d",
        });
        return token;
    } catch (error) {
        return resizeBy.status(500).json({ message: `Token generation error: ${error.message}` });
    }
};