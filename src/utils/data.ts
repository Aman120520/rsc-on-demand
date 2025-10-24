import {
  DIAMOND,
  DIAMOND_ACTIVE,
  DIAMOND_SELECTED_SM,
  DIAMOND_SM,
  HANGER,
  HANGER_ACTIVE,
  HANGER_SELECTED_SM,
  HANGER_SM,
  IRON_BOX,
  IRON_BOX_ACTIVE,
  IRON_BOX_SELECTED_SM,
  IRON_BOX_SM,
  SHOES,
  SHOES_ACTIVE,
  SHOES_SELECTED_SM,
  SHOES_SM,
  STEAM_IRON,
  STEAM_IRON_ACTIVE,
  STEAM_IRON_SELECTED_SM,
  STEAM_IRON_SM,
  STORAGE,
  STORAGE_ACTIVE,
  STORAGE_SLECTED_SM,
  STORAGE_SM,
  T_SHIRT,
  T_SHIRT_ACTIVE,
  T_SHIRT_SELECTED_SM,
  T_SHIRT_SM,
} from "../icons/svg";

const localServiceData = [
  {
    id: 0,
    title: "Dry Cleaning",
    xml: T_SHIRT,
    activeXml: T_SHIRT_ACTIVE,
    activeIcon: T_SHIRT_SELECTED_SM,
    inActiveIcon: T_SHIRT_SM,
    serviceCode: "DC",
    description:
      "For Premium DryCleaned Wardrobe Refresh - Be it your Regular, Party, Formals, Occational etc, Packed Exquisitely",
  },
  {
    id: 1,
    title: "Premium Laundry - Wash & Iron",
    xml: DIAMOND,
    activeXml: DIAMOND_ACTIVE,
    activeIcon: DIAMOND_SELECTED_SM,
    inActiveIcon: DIAMOND_SM,
    serviceCode: "PWSI",
    description:
      "For Premium Laundry Experience which needs extra care - Branded Clothing Washed, Steam Ironed, and Packed Exquisitely",
  },
  {
    id: 2,
    title: "Laundry - Wash & Steam Iron",
    xml: IRON_BOX,
    activeXml: IRON_BOX_ACTIVE,
    activeIcon: IRON_BOX_SELECTED_SM,
    inActiveIcon: IRON_BOX_SM,
    serviceCode: "IO",
    description:
      "For Everyday Laundry which required Ironing - Shirt, Pants, Tops etc Washed and Steam Ironed",
  },
  // {
  //   id: 3,
  //   title: "Laundry - Wash & Fold",
  //   xml: HANGER,
  //   activeXml: HANGER_ACTIVE,
  //   activeIcon: HANGER_SELECTED_SM,
  //   inActiveIcon: HANGER_SM,
  //   serviceCode: "WF",
  //   description:
  //     "For Everyday Laundry - Bedsheet, Towels, Households etc. Washed and Folded",
  // },
  // {
  //   id: 4,
  //   title: "Shoe Cleaning",
  //   xml: SHOES,
  //   activeXml: SHOES_ACTIVE,
  //   activeIcon: SHOES_SELECTED_SM,
  //   inActiveIcon: SHOES_SM,
  //   serviceCode: "SC",
  //   description:
  //     "Professional Shoes Cleaning - Sneakers, Sports Shoes, Canvas etc",
  // },
  {
    id: 5,
    title: "Steam Iron",
    xml: STEAM_IRON,
    activeXml: STEAM_IRON_ACTIVE,
    activeIcon: STEAM_IRON_SELECTED_SM,
    inActiveIcon: STEAM_IRON_SM,
    serviceCode: "SI",
    description: "Already Cleaned but needs Ironing",
  },
  {
    id: 6,
    title: "Storage",
    xml: STORAGE,
    activeXml: STORAGE_ACTIVE,
    activeIcon: STORAGE_SLECTED_SM,
    inActiveIcon: STORAGE_SM,
    serviceCode: "ST",
    description: "",
  },
  {
    id: 7,
    title: "Laundry - Wash & Fold",
    xml: HANGER,
    activeXml: HANGER_ACTIVE,
    activeIcon: HANGER_SELECTED_SM,
    inActiveIcon: HANGER_SM,
    serviceCode: "Wash and Fold",
    description: "",
  },
  {
    id: 8,
    title: "10kg Bag",
    xml: HANGER,
    activeXml: HANGER_ACTIVE,
    activeIcon: HANGER_SELECTED_SM,
    inActiveIcon: HANGER_SM,
    serviceCode: "10k",
    description:
      "Ideal for light laundry needs, the 10kg bag is perfect for quick washes at just $35. Hassle-free cleaning!",
  },
  {
    id: 9,
    title: "15kg Bag",
    xml: HANGER,
    activeXml: HANGER_ACTIVE,
    activeIcon: HANGER_SELECTED_SM,
    inActiveIcon: HANGER_SM,
    serviceCode: "15k",
    description:
      "Great for medium-sized laundry loads, the 15kg bag ensures your clothes are washed and folded perfectly for $50!",
  },
  {
    id: 10,
    title: "20Kg Bag",
    xml: HANGER,
    activeXml: HANGER_ACTIVE,
    activeIcon: HANGER_SELECTED_SM,
    inActiveIcon: HANGER_SM,
    serviceCode: "20k",
    description:
      "Designed for larger laundry needs, the 20kg bag offers maximum value and convenience at $65. Perfect for families or bulk washing!",
  },
  {
    id: 11,
    title: "Clean and press",
    xml: HANGER,
    activeXml: HANGER_ACTIVE,
    activeIcon: HANGER_SELECTED_SM,
    inActiveIcon: HANGER_SM,
    serviceCode: "CP",
    description: `Laundry and dry-cleaning services customized Cleaning, 
Dry clean or wash? Leave the decision to our laundry experts as we have more than 50+ cleaning programs to choose from depending on your fabrics.
`,
  },
  {
    id: 12,
    title: "Press Only",
    xml: HANGER,
    activeXml: HANGER_ACTIVE,
    activeIcon: HANGER_SELECTED_SM,
    inActiveIcon: HANGER_SM,
    serviceCode: "P",
    description: `Perfect for items that only need pressing 
Iron clothes and fabrics using steam only. Steam ironing is safe on all fabrics.
`,
  },
  {
    id: 13,
    title: "Wash & Fold",
    xml: HANGER,
    activeXml: HANGER_ACTIVE,
    activeIcon: HANGER_SELECTED_SM,
    inActiveIcon: HANGER_SM,
    serviceCode: "WF",
    description: `Perfect for your casual and sport wear.
Fill the bag up to 15 pcs with any item that is suitable for 40°C wash and tumble dry.
Pressing not included
`,
  },
  {
    id: 14,
    title: "Home Care",
    xml: HANGER,
    activeXml: HANGER_ACTIVE,
    activeIcon: HANGER_SELECTED_SM,
    inActiveIcon: HANGER_SM,
    serviceCode: "MO",
    description: `Fill the bag with up to 15 items home linens and we will have them perfectly cleaned and pressed
65 AED per bag
`,
  },
  {
    id: 15,
    title: "Shoe & Bag Care",
    xml: HANGER,
    activeXml: HANGER_ACTIVE,
    activeIcon: HANGER_SELECTED_SM,
    inActiveIcon: HANGER_SM,
    serviceCode: "SC",
    description: `Our basic package includes:
Cleaning
•⁠  ⁠Polishing
•⁠  ⁠Leather Conditioning
Odour Removal & Sanitization
Shoe polishing will need 2 days
Shoe basic cleaning will need 4 days.
Bag cleaning will need 4 days.
Shoe and Bag Colour restoration & repair services will need 7-10 days.`,
  },
];

export const LOCAL_DATA = {
  localServiceData,
};
