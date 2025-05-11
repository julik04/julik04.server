const categoriesObj = {
  "Всё для татуировки": {
    Аксессуары: {},
    "Вазелин и масла": {},
    "Всё для ухода и заживления": {},
    "Иглы и типсы для татуировки": {},
    "Краска для татуировки": {
      "Allegory Ink": [
        {
          Название: "Краска для тату Allegory BLAK - Черный пигмент",
          Цена: "680",
          Изображение: "/assets/allegory1.jpg",
        },
        {
          Название: "Краска для тату Allegory WHITE - Белый пигмент",
          Цена: "680",
          Изображение: "/assets/allegory2.jpg",
        },
      ],
      "Eternal Ink": [],
      Intenze: [],
      Nocturnal: [
        {
          Название: "Набор красок для тату Nocturnal West Coast Blend - 3 шт",
          Цена: "2000",
          Изображение: "/assets/nocturnal.jpg",
        },
        {
          Название: "Краска для тату Nocturnal Shine White",
          Цена: "890",
          Изображение: "/assets/nocturnal1.jpg",
        },
        {
          Название: "Краска для тату Nocturnal Super Black",
          Цена: "890",
          Изображение: "/assets/nocturnal2.jpg",
        },
      ],
      "World Famous": [],
    },
    "Мыло и пенка": {},
    "Тату машинки": {},
  },

  "Всё для пирсинга": {
    "Инструменты для пирсинга": {},
    "Подставки под украшения": {},
    Украшения: {},
  },
  "Всё для студии": {
    "Дезинфекция и стерилизация": {},
    Лампы: {},
    Расходники: {},
  },
};

exports.seed = async function (knex) {
  // Delete all existing entries
  await knex("products").del();
  await knex("categories").del();

  async function processCategories(categories, parentId = null) {
    for (const [name, childrenOrProducts] of Object.entries(categories)) {
      // Insert category
      const [category] = await knex("categories")
        .insert({
          name,
          parent_id: parentId,
          created_at: new Date(),
          updated_at: new Date(),
        })
        .returning("id");

      // Check if current category has products (array) or subcategories (object)
      if (Array.isArray(childrenOrProducts)) {
        // Insert products if array is not empty
        if (childrenOrProducts.length > 0) {
          const products = childrenOrProducts.map((product) => ({
            title: product.Название,
            price: parseFloat(product.Цена),
            image: product.Изображение,
            category_id: category.id,
            created_at: new Date(),
            updated_at: new Date(),
          }));
          await knex("products").insert(products);
        }
      } else {
        // Process subcategories recursively
        await processCategories(childrenOrProducts, category.id);
      }
    }
  }

  // Start processing from root categories
  await processCategories(categoriesObj);
};
