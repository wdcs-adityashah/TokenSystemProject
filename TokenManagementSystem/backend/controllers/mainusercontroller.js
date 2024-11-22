export const ValidateCredentials = async(req,res)=>{
       const {password,email} = req.body;
       if(password === "aadi2781" && email === "admin@gmail.com"){
        return res.status(200).json({message:"Login successfull"})
       }
       else{
        return res.status(400).json({message:"Invalid Credentials"})
       }
}