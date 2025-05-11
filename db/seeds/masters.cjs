exports.seed = function (knex) {
  const mastersData = [
    {
      name: "Канье Петров",
      experience: 7,
      image: "/assets/img-1.jpg",
      resume: "Резюме Канье Петрова: ляляляляя",
      gallery: JSON.stringify([
        "/assets/img-1.jpg",
        "/assets/img-1.jpg",
        "/assets/img-1.jpg",
        "/assets/img-1.jpg",
      ]),
    },
    {
      name: "Фар Куад",
      experience: 3,
      image: "/assets/img-2.jpg",
      resume: "Резюме Фар Куада: ляляляляя",
      gallery: JSON.stringify([
        "/assets/img-2.jpg",
        "/assets/img-2.jpg",
        "/assets/img-2.jpg",
        "/assets/img-2.jpg",
      ]),
    },
    {
      name: "Марио Марьев",
      experience: 20,
      image: "/assets/img-3.jpg",
      resume: null,
      gallery: null,
    },
    {
      name: "Петр Котов",
      experience: 2,
      image: "/assets/img-4.jpg",
      resume: null,
      gallery: null,
    },
    {
      name: "Жанна Жабова",
      experience: 4,
      image: "/assets/img-5.jpg",
      resume: null,
      gallery: null,
    },
    {
      name: "Шрек Шмеков",
      experience: 22,
      image: "/assets/img-6.jpg",
      resume: null,
      gallery: null,
    },
    {
      name: "Ривай Титанов",
      experience: 10,
      image: "/assets/img-7.jpg",
      resume: null,
      gallery: null,
    },
    {
      name: "Сейлор Мун",
      experience: 5,
      image: "/assets/img-8.jpg",
      resume: null,
      gallery: null,
    },
  ];

  return knex("masters")
    .del()
    .then(() => knex("masters").insert(mastersData));
};
