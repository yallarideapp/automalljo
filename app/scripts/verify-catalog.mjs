import assert from "node:assert/strict";
import {readFile,stat} from "node:fs/promises";
import {createHash} from "node:crypto";

const catalog=JSON.parse(await readFile("src/catalog-data.json","utf8"));
const manifest=JSON.parse(await readFile("catalog-images.json","utf8"));
const source=JSON.parse(await readFile("../refs/research/opensooq-active-listings.json","utf8"));
const expected=new Set(source.listings.map(v=>v.id));
assert.equal(catalog.length,source.sourceActiveCount,"Catalogue must include every captured active listing");
assert.equal(new Set(catalog.map(v=>v.id)).size,catalog.length,"Duplicate listing IDs");
assert.deepEqual(new Set(catalog.map(v=>v.id)),expected,"Missing or unexpected listing");
assert.equal(manifest.images.length,catalog.length,"Every listing needs a real photograph");
for(const vehicle of catalog){
 assert.ok(vehicle.brand&&vehicle.name&&vehicle.year,`Missing identity: ${vehicle.id}`);
 assert.equal(vehicle.post,`https://jo.opensooq.com/en/search/${vehicle.id}`);
 assert.ok(vehicle.specs.length>=8,`Missing specifications: ${vehicle.id}`);
 for(const spec of vehicle.specs)for(const lang of ["en","ar"])assert.ok(spec.label[lang]&&spec.value[lang],`Missing localized spec: ${vehicle.id}`);
 const photo=manifest.images.find(p=>p.id===vehicle.id);
 assert.equal(vehicle.image,photo.path.replace(/^public/,""));
 assert.ok(photo.width>=700&&photo.height>=400,`Small source photograph: ${vehicle.id}`);
 const bytes=await readFile(photo.path);
 assert.equal(bytes.length,photo.bytes,`Wrong image length: ${vehicle.id}`);
 assert.equal(createHash("sha256").update(bytes).digest("hex"),photo.sha256,`Wrong image bytes: ${vehicle.id}`);
 if(vehicle.price){assert.ok(vehicle.price.amount>0);assert.equal(vehicle.price.currency,"JOD");}
}
assert.equal(catalog.find(v=>v.id==="288700698").price,undefined,"A down payment is not the full vehicle price");
console.log(`Verified ${catalog.length} active dealer listings, source links, specifications and original photos.`);
