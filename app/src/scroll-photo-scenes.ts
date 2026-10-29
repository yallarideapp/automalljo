import {vehicles,type Lang} from "./site-data";
import {assetPath} from "./site-paths";

type Words=Record<Lang,string>;
const definitions:{id:string;vehicleId:string;photo:string;position:string;label:Words;title:Words;body:Words}[]=[
 {id:"electric",vehicleId:"287890822",photo:"/assets/catalog/gallery-287890822-1.webp",position:"50% 58%",label:{en:"Electric",ar:"كهربائية"},title:{en:"Your next drive.\nAt AutoMall.",ar:"سيارتك القادمة.\nفي أوتومول."},body:{en:"Real cars. More possibilities. Find your next chapter in our Amman showroom.",ar:"سيارات حقيقية وخيارات أكثر. اكتشف خطوتك القادمة في معرضنا في عمّان."}},
 {id:"hybrid",vehicleId:"288440948",photo:"/assets/catalog/gallery-288440948-1.webp",position:"50% 74%",label:{en:"Hybrid",ar:"هجينة"},title:{en:"A bigger sense\nof possibility.",ar:"خيارات أوسع.\nإمكانيات أكثر."},body:{en:"Meet the Jetour G700. Plug-in hybrid power with a presence all its own.",ar:"تعرف على جيتور G700. نظام هجين قابل للشحن وحضور يلفت الأنظار."}},
 {id:"interior",vehicleId:"288630286",photo:"/assets/catalog/gallery-288630286-11.webp",position:"50% 58%",label:{en:"Inside",ar:"المقصورة"},title:{en:"The details\nmake the drive.",ar:"في كل تفصيل\nمتعة للقيادة."},body:{en:"Step inside the BMW i5 M60. Explore the cabin before you visit.",ar:"شاهد مقصورة BMW i5 M60 عن قرب، واكتشف تفاصيلها قبل زيارتك."}},
 {id:"adventure",vehicleId:"287516454",photo:"/assets/catalog/gallery-287516454-1.webp",position:"50% 64%",label:{en:"Adventure",ar:"المغامرة"},title:{en:"New energy.\nNew horizons.",ar:"طاقة جديدة.\nآفاق جديدة."},body:{en:"The electric Mercedes-Benz G580. A distinctive next chapter, ready to explore.",ar:"مرسيدس بنز G580 الكهربائية. خطوة جديدة بطابع مميز تنتظر أن تكتشفها."}}
];

export const scrollPhotoScenes=definitions.map(scene=>{
 const vehicle=vehicles.find(item=>item.id===scene.vehicleId);
 if(!vehicle)throw new Error("Missing featured dealer listing: "+scene.vehicleId);
 return {...scene,photo:assetPath(scene.photo),vehicle};
});
