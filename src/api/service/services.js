import connection from '../../database/dbconfig.js';
import QRCode from 'qrcode';
import bcryptjs from 'bcryptjs';

async function validateEmail(email) {
    let emailRegex = /^[-!#$%&'*+\/0-9=?A-Z^_a-z{|}~](\.?[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~])*@[a-zA-Z0-9](-*\.?[a-zA-Z0-9])*\.[a-zA-Z](-?[a-zA-Z0-9])+$/;
    try {
        if (!email)
            return false;
        if (email.length > 254)
            return false;
        let valid = emailRegex.test(email);
        if (!valid)
            return false;
        let parts = email.split("@");
        if (parts[0].length > 64)
            return false;
        let domainParts = parts[1].split(".");
        if (domainParts.some(function (part) { return part.length > 63; }))
            return false;
        return true;
    }
    catch (e) {
        console.log("Error in validateEmail Function : ",e);
        console.log(e.message);
        return (e.message);
    }

}

async function findUser(id) {
    return await new Promise(async (resolve, reject) => {
        try {
            return connection.query(`select * from user where id = ${id}`, async function (error, results, fields) {
                if (results.length) {
                    resolve (true);
                } else {
                    reject ('No User Found For Given User-id , Please Provide valid id or Register Yourself! ');
                }
            })
        } catch (e) {
            console.log("Error in findUser , ", e.message);
            throw (e);
        }
    })
}

async function findQRByAssetSecret(asset_url) {
    console.log("asset_url value: ",asset_url);
    return await new Promise( async (resolve, reject) => {
        try {
            return connection.query(`select * from user_qr_codes where asset_url = ${JSON.stringify(asset_url)}`, function (error, results, fields) {
                console.log("asset_url : ",results);
                if (results.length) {
                    reject('Qr Code For Given asset_url Already Exist! ')
                } else {
                    resolve(true);
                }
            })
        } catch (e) {
            console.log("Error in findQRByAssetSecret : ", e);
            throw (e);
        }
    })
}



export const registerUserService = async (firstname, lastname, email, password) => {
    try {
        console.log(typeof email);
        let paswordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{6,20}$/;
        if (!password.match(paswordRegex)) {
            console.log("Your password must contain at least one uppercase, one numeric digit and a special character");
            throw ("Your password must contain at least one uppercase, one numeric digit and a special character");
        }
        let res = await validateEmail(email);
        if (!res) {
            console.log({ "Status": "FAILED", "Response": "E-mail is Not valid, Please Enter Valid Email Id" });
            throw("E-mail is Not valid, Please Enter Valid Email Id");
        }
        if (res) {
            // password = bcryptjs.hashSync(password, 10);
            // console.log("Hashed pass : ", password);
            
            return await new Promise( async(resolve, reject) => {
                return connection.query(`SELECT * FROM user where email = ${JSON.stringify(email)}`, async function (error, results, fields) {
                    try {
                        console.log("result : ",results );
                    if (results.length) {
                        console.log("User For Given E-mail id Already Exist. Please Enter Another E-mail");
                        reject("User For Given E-mail id Already Exist. Please Enter Another E-mail");
                    }
                    else { 
                        return connection.query(`INSERT INTO user (firstname, lastname, email, password ) VALUES ( ${JSON.stringify(firstname)} , ${JSON.stringify(lastname)} , ${JSON.stringify(email)} , ${JSON.stringify(password)} )`, function (error, results, fields) {
                            if (results) {
                                console.log("Res : ",results);
                                console.log("Data Inserted Successfully");
                                resolve({ "user-id":results.insertId });
                            }
                        })
                    }
                    } catch (e) {
                        console.log("error :", e);
                        throw (e);
                    }  
                })
            })   
        }
    } catch (e) {
        console.log("Error in catch : ", e);
        throw (e);
    }

}

export const createQRCodeForUser = async (user_id, asset_secret, asset_url) => {
    let user = await findUser(user_id);
    console.log("User : ", user);
    let getVerification = await findQRByAssetSecret(asset_url);
    console.log("getVerification : ",getVerification);
    if (user == false)
        throw ("No User Found For Given User-id , Please Provide valid id or Register Yourself! ");
    else {
        if (getVerification == true) {
            console.log("User Found.........");
            let url = await QRCode.toDataURL(asset_url);
            let asset_qr = url;
            return await new Promise(async (resolve, reject) => {
                try {
                    return connection.query(`INSERT INTO user_qr_codes (user_id , asset_secret , asset_url , asset_qr) VALUES (${user_id} , ${JSON.stringify(asset_secret)} , ${JSON.stringify(asset_url)} , ${JSON.stringify(asset_qr)} )`, function (error, results, fields) {
                        if (error) {
                            console.log("Error: ", error.message);
                            reject(error.message);
                        }
                        if (results) {
                            console.log("QR Created Successfully");
                            console.log("Res : ", results);
                            resolve({ "qr-code_id": results.insertId });
                        }
                })
                } catch (e) {
                    console.log("Error while creating qr : ", e.message);
                    throw (e);
                }
                
            })
        }
    }
}

export const scanQRCodeForGivenUserId = async (user_id, asset_secret) => {
    let user = await findUser(user_id);
    if (user == false) {
        throw ("No User Found For Given User-id , Please Provide valid id or Register Yourself! ");
    }
    else {
        return await new Promise((resolve, reject) => {
            return connection.query(`select * from user_qr_codes where user_id = ${user_id}`, async function (error, results, fields) {
                if (error) {
                console.log("Error : ",error);
                }
                if (results) {
                    // console.log("Results :",results);
                    let obj = results.filter((item) => {
                        return item.asset_secret == asset_secret
                    });
                    console.log("obj : ", obj[0]);
                    let qr = await QRCode.toString(obj[0].asset_url);
                    console.log("qr =============>" ,qr);
                    resolve (qr);
                }
            })
        })
    }
}