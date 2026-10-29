"""Build the public catalogue from the captured live dealer ads and audited captions."""
import concurrent.futures, hashlib, io, json, pathlib, time, urllib.request
from PIL import Image, ImageOps

ROOT = pathlib.Path(__file__).resolve().parents[2]
RESEARCH = ROOT / 'refs/research'
APP = ROOT / 'app'
source = json.loads((RESEARCH / 'opensooq-active-listings.json').read_text())
audit = {}
for path in sorted(RESEARCH.glob('model-audit-*.json')):
    audit.update(json.loads(path.read_text()))
details = {p.stem: json.loads(p.read_text()) for p in RESEARCH.glob('details-*/*.json')}
assert len(audit) == len(details) == len(source['listings']) == 70
galleries = json.loads((RESEARCH / 'gallery-audit.json').read_text())
ranges = json.loads((RESEARCH / 'electric-range-audit.json').read_text())

def pair(en, ar=None): return {'en': str(en), 'ar': str(ar if ar is not None else en)}
AR = {
    'Electric':'كهربائية', 'Petrol':'بنزين', 'Plug-in hybrid':'هجينة قابلة للشحن',
    'Hybrid (HEV)':'هجينة ذاتية الشحن', 'Mild hybrid':'هجينة خفيفة',
    'Hybrid (range extender / REEV)':'هجينة بموسّع مدى REEV',
    'Hybrid (range extender / ER-EV)':'هجينة بموسّع مدى ER-EV',
    'SUV':'رياضية متعددة الاستخدامات', 'Sedan':'سيدان', 'Pickup':'بيك أب',
    'Shooting brake':'ستيشن رياضية', 'Van':'فان', 'Targa':'تارغا', 'Coupe':'كوبيه', 'Refrigerated truck':'شاحنة مبردة',
    'New':'جديدة', 'Used':'مستعملة', 'Automatic':'أوتوماتيك',
    'DHT automatic':'أوتوماتيك DHT', '3-speed DHT automatic':'أوتوماتيك DHT بثلاث سرعات',
    '8-speed automatic':'أوتوماتيك بثماني سرعات', 'PDK automatic':'أوتوماتيك PDK',
    'Black':'أسود','Grey':'رمادي','Nardo Grey':'رمادي ناردو','White':'أبيض','Silver':'فضي',
    'Baby Blue':'أزرق فاتح','Navy Blue':'كحلي','Blue':'أزرق','Green':'أخضر',
    'Purple':'بنفسجي','Red':'أحمر','Beige':'بيج','Brown':'بني','Burgundy':'خمري','Orange':'برتقالي',
    'Chinese Specs':'مواصفات صينية','European Specs':'مواصفات أوروبية',
    'GCC Specs':'مواصفات خليجية','Japanese Specs':'مواصفات يابانية',
    'Other Specs':'مواصفات أخرى','Dealership':'الوكالة',
    'RWD':'دفع خلفي','FWD':'دفع أمامي','AWD':'دفع كلي','4WD':'دفع رباعي',
    '4WD / AWD':'دفع رباعي / كلي','AWD dual motor':'دفع كلي بمحركين',
    'xDrive AWD':'دفع كلي xDrive','4MATIC AWD':'دفع كلي 4MATIC',
    '4MATIC AWD dual motor':'دفع كلي 4MATIC بمحركين',
    'Four independent electric motors':'أربعة محركات كهربائية مستقلة',
}
def tr(s): return AR.get(str(s), str(s))
def tech_ar(s):
    s = tr(s)
    for en,ar in [('petrol range extender','بنزين مع موسّع مدى'),('turbo range extender','تيربو مع موسّع مدى'),
        ('self-charging hybrid','هجين ذاتي الشحن'),('plug-in hybrid','هجين قابل للشحن'),
        ('mild hybrid','هجين خفيف'),('petrol hybrid','بنزين هجين'),
        ('four-cylinder','أربع أسطوانات'),('flat-six','ست أسطوانات مسطحة'),
        ('twin-turbo','توين تيربو'),('turbo','تيربو'),('petrol','بنزين'),
        ('hybrid battery','بطارية هجينة'),('kWh','كيلوواط/ساعة')]: s=s.replace(en,ar)
    return s

