import mongoose from "mongoose"
import mongoosePaginate from "mongoose-paginate-v2"

const productsCollection = "products";
const productsSchema = new mongoose.Schema(
    {
        title: String,
        description: String,
        code: String,
        price: Number,
        status: Boolean,
        stock: Number,
        category: String,
        owner: String,
        thumbnails: Array,
    },
    {
        timestamps:true
    }
)

productsSchema.plugin(mongoosePaginate);
export const productsModel = mongoose.model(productsCollection,productsSchema);

