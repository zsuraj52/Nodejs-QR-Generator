import {registerUserService , createQRCodeForUser , scanQRCodeForGivenUserId}  from "../service/services.js";

export const registerUser = async (req, res) => {
    const { firstname, lastname, email, password } = req.body;
    console.log("firstname, lastname, email, password : ",firstname, lastname, email, password);
    try {
        if (!firstname || !lastname || !email || !password) {
            return res.status(400).send({"Status ": "FAILED" , "Message": "Please Provide All Credentials. "})
        }
        
        await registerUserService(firstname, lastname, email, password).then((response) => {
            if (response) {
                return res.status(201).send({ "Status ": "SUCCESS","Message":"User Registered Successfully! ", "Response ": response });
            }
        }).catch((e) => {
            if (e) {
                console.log("Error in registerUserService : ", e);
                return res.status(400).send({"Status ":"FAILED" , "Message ":"Something Went Wrong! " , "Response ":e})
            }
        })
    
    }
    catch (e) {
        console.log("Error in catch : ", e);
        res.status(400).send({"Status ":"FAILED" , "Message ":"Something Went Wrong! " , "Response ":e})
    }
}

export const createQRCode = async (req, res) => {
    const { user_id, asset_secret, asset_url } = req.body;
    console.log("user_id, asset_secret, asset_url : ", user_id, asset_secret, asset_url);

    try {
        if (!user_id || !asset_secret || !asset_url)
            return res.status(400).send({ "Status ": "FAILED", "Message": "Please Provide All Credentials For Generating QR Code." });
        
        await createQRCodeForUser(user_id, asset_secret, asset_url).then((result) => {
            console.log("Result ============> ",result);
            return res.status(201).send({ "Status ": "SUCCESS","Message":"QR Created Successfully! ", "Response ": result });
        }).catch((e) => {
            console.log("Error in createQRCode catch : ", e);
            return res.status(400).send({"Status ":"FAILED" , "Message ":"Something Went Wrong While Generating QR Code! " , "Response ":e})
        })       
        
    } catch (e) {
        console.log("Error in catch : ", e);
        res.status(400).send({"Status ":"FAILED" , "Message ":"Something Went Wrong! " , "Response ":e})

    }
    
}

export const scanQR = async (req, res) => {
    const { user_id, asset_secret } = req.body;
    console.log("user_id, asset_secret, : ", user_id, asset_secret);
    try {
        if (!user_id || !asset_secret)
            return res.status(400).send({ "Status ": "FAILED", "Message": "Please Provide All Credentials For Generating QR Code." });
        await scanQRCodeForGivenUserId(user_id, asset_secret).then((response) => {
            console.log("response : ", response);
            // console.log("{ "Status ": "SUCCESS","Message":"QR Created Successfully! ", "Response ": response }");
            return res.status(200).send(response);
        }).catch((e) => {
            console.log("Error in scanQRCodeForGivenUserId catch : ", e);
            return res.status(400).send({"Status ":"FAILED" , "Message ":"Something Went Wrong While Scanning QR Code! " , "Response ":e})
        })  
        
        
    } catch (e) {
        console.log("Error in catch : ", e);
        res.status(400).send({"Status ":"FAILED" , "Message ":"Something Went Wrong! " , "Response ":e})
    }

}