import mongoose, {Schema} from "mongoose"

const userSchema = new Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true
    },
    credits:{
        type:Number,
        default:50,
        min:0
    },
    isCreditAvailable:{
        type:Boolean,
        default:true
    },
    notes:{
        type:[mongoose.Schema.Types.ObjectId],
        ref:"Notes",
        default:[]
    }
},{timestamps:true})


const User = mongoose.model("User",userSchema)
export default User