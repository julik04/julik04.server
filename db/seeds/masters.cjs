exports.seed = function (knex) {
  const mastersData = [
    {
      name: "Канье Петров",
      experience: 7,
      image: "/assets/img-1.jpg",
      resume: "Резюме Канье Петрова: ляляляляя",
      gallery:
        '["/assets/img-1.jpg", "/assets/img-1.jpg","/assets/img-1.jpg","/assets/img-1.jpg"]',
    },
    {
      name: "Фар Куад",
      experience: 3,
      image: "/assets/img-2.png",
      resume: "Резюме Фар Куада: ляляляляя",
      gallery:
        '["/assets/img-2.png", "/assets/img-2.png","/assets/img-2.png","/assets/img-2.png"]',
    },
    {
      name: "Марио Марьев",
      experience: 20,
      image: "/assets/img-3.jpg",
      resume: "mariooo",
      gallery:
        '["/assets/img-3.jpg", "/assets/img-3.jpg","/assets/img-3.jpg","/assets/img-3.jpg"]',
    },
    {
      name: "Петр Котов",
      experience: 2,
      image: "/assets/img-4.jpg",
      resume: "mya",
      gallery:
        '["/assets/img-4.jpg", "/assets/img-4.jpg","/assets/img-4.jpg","/assets/img-4.jpg"]',
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
