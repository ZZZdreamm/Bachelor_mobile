import { FoundPlace } from "@/models/FoundPlace";


export const MockedFoundPlaces: FoundPlace[] = [
  {
    id: 1,
    name: "Pałac Kultury i Nauki",
    totalHistoricPeriodModels: 3,
    isFound: true,
    currentImage: {
      image: 'https://picsum.photos/seed/palace1/300/200',
      date: new Date('2023-06-15'),
    },
    oldImages: [
      {
        image: 'https://picsum.photos/seed/palace1-old1/300/200',
        date: new Date('1980-05-10'),
      },
      {
        image: 'https://picsum.photos/seed/palace1-old2/300/200',
        date: new Date('1955-07-22'),
      },
    ],
    location: {
      latitude: 52.2319,
      longitude: 21.0061,
    },
  },
  {
    id: 2,
    name: "Zamek Królewski w Krakowie",
    totalHistoricPeriodModels: 4,
    isFound: true,
    currentImage: {
      image: 'https://picsum.photos/seed/castle2/300/200',
      date: new Date('2024-01-20'),
    },
    oldImages: [
      {
        image: 'https://picsum.photos/seed/castle2/300/200',
        date: new Date('1900-03-15'),
      },
      {
        image: 'https://picsum.photos/seed/castle2-old2/300/200',
        date: new Date('1850-08-30'),
      },
    ],
    location: {
      latitude: 50.0547,
      longitude: 19.9353,
    },
  },
  {
    id: 3,
    name: "Wilanów Palace",
    totalHistoricPeriodModels: 12,
    isFound: false,
    currentImage: {
      image: 'https://picsum.photos/seed/palace3/300/200',
      date: new Date('2022-11-05'),
    },
    oldImages: [
      {
        image: 'https://picsum.photos/seed/palace3-old1/300/200',
        date: new Date('1920-04-12'),
      },
    ],
    location: {
      latitude: 52.1651,
      longitude: 21.0905,
    },
  },
  {
    id: 4,
    name: "Łazienki Palace",
    totalHistoricPeriodModels: 7,
    isFound: true,
    currentImage: {
      image: 'https://picsum.photos/seed/palace4/300/200',
      date: new Date('2023-09-10'),
    },
    oldImages: [
      {
        image: 'https://picsum.photos/seed/palace4-old1/300/200',
        date: new Date('1890-06-25'),
      },
      {
        image: 'https://picsum.photos/seed/palace4-old2/300/200',
        date: new Date('1820-09-18'),
      },
    ],
    location: {
      latitude: 52.2149,
      longitude: 21.0352,
    },
  },
  {
    id: 5,
    name: "Malbork Castle",
    totalHistoricPeriodModels: 8,
    isFound: true,
    currentImage: {
      image: 'https://picsum.photos/seed/castle5/300/200',
      date: new Date('2024-03-12'),
    },
    oldImages: [
      {
        image: 'https://picsum.photos/seed/castle5-old1/300/200',
        date: new Date('1910-07-14'),
      },
      {
        image: 'https://picsum.photos/seed/castle5-old2/300/200',
        date: new Date('1880-12-01'),
      },
    ],
    location: {
      latitude: 54.0397,
      longitude: 19.0282,
    },
  },
  {
    id: 6,
    name: "Wawel Cathedral",
    totalHistoricPeriodModels: 5,
    isFound: true,
    currentImage: {
      image: 'https://picsum.photos/seed/cathedral6/300/200',
      date: new Date('2023-12-01'),
    },
    oldImages: [
      {
        image: 'https://picsum.photos/seed/cathedral6-old1/300/200',
        date: new Date('1935-02-20'),
      },
    ],
    location: {
      latitude: 50.0545,
      longitude: 19.9355,
    },
  },
];