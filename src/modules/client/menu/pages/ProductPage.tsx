import { useParams } from "react-router-dom";
import Item from "../components/Item";

interface ProductType {
    id: string;
    name: string;
    description: string;
    content: string;
    minPrice: number;
    maxPrice: number;
}

// function ProductPage({ id, name, description, content, minPrice, maxPrice }: ProductType) {
//     const slug = useParams();

//     return (
//         <div>
//             <div>
//                 <h3>{name}</h3>
//                 <h5>{minPrice}</h5>
//                 <h5>Size M: {minPrice}</h5>
//                 <h5>Size L: {maxPrice}</h5>
//                 <p>{description} <span>{content}</span></p>
//             </div>
//             <div>
//                 <h1>Sản phẩm liên quan</h1>
//                 <div>
//                     <Item 
//                     id={id}
//                     name={name}
//                     price={minPrice}
//                 />
//                 </div>
//             </div>
//         </div>
//     )
// }

// export default ProductPage

function ProductPage() {

    return (
        <div>
            <div>
                <h3>name</h3>
                <h5>minPrice</h5>
                <h5>Size M: minPrice</h5>
                <h5>Size L: maxPrice</h5>
                <p>description <span>content</span></p>
            </div>
            <div>
                <h1>Sản phẩm liên quan</h1>
                <div>
                    <Item 
                    id="1"
                    name="name"
                    price={1000}
                />
                </div>
            </div>
        </div>
    )
}

export default ProductPage