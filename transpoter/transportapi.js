const bcrypt=require("bcrypt")
const {loginsection, DeliveryLocation, Order, SareDetails}=require("../models/mongomodel")




const usercreatepage=async(req,res)=>{
    try{
        console.log("📝 Signup Request Body:", req.body);
        
        const userdata=req.body;
        const userphoneno = String(userdata.phone || "").trim();
        const username = String(userdata.username || "").trim();

        if(!userphoneno || !username){
            console.log("❌ Missing required fields - phone:", userphoneno, "username:", username);
            return res.status(400).json({message:"Username and phone number are required"})
        }

        const userfind=await loginsection.findOne({phone:userphoneno})
        if(userfind){
            console.log("⚠️ User already exists with phone:", userphoneno);
            return res.status(400).json({message:"User with this phone number already exists"})
        }

        const addinguser=await loginsection.create({username, phone: userphoneno})
        console.log("✅ User created:", addinguser._id);

        // Set cookie BEFORE sending response
        res.cookie("uid", addinguser._id.toString(), {
            httpOnly: true,
            sameSite: "none",
            maxAge: 7 * 24 * 60 * 60 * 1000,
            secure: process.env.NODE_ENV === "production",
            path: "/"

        });

        res.status(200).json({  
            message:"Account created successfully",
            data:addinguser
        })
        
    }
    catch(err){
        console.error("❌ Signup Error:", err.message);
        console.error("Full Error:", err);
        return res.status(500).json({ error: err.message });
    }

}

const userloginpage=async(req,res)=>{
    try{
        const {phone}=req.body;
        
        if(!phone){
            return res.status(400).json({message:"Phone is required"})
        }

        const userfind=await loginsection.findOne({phone:phone})
        if(!userfind){
            return res.status(401).json({message:"User not found"})
        }

        // Set cookie BEFORE sending response
        res.cookie("uid", userfind._id.toString(), {
            httpOnly: true,
            sameSite: "none",
            maxAge: 7 * 24 * 60 * 60 * 1000,
            secure: process.env.NODE_ENV === "production",
            path: "/"

        });

        res.status(200).json({  
            message:"Login successful",
            data:userfind
        })
        
    }
    catch(err){
        return res.status(500).json({ error: err.message });
    }

}


const getuserorderdetails = async (req, res) => {
    try {
        const userId = req.cookies.uid;
        
        if (!userId) {
            return res.status(400).json({ message: "User ID not found in cookies" });
        }

        const userorders = await Order.find({ userid: userId }).sort({ createdAt: -1 });

        if (!userorders || userorders.length === 0) {
            return res.status(200).json({ data: [], message: "No orders found" });
        }

        res.status(200).json({ data: userorders });
    } catch (err) {
        console.error("❌ Get user order details error:", err.message);
        return res.status(500).json({ error: err.message });
    }
}


const useraddressdetails = async (req, res) => {
    try {
        console.log("📦 Save address:", req.body);
        const data = req.body || {};
        const requiredFields = ['name', 'mobile', 'village', 'mandal', 'district', 'state', 'pincode'];
        for (const field of requiredFields) {
            if (!data[field]) {
                return res.status(400).json({ message: `${field} is required` });
            }
        }
        // Basic format checks (optional)
        if (!/^\d{10}$/.test(String(data.mobile))) {
            return res.status(400).json({ message: 'Invalid mobile number' });
        }
        if (!/^\d{6}$/.test(String(data.pincode))) {
            return res.status(400).json({ message: 'Invalid pincode' });
        }

        const created = await DeliveryLocation.create(data);
        console.log("✅ Address saved:", created._id);
        res.status(201).json({ message: "Address saved", data: created });
    } catch (err) {
        console.error("❌ Save address error:", err.message);
        return res.status(500).json({ error: err.message });
    }
}

const createOrder = async (req, res) => {
    try {
        console.log("🧾 Create order:", req.body);
        const { cart, total, address, paymentMethod, userid } = req.body;
        const cookieUserId = req.cookies.uid;
        
        if (!Array.isArray(cart) || cart.length === 0) {
            return res.status(400).json({ message: "Cart is required" });
        }
        if (total == null) {
            return res.status(400).json({ message: "Total is required" });
        }

        let deliveryAddressId = null;
        let addressSnapshot = null;
        if (address) {
            if (address._id) {
                deliveryAddressId = address._id;
            } else if (typeof address === 'object') {
                const requiredFields = ['name', 'mobile', 'village', 'mandal', 'district', 'state', 'pincode'];
                for (const field of requiredFields) {
                    if (!address[field]) {
                        return res.status(400).json({ message: `${field} is required in address` });
                    }
                }
                if (!/^\d{10}$/.test(String(address.mobile))) {
                    return res.status(400).json({ message: 'Invalid mobile number in address' });
                }
                if (!/^\d{6}$/.test(String(address.pincode))) {
                    return res.status(400).json({ message: 'Invalid pincode in address' });
                }
                const savedAddr = await DeliveryLocation.create(address);
                deliveryAddressId = savedAddr._id;
            }
            addressSnapshot = address;
        } else {
            return res.status(400).json({ message: "Address is required" });
        }

        const orderData = {
            userid:cookieUserId, // Use userid from request body or cookies
            cart,
            total,
            deliveryAddress: deliveryAddressId,
            addressSnapshot,
            paymentMethod: paymentMethod || 'COD',
            status: 'pending'
        };

        const createdOrder = await Order.create(orderData);
        console.log("✅ Order created:", createdOrder._id, "for user:", orderData.userid);
        res.status(201).json({ message: "Order placed", data: createdOrder });
    } catch (err) {
        console.error("❌ Create order error:", err.message);
        return res.status(500).json({ error: err.message });
    }
}

const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find().populate('deliveryAddress').sort({ createdAt: -1 });
        res.status(200).json({ data: orders });
    } catch (err) {
        console.error("❌ Get orders error:", err.message);
        return res.status(500).json({ error: err.message });
    }
}

const createSareDetails = async (req, res) => {
    try {
        console.log("➕ Create sare details:", req.body);
        const { sarename, sareimg, sareprice, wrongprice = 0, qty = 1 } = req.body || {};
        if (!sarename || !sareimg || sareprice == null) {
            return res.status(400).json({ message: "sarename, sareimg and sareprice are required" });
        }
        const price = Number(sareprice);
        const quantity = Number(qty);
        if (Number.isNaN(price)) return res.status(400).json({ message: 'sareprice must be a number' });
        if (Number.isNaN(quantity)) return res.status(400).json({ message: 'qty must be a number' });

        const created = await SareDetails.create({ sarename, sareimg, sareprice: price, wrongprice: Number(wrongprice) || 0, qty: quantity });
        console.log("✅ Sare item created:", created._id);
        res.status(201).json({ message: "SareDetails created", data: created });
    } catch (err) {
        console.error("❌ Create sare error:", err.message);
        return res.status(500).json({ error: err.message });
    }
}

const getSareDetails = async (req, res) => {
    try {
        const saredetails = await SareDetails.find().sort({ createdAt: -1 });
        res.status(200).json({ data: saredetails });
    } catch (err) {
        console.error("❌ Get sare details error:", err.message);
        return res.status(500).json({ error: err.message });
    }
}

module.exports={
    usercreatepage,
    userloginpage,
    useraddressdetails,
    createOrder,
    getAllOrders,
    createSareDetails,
    getSareDetails,
    getuserorderdetails
}