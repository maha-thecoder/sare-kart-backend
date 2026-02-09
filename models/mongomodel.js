const mongoose=require("mongoose")
const bcrypt=require('bcrypt')


const Loginschema=new mongoose.Schema({
    username:{type:String},
    phone:{type:String},
    

})



Loginschema.pre("save",async function () {
    if(!this.isModified("password")) return;
    this.password=await bcrypt.hash(this.password,10)
})



const loginsection=mongoose.model("loginsection",Loginschema)

const DeliveryLocationSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    mobile: { type: String, required: true, match: [/^\d{10}$/, 'Invalid mobile number'] },
    landmark: { type: String, default: '' },
    village: { type: String, required: true, trim: true },
    mandal: { type: String, required: true, trim: true },
    district: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    pincode: { type: String, required: true, match: [/^\d{6}$/, 'Invalid pincode'] },
}, { timestamps: true })

const DeliveryLocation = mongoose.model('DeliveryLocation', DeliveryLocationSchema)

const OrderSchema = new mongoose.Schema({
    userid:{type:String},
    cart: { type: Array, required: true },
    total: { type: Number, required: true },
    deliveryAddress: { type: mongoose.Schema.Types.ObjectId, ref: 'DeliveryLocation' },
    addressSnapshot: {
        name: { type: String },
        mobile: { type: String },
        landmark: { type: String, default: '' },
        village: { type: String },
        mandal: { type: String },
        district: { type: String },
        state: { type: String },
        pincode: { type: String }
    },
    paymentMethod: { type: String, enum: ['COD', 'ONLINE'], default: 'COD' },
    status: { type: String, default: 'pending' }
}, { timestamps: true })

const Order = mongoose.model('Order', OrderSchema)

const SareDetailsSchema = new mongoose.Schema({
    sarename: { type: String, required: true, trim: true },
    sareimg: { type: String, required: true, trim: true },
    sareprice: { type: Number, required: true },
    wrongprice: { type: Number, default: 0 },
    qty: { type: Number, default: 1 }
}, { timestamps: true })

const SareDetails = mongoose.model('SareDetails', SareDetailsSchema)


const narayanalogin=new mongoose.Schema({
    rollno:{ type: String, required: true, trim: true }
})

const clglogin=mongoose.model('clglogin',narayanalogin)
module.exports = {
    loginsection,
    DeliveryLocation,
    Order,
    SareDetails,
    clglogin
}