manifest=[]
photo_jobs=[]
photo_paths={}
CONVERSION={'maxEdge':1600,'quality':88,'method':4}
CACHE=RESEARCH/'gallery-photo-cache'
CACHE.mkdir(exist_ok=True)
previous_manifest=APP/'catalog-images.json'
previous_images={p['path']:p for p in json.loads(previous_manifest.read_text()).get('images',[])} if previous_manifest.exists() else {}
for vehicle in source['listings']:
    ident=vehicle['id']; gallery=galleries[ident]['photos']
    assert gallery and len(gallery)==galleries[ident]['count'], ident
    paths=[]
    for index, item in enumerate(gallery,1):
        url=item['url']; extension=pathlib.PurePosixPath(url).suffix.lower()
        assert extension in {'.jpg','.jpeg','.png','.webp'},(ident,url)
        rel=f'public/assets/catalog/gallery-{ident}-{index}.webp'
        photo_jobs.append((ident,index,url,rel))
        paths.append('/'+rel.removeprefix('public/'))
    photo_paths[ident]=paths

def photo(job):
    ident,index,url,rel=job
    assert url.startswith('https://opensooq-imagesv2.os-cdn.com/')
    dest=APP/rel
    dest.parent.mkdir(parents=True,exist_ok=True)
    cache=CACHE/f'{ident}-{index}.json'
    if dest.exists() and (cache.exists() or rel in previous_images):
        saved=json.loads(cache.read_text()) if cache.exists() else previous_images[rel]
        if saved.get('url')==url and saved.get('conversion')==CONVERSION and saved['sha256']==hashlib.sha256(dest.read_bytes()).hexdigest():
            return saved
    old_original=dest.with_name(f'original-{ident}-{index}{pathlib.PurePosixPath(url).suffix.lower()}')
    data=old_original.read_bytes() if old_original.exists() else None
    if data is None:
        for attempt in range(4):
            try:
                with urllib.request.urlopen(urllib.request.Request(url,headers={'User-Agent':'AutoMall-Catalogue/1.0'}),timeout=45) as response: data=response.read()
                break
            except Exception:
                if attempt==3: raise
                time.sleep(1+attempt)
    image=Image.open(io.BytesIO(data)); image.verify()
    image=Image.open(io.BytesIO(data)); source_w,source_h=image.size
    assert image.format in {'JPEG','PNG','WEBP'} and max(source_w,source_h)>=300,(ident,source_w,source_h)
    image=ImageOps.exif_transpose(image)
    image=image.convert('RGBA' if 'A' in image.getbands() else 'RGB')
    image.thumbnail((1600,1600),Image.Resampling.LANCZOS)
    output=io.BytesIO(); image.save(output,format='WEBP',quality=88,method=4)
    optimized=output.getvalue(); dest.write_bytes(optimized)
    w,h=image.size
    result={'id':ident,'index':index,'path':rel,'url':url,'sourceUrl':url,
        'sourceSha256':hashlib.sha256(data).hexdigest(),'sourceBytes':len(data),'sourceWidth':source_w,'sourceHeight':source_h,
        'conversion':CONVERSION,'sha256':hashlib.sha256(optimized).hexdigest(),'width':w,'height':h,'bytes':len(optimized)}
    cache.write_text(json.dumps(result,ensure_ascii=False))
    return result
with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
    manifest=list(pool.map(photo,photo_jobs))

