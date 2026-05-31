import type { MenuGroup, VendorMap } from "./types";

export const vendors: VendorMap = {
  drinks: {
    id: "drinks",
    name: "水档",
    whatsapp: "60182925799", // CHANGED: real drinks stall WhatsApp
  },
  noodles: {
    id: "noodles",
    name: "面档",
    whatsapp: "60187794329", // CHANGED: real noodles stall WhatsApp
  },
  wok: {
    id: "wok",
    name: "如月小吃 / 煮炒档",
    whatsapp: "601155053361", // CHANGED: real wok stall WhatsApp
  },
  cheecheongfun: {
    id: "cheecheongfun",
    name: "广西卷肠粉档",
    whatsapp: "60187890583", // CHANGED: real chee cheong fun stall WhatsApp
  },
};

export const menuGroups: MenuGroup[] = [
  {
    title: "饮料",
    mount: "drinksMenu",
    items: [
      {
        id: "kopi",
        vendorId: "drinks",
        name: "咖啡",
        variants: [
          { id: "hot", label: "热", price: 280 },
          { id: "iced", label: "冰", price: 320 },
        ],
      },
      {
        id: "kopi-o",
        vendorId: "drinks",
        name: "咖啡乌",
        variants: [
          { id: "hot", label: "热", price: 250 },
          { id: "iced", label: "冰", price: 290 },
        ],
      },
      {
        id: "kopi-c",
        vendorId: "drinks",
        name: "咖啡C",
        variants: [
          { id: "hot", label: "热", price: 300 },
          { id: "iced", label: "冰", price: 340 },
        ],
      },
      {
        id: "teh",
        vendorId: "drinks",
        name: "奶茶",
        variants: [
          { id: "hot", label: "热", price: 280 },
          { id: "iced", label: "冰", price: 320 },
        ],
      },
      {
        id: "teh-o",
        vendorId: "drinks",
        name: "茶乌",
        variants: [
          { id: "hot", label: "热", price: 250 },
          { id: "iced", label: "冰", price: 290 },
        ],
      },
      {
        id: "teh-c",
        vendorId: "drinks",
        name: "茶C",
        variants: [
          { id: "hot", label: "热", price: 300 },
          { id: "iced", label: "冰", price: 340 },
        ],
      },
      {
        id: "milo",
        vendorId: "drinks",
        name: "美禄",
        variants: [
          { id: "hot", label: "热", price: 320 },
          { id: "iced", label: "冰", price: 360 },
        ],
      },
      {
        id: "horlicks",
        vendorId: "drinks",
        name: "好力克",
        variants: [
          { id: "hot", label: "热", price: 320 },
          { id: "iced", label: "冰", price: 360 },
        ],
      },
      {
        id: "limejuice",
        vendorId: "drinks",
        name: "青柠水",
        price: 380,
      },
      {
        id: "barley",
        vendorId: "drinks",
        name: "薏米水",
        price: 350,
      },
    ],
  },
  {
    title: "面档",
    mount: "noodlesMenu",
    items: [
      {
        id: "wantanmee",
        vendorId: "noodles",
        name: "云吞面",
        desc: "干捞/汤",
        variants: [
          { id: "dry", label: "干", price: 650 },
          { id: "soup", label: "汤", price: 650 },
        ],
      },
      {
        id: "kolohmee",
        vendorId: "noodles",
        name: "干捞面",
        price: 650,
      },
      {
        id: "kampuamee",
        vendorId: "noodles",
        name: "干盘面",
        price: 650,
      },
      {
        id: "curry-noodles",
        vendorId: "noodles",
        name: "咖喱面",
        price: 750,
      },
      {
        id: "tomyam-noodles",
        vendorId: "noodles",
        name: "冬炎面",
        price: 750,
      },
      {
        id: "fish-noodles",
        vendorId: "noodles",
        name: "鱼片面",
        variants: [
          { id: "dry", label: "干", price: 700 },
          { id: "soup", label: "汤", price: 700 },
        ],
      },
      {
        id: "prawn-noodles",
        vendorId: "noodles",
        name: "虾面",
        price: 750,
      },
    ],
  },
  {
    title: "煮炒",
    mount: "wokMenu",
    items: [
      {
        id: "fried-rice-chicken",
        vendorId: "wok",
        name: "鸡肉炒饭",
        price: 850,
      },
      {
        id: "fried-rice-beef",
        vendorId: "wok",
        name: "牛肉炒饭",
        price: 900,
      },
      {
        id: "fried-rice-seafood",
        vendorId: "wok",
        name: "海鲜炒饭",
        price: 950,
      },
      {
        id: "fried-kueyteow-chicken",
        vendorId: "wok",
        name: "鸡肉炒粿条",
        price: 850,
      },
      {
        id: "fried-kueyteow-beef",
        vendorId: "wok",
        name: "牛肉炒粿条",
        price: 900,
      },
      {
        id: "fried-kueyteow-seafood",
        vendorId: "wok",
        name: "海鲜炒粿条",
        price: 950,
      },
      {
        id: "char-kueyteow",
        vendorId: "wok",
        name: "炒粿条",
        price: 800,
      },
      {
        id: "hokkien-mee",
        vendorId: "wok",
        name: "福建面",
        price: 850,
      },
    ],
  },
  {
    title: "广西卷肠粉",
    mount: "cheecheongfunMenu",
    items: [
      {
        id: "ccf-plain",
        vendorId: "cheecheongfun",
        name: "斋肠粉",
        price: 450,
      },
      {
        id: "ccf-egg",
        vendorId: "cheecheongfun",
        name: "鸡蛋肠粉",
        price: 550,
      },
      {
        id: "ccf-char-siew",
        vendorId: "cheecheongfun",
        name: "叉烧肠粉",
        price: 650,
      },
      {
        id: "ccf-prawn",
        vendorId: "cheecheongfun",
        name: "鲜虾肠粉",
        price: 700,
      },
      {
        id: "ccf-mixed",
        vendorId: "cheecheongfun",
        name: "混合肠粉",
        desc: "鸡蛋+叉烧",
        price: 750,
      },
      {
        id: "ccf-special",
        vendorId: "cheecheongfun",
        name: "特别肠粉",
        desc: "鸡蛋+叉烧+鲜虾",
        price: 850,
      },
    ],
  },
];

export const FACEBOOK_URL = "https://www.facebook.com/share/1B5rinHnPJ/";
