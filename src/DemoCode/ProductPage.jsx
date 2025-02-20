import { useParams } from "react-router-dom";

const ProductPage = () => {
    const { productTitle } = useParams();

    return (
        <div>
            <h1>Product: {decodeURIComponent(productTitle)}</h1>
        </div>
    );
};

export default ProductPage;
