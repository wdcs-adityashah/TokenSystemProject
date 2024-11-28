import { isValidEmail} from "../validator/userValidator.js";

export const validateEmail = (req,res,next) =>{
    const {email} = req.body;
    if(!email || !isValidEmail(email)){
        return res.status(400).json({message:"Invalid email format"});
    }
    next();
}