vehicles=[]
premium={'Maserati','Mercedes-Benz','Porsche','BMW','Audi','Land Rover','Zeekr','AVATR','Hongqi'}
for raw in source['listings']:
    ident=raw['id']; a=audit[ident]; d=details[ident]; sf=raw['sourceFields']
    fuel=a['fuelDisplay']; body=a['bodyType']; brand=a['brand']; model=a['model']
    name=model
    if brand=='BMW' and a.get('trim'): name+=' '+a['trim'].split(' ·')[0]
    specs=[]
    def add(label,ar,value,arvalue=None):
        if value is not None and str(value).strip(): specs.append({'label':pair(label,ar),'value':pair(value,arvalue if arvalue is not None else tr(value))})
    add('Model year','سنة الموديل',a['year'])
    add('Trim / edition','الفئة / الإصدار',a.get('trim'))
    condition=(sf.get('condition') or [None])[0]
    mileage=(sf.get('kilometers') or [None])[0]
    add('Condition','الحالة',condition)
    add('Mileage','المسافة المقطوعة',mileage,mileage.replace('km','كم') if mileage else None)
    add('Fuel / powertrain','الوقود / نظام الحركة',fuel)
    add('Body style','نوع الهيكل',body)
    add('Seats','المقاعد',a.get('seats'))
    overrides=a.get('specificationOverrides',{})
    transmission=overrides.get('transmission',a.get('transmission'))
    add('Transmission','ناقل الحركة',transmission)
    add('Exterior colour','اللون الخارجي',a.get('exteriorColor'))
    add('Interior colour','لون المقصورة',a.get('interiorColor'))
    for key,label,ar in [('engine','Engine / hybrid system','المحرك / النظام الهجين'),('drive','Drive','نظام الدفع'),('battery','Battery (seller stated)','البطارية (بحسب الإعلان)')]:
        add(label,ar,overrides.get(key),tech_ar(overrides[key]) if key in overrides else None)
    # Use each exact EV listing's caption; never substitute another trim's range.
    range_entry=ranges.get(ident)
    if fuel=='Electric':
        assert range_entry and range_entry['sourceURL']==a['sourceURL'],ident
        add('Advertised driving range','مدى القيادة المعلن',range_entry['displayEnglish'],range_entry['displayArabic'])
    region=(sf.get('specs') or [None])[0]
    add('Market specification','فئة المواصفات',region)
    add('Dealer listing ID','رقم إعلان المعرض',ident)
    categories=['electric' if fuel=='Electric' else 'gasoline' if fuel=='Petrol' else 'hybrid']
    if body=='SUV':categories.append('suv')
    if brand in premium:categories.append('premium')
    color=a.get('exteriorColor')
    en=f"{a['year']} {brand} {name}. {condition}; {mileage} advertised. {a.get('trim') or body}."
    if ident=='288440874': en+=' Advertised price excludes the registration plate.'
    if ident=='287890904': en+=' Advertised price includes the refrigeration unit.'
    ar=f"{brand} {name} موديل {a['year']}. {tr(condition)}؛ عداد معلن {mileage.replace('km','كم')}. {tr(fuel)}."
    if ident=='288440874': ar+=' السعر المعلن لا يشمل لوحة التسجيل.'
    if ident=='287890904': ar+=' السعر المعلن يشمل وحدة التبريد.'
    v={'id':ident,'brand':brand,'name':name,'year':a['year'],
       'image':photo_paths[ident][0],'gallery':photo_paths[ident],'categories':categories,
       'color':pair(f'{color} exterior',f'لون خارجي {tr(color)}'),
       'type':pair(f'{body} · {fuel}',f'{tr(body)} · {tr(fuel)}'),
       'description':pair(en,ar),
       'facts':{'en':[fuel,condition,mileage,a.get('trim') or body],
                'ar':[tr(fuel),tr(condition),mileage.replace('km','كم'),a.get('trim') or tr(body)]},
       'specs':specs,'post':a['sourceURL'],
       'sourceLabel':pair('Original dealer listing','إعلان المعرض الأصلي')}
    if range_entry:v['range']=pair(range_entry['displayEnglish'],range_entry['displayArabic'])
    price=d['vehicleSchema'].get('offers',{}).get('price')
    if price and float(price)>0 and ident!='288700698': v['price']={'amount':int(float(price)),'currency':'JOD'}
    vehicles.append(v)
(APP/'src/catalog-data.json').write_text(json.dumps(vehicles,ensure_ascii=False,indent=2)+'\n')
(APP/'catalog-images.json').write_text(json.dumps({'checkedAt':source['checkedAt'],'images':manifest},ensure_ascii=False,indent=2)+'\n')
print(f'Built {len(vehicles)} audited listings and {len(manifest)} real dealer photographs ({sum(x["bytes"] for x in manifest)/1024/1024:.1f} MiB).')
