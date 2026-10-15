import mongoose from "mongoose";
import { Location } from "../lib/models/Location";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load .env from the root of apps/web
dotenv.config({ path: path.resolve(__dirname, "../.env") });
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/crime-hotspot-mvp";

type AreaSeed = { name: string; city: string; coordinates: [number, number] }; // [lng, lat]
type StateSeed = { state: string; areas: AreaSeed[] };

// Every state in Nigeria (plus FCT) with several areas per state, so the
// state -> area cascading dropdowns work nationwide, not just for Calabar.
const stateSeeds: StateSeed[] = [
  {
    state: "Abia",
    areas: [
      { name: "Umuahia North", city: "Umuahia", coordinates: [7.495, 5.525] },
      { name: "Umuahia South", city: "Umuahia", coordinates: [7.45, 5.4833] },
      { name: "Ariaria International Market", city: "Aba", coordinates: [7.3319, 5.1245] },
      { name: "Aba North", city: "Aba", coordinates: [7.35, 5.1333] },
      { name: "Aba South", city: "Aba", coordinates: [7.3666, 5.1066] },
      { name: "Ohafia", city: "Ohafia", coordinates: [7.8833, 5.6167] },
      { name: "Arochukwu", city: "Arochukwu", coordinates: [8.0833, 5.6267] },
      { name: "Isuochi", city: "Isuikwuato", coordinates: [7.6333, 5.7833] },
    ],
  },
  {
    state: "Adamawa",
    areas: [
      { name: "Yola North", city: "Yola", coordinates: [12.922, 10.17] },
      { name: "Yola South", city: "Yola", coordinates: [12.914, 10.147] },
      { name: "Jimeta", city: "Jimeta", coordinates: [12.4634, 10.1574] },
      { name: "Mubi North", city: "Mubi", coordinates: [13.276, 10.2676] },
      { name: "Mubi South", city: "Mubi", coordinates: [13.2, 10.2] },
      { name: "Numan", city: "Numan", coordinates: [12.0341, 9.8642] },
      { name: "Ganye", city: "Ganye", coordinates: [12.0333, 8.4333] },
      { name: "Song", city: "Song", coordinates: [12.3167, 10.5833] },
    ],
  },
  {
    state: "Akwa Ibom",
    areas: [
      { name: "Uyo Central", city: "Uyo", coordinates: [7.9327, 5.0525] },
      { name: "Ewet Housing", city: "Uyo", coordinates: [7.9242, 5.0233] },
      { name: "Oron Road", city: "Uyo", coordinates: [7.9348, 4.9854] },
      { name: "Eket", city: "Eket", coordinates: [8.1273, 4.6423] },
      { name: "Oron", city: "Oron", coordinates: [8.1333, 4.8333] },
      { name: "Ikot Ekpene", city: "Ikot Ekpene", coordinates: [7.6078, 5.1819] },
      { name: "Abak", city: "Abak", coordinates: [7.8667, 5.1167] },
      { name: "Etinan", city: "Etinan", coordinates: [7.85, 4.7833] },
    ],
  },
  {
    state: "Anambra",
    areas: [
      { name: "Awka North", city: "Awka", coordinates: [7.0722, 6.2125] },
      { name: "Awka South", city: "Awka", coordinates: [7.0667, 6.1833] },
      { name: "Onitsha North", city: "Onitsha", coordinates: [6.8018, 6.1453] },
      { name: "Onitsha South", city: "Onitsha", coordinates: [6.7833, 6.1333] },
      { name: "Upper Iweka", city: "Onitsha", coordinates: [6.8231, 6.1428] },
      { name: "Nnewi North", city: "Nnewi", coordinates: [6.91, 6.01] },
      { name: "Ogidi", city: "Idemili", coordinates: [6.85, 6.15] },
      { name: "Ekwulobia", city: "Aguata", coordinates: [7.05, 6.05] },
      { name: "Ihiala", city: "Ihiala", coordinates: [6.7833, 6.0167] },
    ],
  },
  {
    state: "Bauchi",
    areas: [
      { name: "Bauchi LGA", city: "Bauchi", coordinates: [9.8442, 10.3158] },
      { name: "Jos Road", city: "Bauchi", coordinates: [9.86, 10.3] },
      { name: "Azare", city: "Azare", coordinates: [10.1883, 11.6733] },
      { name: "Misau", city: "Misau", coordinates: [10.3667, 11.3167] },
      { name: "Jama'are", city: "Jama'are", coordinates: [9.9436, 11.6561] },
      { name: "Dass", city: "Dass", coordinates: [9.5167, 10.0] },
      { name: "Katagum", city: "Katagum", coordinates: [10.3333, 11.25] },
    ],
  },
  {
    state: "Bayelsa",
    areas: [
      { name: "Yenagoa LGA", city: "Yenagoa", coordinates: [6.101, 4.9267] },
      { name: "Opolo", city: "Yenagoa", coordinates: [6.0833, 4.8167] },
      { name: "Kaiama", city: "Kaiama", coordinates: [6.3, 4.9667] },
      { name: "Sagbama", city: "Sagbama", coordinates: [6.0667, 4.85] },
      { name: "Brass", city: "Brass", coordinates: [6.25, 4.3167] },
      { name: "Southern Ijaw", city: "Oporoma", coordinates: [5.9167, 4.4167] },
    ],
  },
  {
    state: "Benue",
    areas: [
      { name: "Makurdi North", city: "Makurdi", coordinates: [8.5226, 7.7419] },
      { name: "North Bank", city: "Makurdi", coordinates: [8.55, 7.7833] },
      { name: "Otukpo", city: "Otukpo", coordinates: [8.1333, 7.1] },
      { name: "Gboko", city: "Gboko", coordinates: [9.0, 7.3333] },
      { name: "Katsina-Ala", city: "Katsina-Ala", coordinates: [9.1333, 7.1667] },
      { name: "Adikpo", city: "Ukum", coordinates: [9.0667, 6.9167] },
      { name: "Igumale", city: "Ado", coordinates: [8.2667, 7.0833] },
    ],
  },
  {
    state: "Borno",
    areas: [
      { name: "Maiduguri Metropolitan", city: "Maiduguri", coordinates: [13.1476, 11.8406] },
      { name: "Gwange", city: "Maiduguri", coordinates: [13.1578, 11.8147] },
      { name: "Bulabulin", city: "Maiduguri", coordinates: [13.1167, 11.8333] },
      { name: "Bama", city: "Bama", coordinates: [13.6833, 11.5167] },
      { name: "Monguno", city: "Monguno", coordinates: [13.6139, 12.6711] },
      { name: "Biu", city: "Biu", coordinates: [12.1833, 10.6333] },
      { name: "Jere", city: "Jere", coordinates: [13.15, 11.7] },
      { name: "Konduga", city: "Konduga", coordinates: [13.3, 11.65] },
    ],
  },
  {
    state: "Cross River",
    areas: [
      { name: "Calabar Municipal", city: "Calabar", coordinates: [8.3286, 4.9583] },
      { name: "Calabar South", city: "Calabar", coordinates: [8.3167, 4.9333] },
      { name: "Ikom Urban", city: "Ikom", coordinates: [8.7167, 5.9667] },
      { name: "Ugep Central", city: "Ugep", coordinates: [8.0833, 5.8087] },
      { name: "Ogoja Main", city: "Ogoja", coordinates: [8.7969, 6.6598] },
      { name: "Obudu Center", city: "Obudu", coordinates: [9.1667, 6.6667] },
      { name: "Akamkpa Station", city: "Akamkpa", coordinates: [8.3667, 5.3167] },
      { name: "Boki Hub", city: "Boki", coordinates: [8.9167, 6.25] },
      { name: "Yala Junction", city: "Yala", coordinates: [8.6333, 6.7] },
      { name: "Biase Market", city: "Biase", coordinates: [8.0833, 5.5667] },
      { name: "Abi Station", city: "Abi", coordinates: [7.9667, 5.8833] },
      { name: "Yakurr Plaza", city: "Yakurr", coordinates: [8.1167, 5.8167] },
      { name: "Obubra Checkpoint", city: "Obubra", coordinates: [8.3333, 6.0833] },
      { name: "Etung Gate", city: "Etung", coordinates: [8.7833, 5.9167] },
      { name: "Odukpani Road", city: "Odukpani", coordinates: [8.3167, 5.2167] },
    ],
  },
  {
    state: "Delta",
    areas: [
      { name: "Asaba North", city: "Asaba", coordinates: [6.7349, 6.1984] },
      { name: "Asaba Boulevard", city: "Asaba", coordinates: [6.7333, 6.2167] },
      { name: "Warri South", city: "Warri", coordinates: [5.746, 5.509] },
      { name: "Ekpan", city: "Warri", coordinates: [5.7167, 5.5833] },
      { name: "Effurun", city: "Effurun", coordinates: [5.7667, 5.5333] },
      { name: "Sapele", city: "Sapele", coordinates: [5.675, 5.89] },
      { name: "Ughelli North", city: "Ughelli", coordinates: [6.004, 5.492] },
      { name: "Ozoro", city: "Ozoro", coordinates: [5.9167, 6.2333] },
      { name: "Agbor", city: "Agbor", coordinates: [6.1917, 6.25] },
      { name: "Kwale", city: "Kwale", coordinates: [6.4333, 6.4] },
    ],
  },
  {
    state: "Ebonyi",
    areas: [
      { name: "Abakaliki", city: "Abakaliki", coordinates: [8.1131, 6.3289] },
      { name: "Afikpo", city: "Afikpo", coordinates: [8.1225, 5.8931] },
      { name: "Onueke", city: "Ezza", coordinates: [8.0667, 6.3333] },
      { name: "Ezza", city: "Ezza", coordinates: [8.0833, 6.3667] },
      { name: "Ikwo", city: "Ikwo", coordinates: [8.1167, 6.5333] },
    ],
  },
  {
    state: "Edo",
    areas: [
      { name: "Benin North", city: "Benin City", coordinates: [5.6333, 6.3333] },
      { name: "Ring Road", city: "Benin City", coordinates: [5.6147, 6.3379] },
      { name: "Sapele Road", city: "Benin City", coordinates: [5.5833, 6.3667] },
      { name: "Auchi", city: "Auchi", coordinates: [6.3333, 7.0667] },
      { name: "Ekpoma", city: "Ekpoma", coordinates: [6.1449, 6.7449] },
      { name: "Uromi", city: "Uromi", coordinates: [6.3333, 6.7] },
      { name: "Igueben", city: "Igueben", coordinates: [6.25, 6.75] },
      { name: "Esan North-East", city: "Uromi", coordinates: [6.3333, 6.5333] },
    ],
  },
  {
    state: "Ekiti",
    areas: [
      { name: "Ado-Ekiti North", city: "Ado-Ekiti", coordinates: [5.198, 7.615] },
      { name: "Fajuyi", city: "Ado-Ekiti", coordinates: [5.2235, 7.6084] },
      { name: "Ikere-Ekiti", city: "Ikere", coordinates: [5.2333, 7.5] },
      { name: "Ise-Ekiti", city: "Ise", coordinates: [5.4167, 7.6667] },
      { name: "Ikole-Ekiti", city: "Ikole", coordinates: [5.5167, 7.7833] },
      { name: "Ilupeju-Ekiti", city: "Ilupeju", coordinates: [5.2833, 7.7833] },
      { name: "Emure-Ekiti", city: "Emure", coordinates: [5.4833, 7.7167] },
    ],
  },
  {
    state: "Enugu",
    areas: [
      { name: "Enugu North", city: "Enugu", coordinates: [7.5452, 6.4534] },
      { name: "New Haven", city: "Enugu", coordinates: [7.53, 6.435] },
      { name: "Uwani", city: "Enugu", coordinates: [7.546, 6.43] },
      { name: "Abakpa", city: "Enugu", coordinates: [7.55, 6.5167] },
      { name: "Trans-Ekulu", city: "Enugu", coordinates: [7.55, 6.4667] },
      { name: "Nsukka", city: "Nsukka", coordinates: [7.3964, 6.8567] },
      { name: "Oji-River", city: "Oji-River", coordinates: [7.5667, 6.7667] },
      { name: "Awgu", city: "Awgu", coordinates: [7.4833, 6.7167] },
      { name: "Agbani", city: "Nkanu West", coordinates: [7.5667, 6.3167] },
      { name: "Udi", city: "Udi", coordinates: [7.4167, 6.3167] },
    ],
  },
  {
    state: "Abuja",
    areas: [
      { name: "Central Area", city: "Central Area", coordinates: [7.49, 9.065] },
      { name: "Maitama", city: "Maitama", coordinates: [7.495, 9.0833] },
      { name: "Asokoro", city: "Asokoro", coordinates: [7.5087, 9.0679] },
      { name: "Wuse", city: "Wuse", coordinates: [7.4781, 9.0833] },
      { name: "Garki", city: "Garki", coordinates: [7.4833, 9.0667] },
      { name: "Nyanya", city: "Nyanya", coordinates: [7.5333, 8.95] },
      { name: "Gwagwalada", city: "Gwagwalada", coordinates: [7.05, 8.9333] },
      { name: "Kubwa", city: "Kubwa", coordinates: [7.5167, 9.1167] },
      { name: "Karu", city: "Karu", coordinates: [7.6833, 8.9833] },
      { name: "Lugbe", city: "Lugbe", coordinates: [7.4333, 8.9333] },
    ],
  },
  {
    state: "Gombe",
    areas: [
      { name: "Gombe LGA", city: "Gombe", coordinates: [11.1678, 10.2897] },
      { name: "Pantami", city: "Gombe", coordinates: [11.173, 10.226] },
      { name: "Dukku", city: "Dukku", coordinates: [10.8, 10.8333] },
      { name: "Kaltungo", city: "Kaltungo", coordinates: [11.3167, 9.7833] },
      { name: "Billiri", city: "Billiri", coordinates: [11.0333, 10.2] },
      { name: "Akko", city: "Akko", coordinates: [11.2, 10.3667] },
      { name: "Nafada", city: "Nafada", coordinates: [11.3333, 11.0833] },
    ],
  },
  {
    state: "Imo",
    areas: [
      { name: "Owerri Municipal", city: "Owerri", coordinates: [7.029, 5.479] },
      { name: "New Owerri", city: "Owerri", coordinates: [7.0361, 5.5134] },
      { name: "Dick-Tyrer", city: "Owerri", coordinates: [7.03, 5.495] },
      { name: "Orlu", city: "Orlu", coordinates: [7.0333, 5.7667] },
      { name: "Okigwe", city: "Okigwe", coordinates: [7.1, 5.8333] },
      { name: "Mbaise", city: "Mbaise", coordinates: [7.1167, 5.5667] },
      { name: "Oguta", city: "Oguta", coordinates: [7.2167, 4.7833] },
      { name: "Mbiri", city: "Mbiri", coordinates: [7.1833, 5.6167] },
    ],
  },
  {
    state: "Jigawa",
    areas: [
      { name: "Dutse", city: "Dutse", coordinates: [9.34, 11.755] },
      { name: "Hadejia", city: "Hadejia", coordinates: [10.4341, 12.4441] },
      { name: "Ringim", city: "Ringim", coordinates: [9.1631, 12.1514] },
      { name: "Gumel", city: "Gumel", coordinates: [9.3878, 12.6328] },
      { name: "Babura", city: "Babura", coordinates: [9.0167, 12.7667] },
      { name: "Kazaure", city: "Kazaure", coordinates: [9.3167, 12.65] },
    ],
  },
  {
    state: "Kaduna",
    areas: [
      { name: "Kaduna North", city: "Kaduna", coordinates: [7.43, 10.53] },
      { name: "Barnawa", city: "Kaduna", coordinates: [7.433, 10.475] },
      { name: "Kawo", city: "Kaduna", coordinates: [7.4333, 10.5667] },
      { name: "Television", city: "Kaduna", coordinates: [7.4476, 10.5093] },
      { name: "Zaria City", city: "Zaria", coordinates: [7.7191, 11.0855] },
      { name: "Kafanchan", city: "Kafanchan", coordinates: [8.2833, 9.5833] },
      { name: "Soba", city: "Soba", coordinates: [7.9833, 10.7333] },
      { name: "Kagoro", city: "Kaura", coordinates: [8.4167, 9.6] },
      { name: "Ikara", city: "Ikara", coordinates: [8.1667, 11.1667] },
    ],
  },
  {
    state: "Kano",
    areas: [
      { name: "Kano Municipal", city: "Kano", coordinates: [8.525, 11.9956] },
      { name: "Fagge", city: "Kano", coordinates: [8.517, 11.9846] },
      { name: "Sabon Gari", city: "Kano", coordinates: [8.518, 11.988] },
      { name: "Bata", city: "Kano", coordinates: [8.5241, 12.0049] },
      { name: "Dala", city: "Kano", coordinates: [8.5296, 12.0031] },
      { name: "Nassarawa", city: "Kano", coordinates: [8.56, 11.93] },
      { name: "Wudil", city: "Wudil", coordinates: [8.9833, 11.8] },
      { name: "Rano", city: "Rano", coordinates: [8.5833, 11.5333] },
      { name: "Gwarzo", city: "Gwarzo", coordinates: [7.9833, 11.2833] },
      { name: "Danbatta", city: "Danbatta", coordinates: [8.3333, 12.3667] },
    ],
  },
  {
    state: "Katsina",
    areas: [
      { name: "Katsina LGA", city: "Katsina", coordinates: [7.6018, 12.9908] },
      { name: "Daura", city: "Daura", coordinates: [7.8964, 13.1067] },
      { name: "Funtua", city: "Funtua", coordinates: [7.3131, 11.5231] },
      { name: "Malumfashi", city: "Malumfashi", coordinates: [7.6167, 11.7833] },
      { name: "Musawa", city: "Musawa", coordinates: [7.4833, 12.1333] },
      { name: "Jibia", city: "Jibia", coordinates: [7.2167, 13.0833] },
    ],
  },
  {
    state: "Kebbi",
    areas: [
      { name: "Birnin Kebbi", city: "Birnin Kebbi", coordinates: [4.2019, 12.4539] },
      { name: "Gwandu", city: "Gwandu", coordinates: [4.25, 12.5] },
      { name: "Yauri", city: "Yauri", coordinates: [4.6167, 12.25] },
      { name: "Argungu", city: "Argungu", coordinates: [4.55, 12.75] },
      { name: "Zuru", city: "Zuru", coordinates: [5.2333, 11.4333] },
      { name: "Bunza", city: "Bunza", coordinates: [4.4167, 12.3833] },
      { name: "Kalgo", city: "Kalgo", coordinates: [4.0167, 12.3333] },
    ],
  },
  {
    state: "Kogi",
    areas: [
      { name: "Lokoja LGA", city: "Lokoja", coordinates: [6.745, 7.7967] },
      { name: "Okene", city: "Okene", coordinates: [6.15, 6.2119] },
      { name: "Kabba", city: "Kabba", coordinates: [6.0667, 7.8167] },
      { name: "Idah", city: "Idah", coordinates: [6.8333, 6.75] },
      { name: "Anyigba", city: "Ankpa", coordinates: [7.3667, 7.7] },
      { name: "Dekina", city: "Dekina", coordinates: [7.3667, 7.6833] },
      { name: "Koton-Karfe", city: "Koton-Karfe", coordinates: [6.6167, 7.8333] },
    ],
  },
  {
    state: "Kwara",
    areas: [
      { name: "Ilorin West", city: "Ilorin", coordinates: [4.5512, 8.4937] },
      { name: "Taiwo", city: "Ilorin", coordinates: [4.55, 8.4833] },
      { name: "Baboko", city: "Ilorin", coordinates: [4.5667, 8.4667] },
      { name: "Akerebiata", city: "Ilorin", coordinates: [4.6, 8.5167] },
      { name: "Offa", city: "Offa", coordinates: [4.7167, 8.15] },
      { name: "Lafiagi", city: "Lafiagi", coordinates: [5.2833, 8.85] },
      { name: "Jebba", city: "Jebba", coordinates: [5.0333, 9.1333] },
      { name: "Omu-Aran", city: "Omu-Aran", coordinates: [5.1, 8.4167] },
      { name: "Share", city: "Ifelodun", coordinates: [5.2833, 8.65] },
    ],
  },
  {
    state: "Lagos",
    areas: [
      { name: "Lagos Island", city: "Lagos", coordinates: [3.3947, 6.4541] },
      { name: "CMS", city: "Lagos", coordinates: [3.3865, 6.4537] },
      { name: "Marina", city: "Lagos", coordinates: [3.3922, 6.4467] },
      { name: "Broad Street", city: "Lagos", coordinates: [3.396, 6.456] },
      { name: "Ikeja GRA", city: "Ikeja", coordinates: [3.35, 6.5833] },
      { name: "Allen Avenue", city: "Ikeja", coordinates: [3.351, 6.5947] },
      { name: "Computer Village", city: "Ikeja", coordinates: [3.339, 6.6028] },
      { name: "Surulere", city: "Surulere", coordinates: [3.35, 6.49] },
      { name: "Bode Thomas", city: "Surulere", coordinates: [3.38, 6.4823] },
      { name: "Yaba", city: "Yaba", coordinates: [3.3711, 6.5095] },
      { name: "Herbert Macaulay", city: "Yaba", coordinates: [3.371, 6.5119] },
      { name: "Agege", city: "Agege", coordinates: [3.3167, 6.6] },
      { name: "Oshodi", city: "Oshodi", coordinates: [3.3422, 6.5554] },
      { name: "Mushin", city: "Mushin", coordinates: [3.344, 6.548] },
      { name: "Ketu", city: "Ketu", coordinates: [3.359, 6.563] },
      { name: "Ikorodu", city: "Ikorodu", coordinates: [3.5106, 6.6194] },
      { name: "Epe", city: "Epe", coordinates: [3.9833, 6.6] },
      { name: "Badagry", city: "Badagry", coordinates: [2.8833, 6.4167] },
    ],
  },
  {
    state: "Nasarawa",
    areas: [
      { name: "Lafia", city: "Lafia", coordinates: [8.5189, 8.4939] },
      { name: "Keffi", city: "Keffi", coordinates: [8.85, 8.85] },
      { name: "Karu", city: "Karu", coordinates: [7.6833, 8.9833] },
      { name: "Doma", city: "Doma", coordinates: [8.4, 8.4] },
      { name: "Akwanga", city: "Akwanga", coordinates: [9.2906, 8.9083] },
      { name: "Toto", city: "Toto", coordinates: [7.7, 8.1333] },
    ],
  },
  {
    state: "Niger",
    areas: [
      { name: "Minna North", city: "Minna", coordinates: [6.549, 9.618] },
      { name: "Bosso", city: "Minna", coordinates: [6.5333, 9.65] },
      { name: "Kpakungu", city: "Minna", coordinates: [6.536, 9.5924] },
      { name: "Bida", city: "Bida", coordinates: [6.01, 9.08] },
      { name: "Kontagora", city: "Kontagora", coordinates: [5.4731, 10.0031] },
      { name: "Suleja", city: "Suleja", coordinates: [7.1787, 9.1813] },
      { name: "Lapai", city: "Lapai", coordinates: [6.8667, 9.05] },
      { name: "Mokwa", city: "Mokwa", coordinates: [5.05, 9.05] },
      { name: "New Bussa", city: "New Bussa", coordinates: [4.7833, 9.6833] },
    ],
  },
  {
    state: "Ogun",
    areas: [
      { name: "Abeokuta North", city: "Abeokuta", coordinates: [3.348, 7.155] },
      { name: "Ijaiye", city: "Abeokuta", coordinates: [3.35, 7.1167] },
      { name: "Ake", city: "Abeokuta", coordinates: [3.35, 7.1667] },
      { name: "Camp", city: "Abeokuta", coordinates: [3.4333, 7.0333] },
      { name: "Sango", city: "Abeokuta", coordinates: [3.3667, 7.1167] },
      { name: "Ijebu-Ode", city: "Ijebu-Ode", coordinates: [3.9167, 6.8667] },
      { name: "Sagamu", city: "Sagamu", coordinates: [3.65, 6.8333] },
      { name: "Sango-Otta", city: "Otta", coordinates: [3.1667, 6.6833] },
      { name: "Ilaro", city: "Ilaro", coordinates: [3.0167, 6.9167] },
      { name: "Ifo", city: "Ifo", coordinates: [3.2, 6.8167] },
      { name: "Mowe", city: "Obafemi Owode", coordinates: [3.4833, 6.7333] },
    ],
  },
  {
    state: "Ondo",
    areas: [
      { name: "Akure North", city: "Akure", coordinates: [5.2045, 7.2469] },
      { name: "Alagbaka", city: "Akure", coordinates: [5.2046, 7.2499] },
      { name: "Oba Ile", city: "Akure", coordinates: [5.2333, 7.2833] },
      { name: "Ondo West", city: "Ondo", coordinates: [4.85, 7.15] },
      { name: "Ondo East", city: "Ondo", coordinates: [4.8667, 7.1] },
      { name: "Owo", city: "Owo", coordinates: [5.5833, 7.1833] },
      { name: "Ore", city: "Ore", coordinates: [4.5333, 6.75] },
      { name: "Ikare", city: "Ikare", coordinates: [5.7667, 7.6] },
      { name: "Okitipupa", city: "Okitipupa", coordinates: [4.7833, 7.0833] },
    ],
  },
  {
    state: "Osun",
    areas: [
      { name: "Osogbo Urban", city: "Osogbo", coordinates: [4.5622, 7.7575] },
      { name: "Alekuwodo", city: "Osogbo", coordinates: [4.5567, 7.7523] },
      { name: "Ile-Ife", city: "Ile-Ife", coordinates: [4.5619, 7.4833] },
      { name: "Ilesa", city: "Ilesa", coordinates: [4.7333, 7.75] },
      { name: "Ede", city: "Ede", coordinates: [4.3833, 7.7333] },
      { name: "Iwo", city: "Iwo", coordinates: [4.1833, 7.6333] },
      { name: "Ikirun", city: "Ifelodun", coordinates: [4.9833, 7.9167] },
    ],
  },
  {
    state: "Oyo",
    areas: [
      { name: "Ibadan North", city: "Ibadan", coordinates: [3.746, 7.3886] },
      { name: "Bodija", city: "Ibadan", coordinates: [3.388, 7.425] },
      { name: "Dugbe", city: "Ibadan", coordinates: [3.8958, 7.375] },
      { name: "Mokola", city: "Ibadan", coordinates: [3.3883, 7.4034] },
      { name: "Challenge", city: "Ibadan", coordinates: [3.8681, 7.3639] },
      { name: "Ojoo", city: "Ibadan", coordinates: [3.9167, 7.4667] },
      { name: "Iwo Road", city: "Ibadan", coordinates: [3.8333, 7.4167] },
      { name: "Jericho", city: "Ibadan", coordinates: [3.84, 7.404] },
      { name: "Oyo West", city: "Oyo", coordinates: [3.9167, 7.8667] },
      { name: "Ogbomosho North", city: "Ogbomosho", coordinates: [4.246, 8.139] },
      { name: "Iseyin", city: "Iseyin", coordinates: [3.6, 7.8333] },
      { name: "Saki", city: "Saki", coordinates: [3.6167, 8.4667] },
      { name: "Eruwa", city: "Ibarapa East", coordinates: [3.5667, 7.5833] },
      { name: "Igboho", city: "Oorelope", coordinates: [3.8833, 8.1833] },
    ],
  },
  {
    state: "Plateau",
    areas: [
      { name: "Jos North", city: "Jos", coordinates: [8.872, 9.884] },
      { name: "Jos South", city: "Jos", coordinates: [8.89, 9.81] },
      { name: "Rayfield", city: "Jos", coordinates: [8.86, 9.88] },
      { name: "Bukuru", city: "Jos", coordinates: [8.9, 9.7833] },
      { name: "Barkin Ladi", city: "Barkin Ladi", coordinates: [8.6, 9.5333] },
      { name: "Mangu", city: "Mangu", coordinates: [9.1667, 9.1667] },
      { name: "Pankshin", city: "Pankshin", coordinates: [9.4333, 9.3167] },
      { name: "Shendam", city: "Shendam", coordinates: [8.7167, 8.55] },
      { name: "Vom", city: "Jos South", coordinates: [8.7167, 9.7333] },
    ],
  },
  {
    state: "Rivers",
    areas: [
      { name: "Port Harcourt City", city: "Port Harcourt", coordinates: [7.0045, 4.8122] },
      { name: "Diobu", city: "Port Harcourt", coordinates: [7.0171, 4.7996] },
      { name: "GRA Phase 1", city: "Port Harcourt", coordinates: [7.0127, 4.8254] },
      { name: "Rumuola", city: "Port Harcourt", coordinates: [7.02, 4.83] },
      { name: "Woji", city: "Port Harcourt", coordinates: [7.0133, 4.8453] },
      { name: "Ada George", city: "Port Harcourt", coordinates: [7.0167, 4.8833] },
      { name: "Trans Amadi", city: "Port Harcourt", coordinates: [6.9982, 4.8063] },
      { name: "Eleme", city: "Eleme", coordinates: [7.1167, 4.7833] },
      { name: "Rumuokoro", city: "Obio-Akpor", coordinates: [6.9434, 4.8795] },
      { name: "Choba", city: "Obio-Akpor", coordinates: [6.945, 4.9187] },
      { name: "Bonny", city: "Bonny", coordinates: [7.1667, 4.45] },
      { name: "Degema", city: "Degema", coordinates: [6.7667, 4.75] },
      { name: "Bori", city: "Khana", coordinates: [7.3833, 4.6833] },
      { name: "Tai", city: "Tai", coordinates: [7.0, 4.7333] },
    ],
  },
  {
    state: "Sokoto",
    areas: [
      { name: "Sokoto North", city: "Sokoto", coordinates: [5.2264, 13.0632] },
      { name: "Wamakko", city: "Sokoto", coordinates: [5.2781, 13.0412] },
      { name: "Wurno", city: "Wurno", coordinates: [5.4167, 13.3] },
      { name: "Illela", city: "Illela", coordinates: [5.3667, 13.7333] },
      { name: "Dange", city: "Dange", coordinates: [5.5333, 12.6333] },
      { name: "Binji", city: "Binji", coordinates: [5.0333, 13.1667] },
      { name: "Gwadabawa", city: "Gwadabawa", coordinates: [5.2333, 12.8333] },
    ],
  },
  {
    state: "Taraba",
    areas: [
      { name: "Jalingo", city: "Jalingo", coordinates: [11.3623, 8.8934] },
      { name: "Wukari", city: "Wukari", coordinates: [9.7833, 7.8667] },
      { name: "Ibi", city: "Ibi", coordinates: [9.85, 8.0833] },
      { name: "Serti", city: "Gashaka", coordinates: [11.15, 6.75] },
      { name: "Gashaka", city: "Gashaka", coordinates: [11.2333, 7.1333] },
      { name: "Lau", city: "Lau", coordinates: [11.1833, 8.7167] },
      { name: "Ardo-Kola", city: "Ardo-Kola", coordinates: [11.65, 8.7833] },
    ],
  },
  {
    state: "Yobe",
    areas: [
      { name: "Damaturu", city: "Damaturu", coordinates: [12.7567, 11.7468] },
      { name: "Potiskum", city: "Potiskum", coordinates: [11.0833, 11.7167] },
      { name: "Geidam", city: "Geidam", coordinates: [11.9294, 12.8944] },
      { name: "Nguru", city: "Nguru", coordinates: [10.45, 12.8667] },
      { name: "Fune", city: "Fune", coordinates: [12.3667, 11.5167] },
      { name: "Gujba", city: "Gujba", coordinates: [12.55, 11.6] },
      { name: "Machina", city: "Machina", coordinates: [10.1167, 13.0667] },
    ],
  },
  {
    state: "Zamfara",
    areas: [
      { name: "Gusau East", city: "Gusau", coordinates: [6.671, 12.168] },
      { name: "Gusau Central", city: "Gusau", coordinates: [6.6642, 12.1704] },
      { name: "Maru", city: "Maru", coordinates: [6.4167, 12.3333] },
      { name: "Bukkuyum", city: "Bukkuyum", coordinates: [5.8833, 12.2] },
      { name: "Kaura Namoda", city: "Kaura Namoda", coordinates: [6.5833, 11.5833] },
      { name: "Talata Mafara", city: "Talata Mafara", coordinates: [6.6333, 12.4] },
      { name: "Shinkafi", city: "Shinkafi", coordinates: [6.45, 12.9667] },
    ],
  },
];

const locations = stateSeeds.flatMap((entry) =>
  entry.areas.map((area) => ({
    name: area.name,
    city: area.city,
    state: entry.state,
    country: "Nigeria",
    geo: { type: "Point" as const, coordinates: area.coordinates },
  }))
);

async function seed() {
  try {
    console.log("Connecting to MongoDB...", MONGODB_URI);
    await mongoose.connect(MONGODB_URI);
    console.log("Connected.");

    // Upsert by (name, city, state) so existing Location _ids are preserved.
    // Deleting + re-inserting would change _ids and orphan incidents that
    // reference them (the hotspot map drops incidents with missing locations).
    console.log(
      `Upserting ${locations.length} locations across ${stateSeeds.length} states...`
    );
    await Location.bulkWrite(
      locations.map((loc) => ({
        updateOne: {
          filter: { name: loc.name, city: loc.city, state: loc.state },
          update: { $set: loc },
          upsert: true,
        },
      })),
      { ordered: false }
    );

    console.log("Seeding complete!");
    process.exit(0);
  } catch (err) {
    console.error("Error seeding locations:", err);
    process.exit(1);
  }
}

seed();
