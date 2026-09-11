(function () {
  "use strict";

  const supported = ["zh", "zh-CN", "en", "th"];
  const languageTags = { zh: "zh-Hant", "zh-CN": "zh-Hans", en: "en", th: "th" };

  const traditionalChars = "並亞來係個們備價優儲內凍剛創動務勞區協參啟單國圍園圓圖執堅場學實審寫專對導帶廁廈廚廠廣廳強彈徑從慣應戶換擇擊據數時暫會東條業構標樣機歷殼決沒淨漁潔濟瀏灣為無熱營現環產發確種積節範築簡糞紀約細結絡統經維網線總績續纖習聯臨與興舊著蓋藝處號蝕衛衝裝製複見規覽觀觸計訊討設訴註評詢試話詳認說請論議讀讓豬貿資質賴跡載輕輸轉這進運過適選郵銷鑄長門閉開間閱關隨離電韌響頁預類顯飼養餵馬驗體鹼鹽點";
  const simplifiedChars = "并亚来系个们备价优储内冻刚创动务劳区协参启单国围园圆图执坚场学实审写专对导带厕厦厨厂广厅强弹径从惯应户换择击据数时暂会东条业构标样机历壳决没净渔洁济浏湾为无热营现环产发确种积节范筑简粪纪约细结络统经维网线总绩续纤习联临与兴旧着盖艺处号蚀卫冲装制复见规览观触计讯讨设诉注评询试话详认说请论议读让猪贸资质赖迹载轻输转这进运过适选邮销铸长门闭开间阅关随离电韧响页预类显饲养喂马验体硷盐点";
  const simplifiedSourceChars = "万与专业东两个为举义乐习争产亿仅从仓优会传体侧偿储关养内农况准减划则别务动励势协单厂参双发变台号吨员响园国场处备够头学实对导将层广应开强当录态总惯户报损据无时显暂术机条来极构标栏气测济温满灯炉点热猪环现电畴盖着础种积税稳竞笔签简粮紧红约级纲纳线组织终绍经结给绞统绩续编缝缩联节苏荆获营虽补装观规触计认让记设访证识诉该说调负责账货质购贴贷费赢车转载较辆输边达迁过运还这进连钟铅销锅门间阔阶险随项顺风饲鱼鲍鲜鹤龙";
  const traditionalTargetChars = "萬與專業東兩個為舉義樂習爭產億僅從倉優會傳體側償儲關養內農況準減劃則別務動勵勢協單廠參雙發變臺號噸員響園國場處備夠頭學實對導將層廣應開強當錄態總慣戶報損據無時顯暫術機條來極構標欄氣測濟溫滿燈爐點熱豬環現電疇蓋著礎種積稅穩競筆簽簡糧緊紅約級綱納線組織終紹經結給絞統績續編縫縮聯節蘇荊獲營雖補裝觀規觸計認讓記設訪證識訴該說調負責賬貨質購貼貸費贏車轉載較輛輸邊達遷過運還這進連鐘鉛銷鍋門間闊階險隨項順風飼魚鮑鮮鶴龍";

  const thaiByEnglish = {
    "In livestock production, heating animal housing in winter is essential for maintaining production performance.": "ในการผลิตปศุสัตว์ การให้ความอบอุ่นแก่โรงเรือนในฤดูหนาวเป็นปัจจัยสำคัญต่อประสิทธิภาพการผลิต",
    "Traditional systems include hot-air furnaces, boilers and infrared lamps. Policy changes and rising feed and labor costs created demand for efficient, cleaner and energy-saving gas heaters.": "ระบบแบบดั้งเดิมมีทั้งเตาลมร้อน หม้อไอน้ำ และหลอดอินฟราเรด การเปลี่ยนแปลงนโยบายรวมถึงต้นทุนอาหารสัตว์และแรงงานที่สูงขึ้น ทำให้เกิดความต้องการเครื่องทำความร้อนด้วยก๊าซที่มีประสิทธิภาพ สะอาด และประหยัดพลังงาน",
    "Gas heaters use LPG, natural gas or biogas to heat and dry livestock buildings. Their advantages include safety, efficiency, environmental performance, automation and easy installation.": "เครื่องทำความร้อนด้วยก๊าซใช้ LPG ก๊าซธรรมชาติ หรือก๊าซชีวภาพ เพื่อเพิ่มอุณหภูมิและลดความชื้นในโรงเรือน จุดเด่นคือปลอดภัย มีประสิทธิภาพ เป็นมิตรต่อสิ่งแวดล้อม ทำงานอัตโนมัติ และติดตั้งง่าย",
    "HOU LI SHENG ENTERPRISE CO., LTD": "บริษัท โฮ่ว ลี่ เซิง เอ็นเตอร์ไพรส์ จำกัด",
    "HOU LI SHENG": "โฮ่ว ลี่ เซิง",
    "Engineered FRP solutions, built for lasting trust": "โซลูชัน FRP ที่ออกแบบอย่างมืออาชีพ เพื่อความไว้วางใจที่ยั่งยืน",
    "EST. 1975 · FRP MANUFACTURING IN TAIWAN": "ก่อตั้ง พ.ศ. 2518 · ผู้ผลิต FRP มืออาชีพจากไต้หวัน",
    "No. 33, Dayou 1st St., Daliao Dist., Kaohsiung City, Taiwan": "เลขที่ 33 ถนนต้าโหย่ว 1 เขตต้าเหลียว เมืองเกาสง ไต้หวัน",
    "Five decades of focused composite craftsmanship": "กว่าห้าทศวรรษแห่งความเชี่ยวชาญด้านวัสดุคอมโพสิต",
    "From Kaohsiung's Dafa Industrial Park, we design and manufacture durable, dependable FRP solutions for industry.": "จากนิคมอุตสาหกรรมต้าฟา เมืองเกาสง เราออกแบบและผลิตโซลูชัน FRP ที่ทนทานและเชื่อถือได้สำหรับภาคอุตสาหกรรม",
    "Hou Li Sheng Enterprise was founded in 1975 in Kaohsiung's Dafa Industrial Park. Starting with OEM FRP bathtubs, the company expanded into feed silos and large storage vessels as the strength and low weight of FRP proved its value.": "โฮ่ว ลี่ เซิง ก่อตั้งขึ้นในปี 1975 ที่นิคมอุตสาหกรรมต้าฟา เมืองเกาสง เริ่มจากการรับผลิตอ่างอาบน้ำ FRP และขยายสู่ไซโลอาหารสัตว์กับถังเก็บขนาดใหญ่ ด้วยคุณสมบัติแข็งแรงและน้ำหนักเบาของ FRP",
    "In 1985, the company established operations in Bangkok and later a manufacturing facility in Nakhon Pathom to serve Thailand's growing livestock sector.": "ในปี 1985 บริษัทเริ่มดำเนินงานในกรุงเทพฯ และต่อมาได้ตั้งฐานการผลิตในนครปฐม เพื่อรองรับการเติบโตของอุตสาหกรรมปศุสัตว์ไทย",
    "Since 2006, sales and marketing have expanded from traditional channels to digital outreach, supported by the company website and industry exhibitions.": "ตั้งแต่ปี 2006 งานขายและการตลาดได้ขยายจากช่องทางดั้งเดิมสู่สื่อดิจิทัล เว็บไซต์บริษัท และงานแสดงสินค้าอุตสาหกรรม",
    "The ASEAN market created new regional opportunities, extending business development from Thailand to Vietnam, Malaysia and other Southeast Asian markets.": "ตลาดอาเซียนสร้างโอกาสใหม่ ทำให้ธุรกิจขยายจากไทยไปยังเวียดนาม มาเลเซีย และประเทศอื่นในเอเชียตะวันออกเฉียงใต้",
    "More than half a century later, we remain committed to honest materials, Taiwan manufacturing and deep expertise in FRP design, development and production.": "ตลอดเวลากว่าครึ่งศตวรรษ เรายังคงยึดมั่นในวัสดุคุณภาพ การผลิตในไต้หวัน และความเชี่ยวชาญด้านการออกแบบ พัฒนา และผลิต FRP",
    "Founded in Kaohsiung with OEM FRP bathtubs": "ก่อตั้งที่เกาสง เริ่มจากการรับผลิตอ่างอาบน้ำ FRP",
    "Established Thailand operations and manufacturing": "จัดตั้งสำนักงานและฐานการผลิตในประเทศไทย",
    "Expanded digital and regional customer outreach": "ขยายช่องทางดิจิทัลและการบริการลูกค้าในภูมิภาค",
    "Expanded across Southeast Asian markets": "ขยายธุรกิจสู่ตลาดเอเชียตะวันออกเฉียงใต้",
    "Farming equipment": "อุปกรณ์การเกษตรและปศุสัตว์",
    "Feed storage, automated delivery, aquaculture and custom parts.": "ระบบเก็บและลำเลียงอาหารอัตโนมัติ อุปกรณ์เพาะเลี้ยงสัตว์น้ำ และชิ้นส่วนสั่งทำ",
    "Wastewater treatment": "ระบบบำบัดน้ำเสีย",
    "Domestic treatment, septic tanks and kitchen grease separation.": "ถังบำบัดน้ำเสีย ถังเกรอะ และถังดักไขมันสำหรับครัว",
    "Special storage": "ถังเก็บเฉพาะทาง",
    "Chemical-resistant tanks, water storage and custom fittings.": "ถังทนสารเคมี ถังเก็บน้ำ และข้อต่อสั่งทำ",
    "Modular sanitation": "สุขภัณฑ์แบบโมดูลาร์",
    "Fast-installation modular bathrooms and portable toilets.": "ห้องน้ำสำเร็จรูปติดตั้งรวดเร็วและสุขาเคลื่อนที่",
    "Feed silos, automatic feeding systems & parts": "ไซโลอาหารสัตว์ ระบบให้อาหารอัตโนมัติ และอะไหล่",
    "Reduce labor and improve feeding efficiency on livestock farms.": "ลดแรงงานและเพิ่มประสิทธิภาพการให้อาหารในฟาร์มปศุสัตว์",
    "Automatic operation lowers labor requirements and improves feeding productivity.": "ระบบอัตโนมัติช่วยลดแรงงานและเพิ่มประสิทธิภาพการให้อาหาร",
    "Suitable for sow, finishing and nursery houses, and other livestock facilities.": "เหมาะสำหรับโรงเรือนแม่พันธุ์ โรงเรือนขุน โรงเรือนอนุบาล และฟาร์มปศุสัตว์ประเภทอื่น",
    "Feed auger: 2.5 to 4.5 inches, approximately 7.5 cm diameter. See the capacity table for silo dimensions.": "สกรูลำเลียงอาหารขนาด 2.5–4.5 นิ้ว เส้นผ่านศูนย์กลางประมาณ 7.5 ซม. โปรดดูตารางความจุสำหรับขนาดไซโล",
    "Aquaculture tanks": "ถังเพาะเลี้ยงสัตว์น้ำ",
    "Corrosion resistant, wear resistant, lightweight and impact tolerant.": "ทนการกัดกร่อน ทนการสึกหรอ น้ำหนักเบา และทนแรงกระแทก",
    "Strong corrosion and wear resistance with low weight, impact resistance and toughness.": "ทนการกัดกร่อนและสึกหรอ น้ำหนักเบา ทนแรงกระแทก และเหนียวแข็งแรง",
    "Suitable for freshwater and saltwater aquaculture.": "เหมาะสำหรับการเพาะเลี้ยงสัตว์น้ำทั้งน้ำจืดและน้ำเค็ม",
    "Custom sizes are available.": "สามารถสั่งผลิตขนาดพิเศษได้",
    "Aquaculture transport tanks": "ถังขนส่งสัตว์น้ำ",
    "Durable, corrosion-resistant tanks designed for easier transport.": "ถังทนทานและทนการกัดกร่อน ออกแบบเพื่อความสะดวกในการขนส่ง",
    "Corrosion and wear resistance, low weight, impact tolerance and easy handling.": "ทนการกัดกร่อนและสึกหรอ น้ำหนักเบา ทนแรงกระแทก และเคลื่อนย้ายง่าย",
    "For freshwater and saltwater aquaculture transport.": "สำหรับขนส่งสัตว์น้ำทั้งน้ำจืดและน้ำเค็ม",
    "Farming equipment accessories": "อุปกรณ์เสริมสำหรับงานปศุสัตว์",
    "Custom FRP farming accessories and circular access covers.": "อุปกรณ์ FRP สั่งทำสำหรับฟาร์มและฝาปิดช่องตรวจแบบกลม",
    "Corrosion resistant, lightweight, impact tolerant and easy to handle.": "ทนการกัดกร่อน น้ำหนักเบา ทนแรงกระแทก และใช้งานสะดวก",
    "Farming equipment, freshwater or saltwater environments and custom access openings.": "เหมาะกับอุปกรณ์ฟาร์ม สภาพแวดล้อมน้ำจืดหรือน้ำเค็ม และช่องตรวจสั่งทำ",
    "Prefabricated domestic wastewater treatment tanks": "ถังบำบัดน้ำเสียสำเร็จรูป",
    "Prefabricated treatment systems sized for building use and water volume.": "ระบบบำบัดสำเร็จรูปที่เลือกขนาดตามประเภทอาคารและปริมาณน้ำ",
    "Reviewed and approved by Taiwan's environmental authority, with options for different building uses and treatment volumes.": "ผ่านการรับรองจากหน่วยงานสิ่งแวดล้อมไต้หวัน และมีรุ่นสำหรับอาคารกับปริมาณน้ำที่แตกต่างกัน",
    "Treats domestic wastewater from toilets, kitchens, bathrooms and laundry.": "บำบัดน้ำเสียจากห้องน้ำ ครัว ห้องอาบน้ำ และงานซักล้าง",
    "Select the appropriate size according to building use and daily occupancy.": "เลือกขนาดให้เหมาะกับประเภทอาคารและจำนวนผู้ใช้งานต่อวัน",
    "Models HLS-010 through HLS-100, with treatment capacities from 2.50 to 25.00 CMD. See the specification table.": "รุ่น HLS-010 ถึง HLS-100 รองรับ 2.50–25.00 ลูกบาศก์เมตรต่อวัน โปรดดูตารางข้อมูลจำเพาะ",
    "General septic tanks": "ถังเกรอะทั่วไป",
    "Compact, simple to install and suitable for residential wastewater.": "ขนาดกะทัดรัด ติดตั้งง่าย เหมาะสำหรับน้ำเสียจากที่พักอาศัย",
    "Easy installation with treatment capacity selected by building use and occupancy.": "ติดตั้งง่าย และเลือกความสามารถในการบำบัดตามประเภทอาคารกับจำนวนผู้ใช้งาน",
    "Suitable for a wide range of residential wastewater installations.": "เหมาะสำหรับระบบน้ำเสียในที่พักอาศัยหลายรูปแบบ",
    "Rectangular and cylindrical models are available from approximately 6-person to 500-person capacities.": "มีทั้งแบบสี่เหลี่ยมและทรงกระบอก รองรับประมาณ 6–500 คน",
    "Kitchen grease separators": "ถังดักไขมันในครัว",
    "Separates oils and grease from household and restaurant kitchen wastewater.": "แยกน้ำมันและไขมันออกจากน้ำเสียในครัวเรือนและร้านอาหาร",
    "Designed to treat oily wastewater from residential and restaurant kitchens.": "ออกแบบสำหรับบำบัดน้ำเสียที่มีไขมันจากครัวบ้านและร้านอาหาร",
    "Select the appropriate size based on daily water usage.": "เลือกขนาดตามปริมาณน้ำที่ใช้ต่อวัน",
    "Contact us for sizing based on usage and site conditions.": "ติดต่อเราเพื่อเลือกขนาดตามการใช้งานและสภาพพื้นที่",
    "Chemical-resistant tanks & fittings": "ถังทนกรดด่างและข้อต่อ",
    "One-piece industrial storage with chemical and impact resistance.": "ถังเก็บอุตสาหกรรมขึ้นรูปชิ้นเดียว ทนสารเคมีและแรงกระแทก",
    "Tough construction for easy handling, vibration resistance and impact tolerance.": "โครงสร้างแข็งแรง เคลื่อนย้ายง่าย ทนการสั่นสะเทือนและแรงกระแทก",
    "Excellent resistance to a wide range of acids and alkalis.": "ทนกรดและด่างหลากหลายชนิดได้ดีเยี่ยม",
    "Streamlined surfaces are easy to clean.": "พื้นผิวเรียบลื่น ทำความสะอาดง่าย",
    "One-piece construction resists cracking and performs across hot and cold conditions.": "โครงสร้างชิ้นเดียวลดการแตกร้าว และใช้งานได้ทั้งสภาพร้อนและเย็น",
    "Suitable for water and industrial acid or alkaline liquid storage.": "เหมาะสำหรับเก็บน้ำและของเหลวกรดหรือด่างในอุตสาหกรรม",
    "Water storage tanks": "ถังเก็บน้ำ",
    "Tough, clean-looking and economical one-piece FRP water storage.": "ถังเก็บน้ำ FRP ชิ้นเดียว แข็งแรง สะอาด และคุ้มค่า",
    "Tough construction, easy handling and impact resistance.": "โครงสร้างแข็งแรง เคลื่อนย้ายง่าย และทนแรงกระแทก",
    "Smooth surfaces resist dirt and are easy to clean.": "พื้นผิวเรียบ ไม่สะสมสิ่งสกปรก และทำความสะอาดง่าย",
    "One-piece construction resists cracking.": "โครงสร้างชิ้นเดียวช่วยป้องกันการแตกร้าว",
    "Suitable for a variety of water storage applications.": "เหมาะสำหรับงานเก็บน้ำหลายประเภท",
    "Integrated bathrooms": "ห้องน้ำสำเร็จรูป",
    "Familiar, convenient facilities in a fast-installation modular unit.": "ห้องน้ำโมดูลาร์ใช้งานสะดวกและติดตั้งรวดเร็ว",
    "Designed around familiar routines, with quick installation and convenient use.": "ออกแบบตามพฤติกรรมการใช้งานทั่วไป ติดตั้งเร็ว และใช้งานสะดวก",
    "For sites with water and drainage access or where permanent construction is impractical, including housing, parks, attractions and communities.": "เหมาะสำหรับพื้นที่ที่มีระบบน้ำและระบายน้ำ หรือพื้นที่ที่สร้างห้องน้ำถาวรได้ยาก เช่น ที่พัก สวนสาธารณะ แหล่งท่องเที่ยว และชุมชน",
    "Integrated bathroom: 147 × 132 × 230 cm. Demountable unit: 150 × 150 × 230 cm.": "ห้องน้ำสำเร็จรูป 147 × 132 × 230 ซม. รุ่นถอดประกอบ 150 × 150 × 230 ซม.",
    "Portable toilets": "สุขาเคลื่อนที่",
    "FRP portable toilets for temporary and flexible site requirements.": "สุขาเคลื่อนที่ FRP สำหรับพื้นที่ชั่วคราวและการจัดวางที่ยืดหยุ่น",
    "Durable, comparatively lightweight FRP shell for flexible placement.": "เปลือก FRP ทนทาน น้ำหนักค่อนข้างเบา และเคลื่อนย้ายจัดวางได้ง่าย",
    "Suitable for construction sites, events, parks, attractions and temporary facilities.": "เหมาะสำหรับไซต์ก่อสร้าง งานกิจกรรม สวนสาธารณะ แหล่งท่องเที่ยว และสถานที่ชั่วคราว",
    "Contact us for configuration and sizing options.": "ติดต่อเราเพื่อสอบถามรูปแบบและขนาดที่เหมาะสม",
    "Kaohsiung, Taiwan": "เกาสง ไต้หวัน",
    "Bangkok, Thailand": "กรุงเทพฯ ประเทศไทย",
    "Bulk feed improves quality and efficiency in modern livestock farming": "อาหารสัตว์แบบเทกองช่วยยกระดับคุณภาพและประสิทธิภาพของปศุสัตว์สมัยใหม่",
    "Farmers' Daily": "หนังสือพิมพ์เกษตรกร",
    "Bulk feed and automated feeding systems can improve efficiency, reduce handling and lower labor costs.": "อาหารสัตว์แบบเทกองร่วมกับระบบให้อาหารอัตโนมัติช่วยเพิ่มประสิทธิภาพ ลดการขนย้าย และลดต้นทุนแรงงาน",
    "Source not specified": "ไม่ระบุแหล่งที่มา",
    "Winter heating and modern equipment can have an important impact on livestock productivity and operations.": "ระบบทำความร้อนในฤดูหนาวและอุปกรณ์สมัยใหม่มีผลสำคัญต่อประสิทธิภาพและการจัดการฟาร์มปศุสัตว์"
  };

  function mapCharacters(value, source, target) {
    return Array.from(String(value)).map((character) => {
      const index = source.indexOf(character);
      return index < 0 ? character : target[index];
    }).join("");
  }

  function toSimplified(value) {
    return mapCharacters(value, traditionalChars, simplifiedChars);
  }

  function toTraditional(value) {
    return mapCharacters(value, simplifiedSourceChars, traditionalTargetChars);
  }

  function localized(zh, en, th = "") {
    return { zh, "zh-CN": toSimplified(zh), en, th: th || thaiByEnglish[en] || en };
  }

  function historical(zhHans, en, th) {
    return { zh: toTraditional(zhHans), "zh-CN": zhHans, en, th };
  }

  function detectLanguage() {
    let saved = null;
    try {
      saved = localStorage.getItem("hls-lang");
    } catch {
      saved = null;
    }
    if (supported.includes(saved)) return saved;

    for (const language of navigator.languages || [navigator.language || "en"]) {
      const normalized = language.toLowerCase();
      if (normalized.startsWith("th")) return "th";
      if (normalized.startsWith("zh")) {
        return /hans|zh-cn|zh-sg|zh-my/.test(normalized) ? "zh-CN" : "zh";
      }
      if (normalized.startsWith("en")) return "en";
    }
    return "en";
  }

  window.HLSLocale = {
    supported,
    languageTags,
    localized,
    historical,
    toSimplified,
    toTraditional,
    detectLanguage,
  };
})();
