export const categorizedProducts = (products) => {
    return products.reduce((acc, product) => {
        const category = product.category_name;

        // console.log({ product })

        // Create category array if it doesn't exist
        if (!acc[category]) {
            acc[category] = [];
        }

        // Push formatted product to its category
        acc[category].push({
            id: product.id,
            Название: product.title,
            Цена: product.price.split('.')[0], // Remove .00 from price
            Изображение: product.image
        });

        return acc;
    }, {});
}