import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {createHash} from "node:crypto";

const catalog=JSON.parse(await readFile("src/catalog-data.json","utf8"));
const manifest=JSON.parse(await readFile("catalog-images.json","utf8"));
const source=JSON.parse(await readFile("../refs/research/opensooq-active-listings.json","utf8"));
const galleries=JSON.parse(await readFile("../refs/research/gallery-audit.json","utf8"));
const ranges=JSON.parse(await readFile("../refs/research/electric-range-audit.json","utf8"));
const expected=new Set(source.listings.map(v=>String(v.id)));
assert.equal(catalog.length,source.sourceActiveCount,"Catalogue must include every captured active listing");
assert.equal(new Set(catalog.map(v=>v.id)).size,catalog.length,"Duplicate listing IDs");
assert.deepEqual(new Set(catalog.map(v=>String(v.id))),expected,"Missing or unexpected listing");
assert.ok(Array.isArray(manifest.images)&&manifest.images.length>=catalog.length,"Every listing needs a real photograph");
const photosByPath=new Map();
for(const photo of manifest.images){
 assert.ok(/^public\/assets\/catalog\/[A-Za-z0-9][A-Za-z0-9._-]*\.(?:webp|jpg|jpeg|png)$/.test(photo.path),`Invalid image path: ${photo.path}`);
 assert.ok(!photosByPath.has(photo.path),`Duplicate image path: ${photo.path}`);
 assert.ok(expected.has(String(photo.id)),`Photo has no dealer listing: ${photo.path}`);
 const url=new URL(photo.url);
 assert.ok(url.protocol==="https:"&&url.hostname==="opensooq-imagesv2.os-cdn.com"&&!url.username&&!url.password&&!url.hash&&(!url.port||url.port==="443"),`Unexpected image host: ${photo.path}`);
 photosByPath.set(photo.path,photo);
}
const referencedPhotos=new Set();
for(const vehicle of catalog){
 assert.ok(vehicle.brand&&vehicle.name&&vehicle.year,`Missing identity: ${vehicle.id}`);
 assert.equal(vehicle.post,`https://jo.opensooq.com/en/search/${vehicle.id}`);
 assert.ok(vehicle.specs.length>=8,`Missing specifications: ${vehicle.id}`);
 for(const spec of vehicle.specs)for(const lang of ["en","ar"])assert.ok(spec.label[lang]&&spec.value[lang],`Missing localized spec: ${vehicle.id}`);
 assert.ok(typeof vehicle.image==="string"&&vehicle.image.startsWith("/assets/catalog/"),`Missing primary photograph: ${vehicle.id}`);
 assert.ok(vehicle.gallery===undefined||Array.isArray(vehicle.gallery),`Invalid gallery: ${vehicle.id}`);
 const paths=[...new Set([vehicle.image,...(vehicle.gallery??[])])];
 assert.equal(paths.length,galleries[vehicle.id].count,`Incomplete dealer gallery: ${vehicle.id}`);
 assert.equal(galleries[vehicle.id].photos.length,paths.length,`Gallery source count differs: ${vehicle.id}`);
 let galleryIndex=0;
 for(const path of paths){
  assert.ok(typeof path==="string"&&path.startsWith("/assets/catalog/"),`Invalid gallery photograph: ${vehicle.id}`);
  const photo=photosByPath.get("public"+path);
  assert.ok(photo,`Unverified gallery photograph: ${vehicle.id}: ${path}`);
  assert.equal(String(photo.id),String(vehicle.id),`Photo belongs to a different listing: ${path}`);
  assert.equal(photo.url,galleries[vehicle.id].photos[galleryIndex++].url,`Wrong gallery photo or order: ${path}`);
  assert.ok(!new URL(photo.url).pathname.includes("/previews/"),`Use the original dealer photograph: ${path}`);
  assert.ok(Number.isInteger(photo.width)&&Number.isInteger(photo.height)&&photo.width>0&&photo.height>0,`Invalid image dimensions: ${path}`);
  const minimum=path===vehicle.image?700:300;
  assert.ok(Math.max(photo.width,photo.height)>=minimum,`Small source photograph: ${path}`);
  if(referencedPhotos.has(photo.path))continue;
  referencedPhotos.add(photo.path);
  const bytes=await readFile(photo.path);
  assert.equal(bytes.length,photo.bytes,`Wrong image length: ${path}`);
  assert.equal(createHash("sha256").update(bytes).digest("hex"),photo.sha256.toLowerCase(),`Wrong image bytes: ${path}`);
  if(/\.jpe?g$/.test(path))assert.ok(bytes.subarray(0,2).equals(Buffer.from([255,216]))&&bytes.subarray(-2).equals(Buffer.from([255,217])),`Invalid JPEG: ${path}`);
  else if(path.endsWith(".png"))assert.ok(bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])),`Invalid PNG: ${path}`);
  else assert.ok(bytes.toString("ascii",0,4)==="RIFF"&&bytes.toString("ascii",8,12)==="WEBP",`Invalid WebP: ${path}`);
 }
 if(vehicle.range){
  assert.ok(vehicle.categories.includes("electric"),`Driving range belongs on electric cars: ${vehicle.id}`);
  for(const lang of ["en","ar"])assert.ok(typeof vehicle.range[lang]==="string"&&vehicle.range[lang].trim(),`Missing localized driving range: ${vehicle.id}`);
 }
 if(vehicle.categories.includes("electric")){
  assert.ok(ranges[vehicle.id]&&vehicle.range,`Missing advertised EV range: ${vehicle.id}`);
  assert.equal(vehicle.range.en,ranges[vehicle.id].displayEnglish);
  assert.equal(vehicle.range.ar,ranges[vehicle.id].displayArabic);
 }
 if(vehicle.price){assert.ok(vehicle.price.amount>0);assert.equal(vehicle.price.currency,"JOD");}
}
assert.equal(referencedPhotos.size,photosByPath.size,"Manifest includes photographs absent from the catalogue galleries");
assert.equal(catalog.find(v=>v.id==="288700698").price,undefined,"A down payment is not the full vehicle price");
console.log(`Verified ${catalog.length} active dealer listings, source links, specifications and ${referencedPhotos.size} original gallery photos.`);
