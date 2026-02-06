const express = require('express');
const app = express();
const port = process.env.PORT || 4000;
const cors=require("cors")
const {mongodb}=require("./dbconnect/mongoconnect")
const cookieParser=require('cookie-parser')

const controller=require("./controller/controller")
const allowedOrigins = [
  'http://localhost:5173',
  'https://sarekart.vercel.app'  // ✅ no trailing slash!
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('Blocked by CORS:', origin);  // 👈 log unallowed origins
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE',"PATCH"],
  credentials: true
}));
app.use(cookieParser())

app.use(express.json());

app.get("/", (req, res) => {
    res.json("this page is working perfectly");
});


app.use('/api/v1/sarekart',controller)
const start = async () => {
    try {
        await mongodb()
        app.listen(port, '0.0.0.0', () => {
            console.log(`App is listening on port ${port}`);
        });
    } catch (error) {
        console.log("Something went wrong:", error);
    }
};

start();
