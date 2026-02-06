const express=require("express")
const router=express.Router()
const {usercreatepage,userloginpage,useraddressdetails,createOrder,getAllOrders,createSareDetails,getSareDetails,
    getuserorderdetails,authorization
}=require("../transpoter/transportapi")


router.route('/signup').post(usercreatepage)
router.route('/login').post(userloginpage)
router.route('/useradress').post(useraddressdetails)
router.route("/createorder").post(createOrder)
router.route('/orders').get(getAllOrders)
router.route('/saredetails').get(getSareDetails)
router.route('/saredetails').post(createSareDetails)
router.route('/user-order-details').get(getuserorderdetails)
router.route("/auth").get(authorization)

module.exports=router