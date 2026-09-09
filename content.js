(function () {
  "use strict";

  const l = (zh, en) => ({ zh, en });
  const asset = (name) => `public/assets/legacy/${name}`;

  // The legacy site used the same heating article body for news entries 1–10.
  // It is intentionally preserved here so no published content is silently lost.
  const legacyHeatingBody = [
    l(
      "在畜禽养殖生产过程中，冬季畜禽舍加热取暖已经成为保障生产成绩的必要条件。",
      "In livestock production, heating animal housing in winter is essential for maintaining production performance."
    ),
    l(
      "在畜禽养殖生产过程中，冬季畜禽舍加热取暖已经成为保障生产成绩的必要条件。",
      "In livestock production, heating animal housing in winter is essential for maintaining production performance."
    ),
    l(
      "传统的加热取暖模式包括热风炉取暖、锅炉取暖以及红外线灯取暖等。但随着国家政策变化（原则上不得新建10吨/时及以下的燃煤锅炉）以及饲料成本和人工成本的提高，传统的加热取暖模式已经不能满足生产需求，在这种情况下，一种高效、环保、节能的燃气加热器应运而生。",
      "Traditional systems include hot-air furnaces, boilers and infrared lamps. Policy changes and rising feed and labor costs created demand for efficient, cleaner and energy-saving gas heaters."
    ),
    l(
      "燃气加热器是一款以液化气、天然气或沼气为燃料，在畜禽舍内进行加热升温、干燥的新型加热设备。它的主要优点有：安全、高效、环保、自动化程度高、安装方便、简单易学。",
      "Gas heaters use LPG, natural gas or biogas to heat and dry livestock buildings. Their advantages include safety, efficiency, environmental performance, automation and easy installation."
    ),
    l(
      "在畜禽养殖生产过程中，冬季畜禽舍加热取暖已经成为保障生产成绩的必要条件。",
      "In livestock production, heating animal housing in winter is essential for maintaining production performance."
    ),
    l(
      "传统的加热取暖模式包括热风炉取暖、锅炉取暖以及红外线灯取暖等。但随着国家政策变化（原则上不得新建10吨/时及以下的燃煤锅炉）以及饲料成本和人工成本的提高，传统的加热取暖模式已经不能满足生产需求，在这种情况下，一种高效、环保、节能的燃气加热器应运而生。",
      "Traditional systems include hot-air furnaces, boilers and infrared lamps. Policy changes and rising feed and labor costs created demand for efficient, cleaner and energy-saving gas heaters."
    ),
    l(
      "燃气加热器是一款以液化气、天然气或沼气为燃料，在畜禽舍内进行加热升温、干燥的新型加热设备。它的主要优点有：安全、高效、环保、自动化程度高、安装方便、简单易学。",
      "Gas heaters use LPG, natural gas or biogas to heat and dry livestock buildings. Their advantages include safety, efficiency, environmental performance, automation and easy installation."
    ),
  ];

  const bulkFeedBody = [
    "饲料是现代养殖业发展的物质基础，充足稳定、便捷高效、安全环保的饲料供给，对促进养殖业持续健康发展、保障动物性食品质量安全具有重要意义。为顺应畜牧业转型升级需要，推进饲料供给侧结构性改革，‘十三五’期间，农业部和各级畜牧饲料管理部门，将积极推进散装饲料与养殖场紧密连接，实现养殖业提质增效。近日，记者来到江苏省新沂市，实地探访散装饲料在饲料企业和规模养殖场的推广效果。",
    "饲料厂养殖场实现无缝对接",
    "在江苏省新沂市的中粮饲料厂内，饲料正在通过出料口装进罐装车中，整个过程10分钟，仅需要一位工人进行控制。装满饲料的罐装车将立刻发往养殖场。",
    "现在年产能力24万吨的新沂中粮饲料厂，共有60吨/个散料发放塔6个，3个出料口。目前，散装饲料已占其总产量的40%，是一个不小的比例。",
    "据公司副总经理肖培新介绍，散装饲料的生产可实现直接生产直接装车，随产随出，不需要进行提前备货，不占用仓储设施，也不会出现停产等待拉料的现象，使饲料生产实现计划管理，生产效率得到提升。",
    "散装饲料运输车结构简单，有着较大的输送量，一般在20吨左右。全自动上料卸料，节省人力，节约费用，可连续作业，大大提高了运载效率。每辆散装车均打上铅封，根据铅封号可做到每车料的全程追溯。同时，散装饲料在散装车罐体内密封输送，可以减少损耗，避免污染，保证了散装饲料的质量安全。",
    "对于养殖场饲喂环节，散装饲料车直接卸料进饲料罐中，饲养员在饲喂过程中只需要点动绞龙开关，即可实现自动投料，不需要人工割包倒料的过程，提高了饲喂效率。散装饲料与自动喂料系统的结合，大大节约了养殖人力成本。记者参观的一个存栏母猪1000头的饲养场，只需2人负责饲喂过程的巡查。",
    "一位养殖企业负责人告诉记者，饲料散装散运能够实现饲料厂和养殖场的无缝对接，从而保证饲料的质量和生物安全。散装饲料在散装车罐体内密封输送，可以减少损耗，从饲料加工到养殖场饲喂系统最终到动物口中全程无人为接触，避免污染，保证饲料的质量和畜产品安全，降低养殖场和饲料厂生产运营风险。",
    "此外，散装饲料无需包装，大大减少了塑料编织袋对环境造成的污染。同时，散装饲料运输车罐体全部采用密封性设计，因而在运输过程中对周边环境无污染，具有很好的社会效益。",
    "散装散运散用是多赢之举",
    "散装饲料优点明显，然而要真正推广开，还需要市场的推动，让企业看到使用散装饲料的好处，并获得更多收益。我国饲料企业每年生产的商品饲料超过2亿吨。据测算，在传统袋装销售模式下，每年饲料企业仅在包装、标签、装卸方面的投入就达到140亿元。",
    "在引入散装饲料之前，中粮饲料（新沂）公司进行了周密的市场调研，发现目前畜禽养殖越来越朝着规模化发展，为了提高工作效率，降低人工成本，越来越多的大中型养殖场开始使用自动喂料塔，作为养殖场内部饲料暂存、饲喂装置。经过多方面现场走访、测算，认为散装饲料需求空间广阔，不仅能够降低供需方成本，还能提升效率，保证产品新鲜度。推行饲料直供模式，还能减少中间环节，缩短销售周期，提升终端服务与竞争力。",
    "肖培新给记者算了笔账，袋装饲料的包材费约为30元/吨，而散装饲料不需要包装。一并减少的还有打包费、发货人工费、叉车费等。算下来，在生产环节中散装饲料要比袋装饲料每吨节省36元。在运费方面，以向宿迁肉食公司运输为例，散装车运输（20吨/车）运费约为78元/吨，袋装运输（20吨/车）运费约为60元/吨，差距在18元/吨。虽然散装饲料运输成本高一些，但总体来看明显划算。",
    "对于养殖企业，散装饲料省去了装卸成本，节省人工成本。散装车（20吨/车）卸车费约为2.5元/吨，袋装运输（20吨/车）卸车费约为8元/吨，差距在5.5元/吨。而对于一些与饲料厂联系紧密的大型养殖企业，散装饲料的优势更明显。",
    "‘在当下市场竞争越来越激烈的环境下，对于饲料企业和养殖企业，使用散装发货都是双赢之举。’肖培新说。",
    "让散装饲料设备享受农机补贴",
    "散装饲料目前仍处于初步推广阶段，据了解，散装饲料只占饲料总产量的10%左右，‘十三五’期间争取有较快的提升。",
    "从袋装饲料改为散装饲料意味着整套养殖设备的改造，需要建设成品料塔和自动上料机等配套机械化喂料设备，会使养殖企业增加一次性成本投入。散装饲料的推广应用还受养殖规模的限制，散装饲料节省人工的优势只有达到一定规模后才能体现出来。为了鼓励养殖企业使用散装饲料，一些饲料生产企业为养殖企业无偿建成品料塔和自动上料机等配套机械化喂料设备，前提是在一定时期内使用该企业产品，形成了较紧密的利益连结机制。",
    "‘由于传统养殖习惯，一部分养殖企业还不接受散装饲料，不乐意使用散装饲料。’当地饲料管理部门同志说。思想的转变需要时间，需要各级畜牧饲料管理部门大力宣传推广散装饲料，重点从饲料厂和养殖企业两个方面入手，使全社会认识到饲料散装散运和养殖场散用的经济效益、社会效益和生态效益。",
    "另一方面，亟待落实农机补贴对饲料散装散运工作的支持。虽然农业部已经将养殖场成品料塔、自动上料机和饲料生产企业散装饲料运输车等养殖设备纳入农机补贴范畴，但是从基层农机部门了解，目前很少有散装饲料设备和畜禽养殖设施享受到此项政策。在推广散装饲料工作中，农机购机补贴是覆盖面最广、可操作性最强、支持最直接的普惠扶持政策。各级畜牧饲料管理部门要加强与农机部门的协调力度，把散装饲料设备纳入地方农机补贴目录作为突破口，组织养殖场、设备生产企业等开展技术交流，规范设备制造标准。各级农机管理部门要加强对散装饲料设备纳入农机补贴目录的指导和研究，稳步推进补贴政策惠及散装饲料设备。政府还应在税收和信贷方面予以专项重点扶持，以调动企业的积极性。",
  ].map((paragraph) => l(paragraph, paragraph));

  const newsTitles = {
    1: "传统养殖设备和现代化设备比较之冬季供暖设备",
    2: "传统养殖设备和现代化设备比较之全自动喂料系统",
    3: "传统养殖设备和现代化设备比较之通风系统",
    4: "现代化养殖设备：鲍鱼“别墅”",
    5: "现代化养猪设备对养猪生产的影响：更科学 更环保",
    6: "现代化养猪设备对养猪生产的影响（1）",
    7: "现代化养猪场自动化养猪设备的使用方法",
    8: "现代化器械服务市民 荆门园林工人集中学习器械使用保养",
    9: "广东江门鹤山：加强水产养殖设备巡查 保障养殖户用电安全",
    10: "中国奶牛养殖及养殖设备情况研究报告大纲",
  };
  const newsViews = { 1: 3471, 2: 3458, 3: 3418, 4: 3514, 5: 3451, 6: 3378, 7: 3569, 8: 3411, 9: 4438, 10: 4477 };

  window.HLS_DATA = {
    company: {
      name: l("好利生實業股份有限公司", "HOU LI SHENG ENTERPRISE CO., LTD"),
      shortName: l("好利生實業", "HOU LI SHENG"),
      tagline: l("以專業複材工藝，承載每一份長久信賴", "Engineered FRP solutions, built for lasting trust"),
      eyebrow: l("1975 年創立・台灣專業 FRP 製造", "EST. 1975 · FRP MANUFACTURING IN TAIWAN"),
      phone: "+886-7-7871991",
      fax: "+886-7-7872906",
      email: "hlsfrp@gmail.com",
      line: "7871991",
      address: l("高雄市大寮區大有一街33號", "No. 33, Dayou 1st St., Daliao Dist., Kaohsiung City, Taiwan"),
    },
    ui: {
      zh: {
        home: "首頁",
        about: "關於我們",
        products: "產品中心",
        news: "最新消息",
        contact: "聯絡我們",
        contactUs: "洽詢專案",
        explore: "探索產品",
        learnMore: "了解更多",
        details: "查看詳情",
        backProducts: "返回產品中心",
        backNews: "返回最新消息",
        features: "產品特色",
        applications: "使用範圍",
        specifications: "規格尺寸",
        gallery: "產品實績",
        allProducts: "所有產品",
        latestNews: "歷史消息",
        originalArchive: "原站歷史資料",
        menu: "開啟選單",
        close: "關閉",
        readArticle: "閱讀全文",
        source: "來源",
        published: "發布日期",
        emailUs: "寄送 Email",
        callUs: "立即來電",
        name: "姓名／公司",
        email: "電子信箱",
        phone: "聯絡電話",
        message: "需求說明",
        submit: "建立詢價郵件",
        required: "請填寫姓名、電子信箱與需求說明。",
        mailReady: "已開啟郵件程式，請確認內容後寄出。",
      },
      en: {
        home: "Home",
        about: "About",
        products: "Products",
        news: "News",
        contact: "Contact",
        contactUs: "Start a project",
        explore: "Explore products",
        learnMore: "Learn more",
        details: "View details",
        backProducts: "Back to products",
        backNews: "Back to news",
        features: "Features",
        applications: "Applications",
        specifications: "Specifications",
        gallery: "Project gallery",
        allProducts: "All products",
        latestNews: "Archive",
        originalArchive: "Legacy website archive",
        menu: "Open menu",
        close: "Close",
        readArticle: "Read article",
        source: "Source",
        published: "Published",
        emailUs: "Send email",
        callUs: "Call now",
        name: "Name / company",
        email: "Email",
        phone: "Phone",
        message: "Project requirements",
        submit: "Create inquiry email",
        required: "Please enter your name, email and project requirements.",
        mailReady: "Your email app has been opened. Review the message and send it when ready.",
      },
    },
    about: {
      heading: l("半世紀，專注把複材做到更好", "Five decades of focused composite craftsmanship"),
      lead: l(
        "從高雄大發工業區出發，我們以設計、研發與製造經驗，為產業打造耐用、可靠的 FRP 解決方案。",
        "From Kaohsiung's Dafa Industrial Park, we design and manufacture durable, dependable FRP solutions for industry."
      ),
      paragraphs: [
        l(
          "好利生實業股份有限公司於1975年成立，座落於高雄大發工業區。創業初期以代工 FRP 浴缸為主，後續因 FRP 材質輕便堅固，開始生產飼料桶等大型儲存容器產品。",
          "Hou Li Sheng Enterprise was founded in 1975 in Kaohsiung's Dafa Industrial Park. Starting with OEM FRP bathtubs, the company expanded into feed silos and large storage vessels as the strength and low weight of FRP proved its value."
        ),
        l(
          "1985年，因應泰國廣大的畜牧養殖商機，公司於曼谷成立營運據點，並進一步於佛統建立製造工廠。",
          "In 1985, the company established operations in Bangkok and later a manufacturing facility in Nakhon Pathom to serve Thailand's growing livestock sector."
        ),
        l(
          "從2006年開始，隨著網路資訊發展，業務行銷也由線下實體通路逐步延伸到線上，以推動銷售、提升品牌，並持續透過公司網站與專業展會接觸新客戶。",
          "Since 2006, sales and marketing have expanded from traditional channels to digital outreach, supported by the company website and industry exhibitions."
        ),
        l(
          "2015年東協十國自由貿易協議帶來新的區域機會，公司的市場開發策略也從泰國延伸至越南、馬來西亞等東南亞地區。",
          "The ASEAN market created new regional opportunities, extending business development from Thailand to Vietnam, Malaysia and other Southeast Asian markets."
        ),
        l(
          "成立至今已超過半世紀，我們堅持台灣製造、真材實料的品質，持續累積 FRP 產品設計、研發與生產的專業經驗。",
          "More than half a century later, we remain committed to honest materials, Taiwan manufacturing and deep expertise in FRP design, development and production."
        ),
      ],
      milestones: [
        { year: "1975", text: l("高雄創立，從 FRP 浴缸代工起步", "Founded in Kaohsiung with OEM FRP bathtubs") },
        { year: "1985", text: l("成立泰國據點與製造工廠", "Established Thailand operations and manufacturing") },
        { year: "2006", text: l("拓展數位行銷與跨區域客戶服務", "Expanded digital and regional customer outreach") },
        { year: "2015+", text: l("市場延伸至更多東南亞地區", "Expanded across Southeast Asian markets") },
      ],
    },
    categories: [
      {
        id: "farming",
        name: l("養殖設備", "Farming equipment"),
        description: l("飼料儲存、自動送料、水產養殖與客製配件。", "Feed storage, automated delivery, aquaculture and custom parts."),
        image: asset("IMG_5058.JPG"),
        products: ["feed-system", "aquaculture-tank", "transport-tank", "farming-accessories"],
      },
      {
        id: "wastewater",
        name: l("污水處理設施", "Wastewater treatment"),
        description: l("生活污水淨化、一般化糞池與廚房油水分離。", "Domestic treatment, septic tanks and kitchen grease separation."),
        image: asset("af37.png"),
        products: ["domestic-treatment", "septic-tank", "oil-separator"],
      },
      {
        id: "storage",
        name: l("特殊儲存設備", "Special storage"),
        description: l("耐酸鹼化學桶槽、儲水槽與客製管件。", "Chemical-resistant tanks, water storage and custom fittings."),
        image: asset("xa54.png"),
        products: ["chemical-tank", "water-tank"],
      },
      {
        id: "sanitation",
        name: l("整體衛浴與活動廁所", "Modular sanitation"),
        description: l("快速安裝、使用便利的整體浴室及活動廁所。", "Fast-installation modular bathrooms and portable toilets."),
        image: asset("8r7q.JPG"),
        products: ["integrated-bathroom", "portable-toilet"],
      },
    ],
    products: [
      {
        id: "feed-system",
        category: "farming",
        name: l("飼料桶、自動送料設備及配件", "Feed silos, automatic feeding systems & parts"),
        summary: l("降低人工勞動成本，提高養畜場餵養效率。", "Reduce labor and improve feeding efficiency on livestock farms."),
        features: [l("自動送料系統自動操作，降低人工勞動成本，提高餵養生產效率。", "Automatic operation lowers labor requirements and improves feeding productivity.")],
        applications: l("適用於母豬舍、育肥舍、保育舍等各類牲畜舍。", "Suitable for sow, finishing and nursery houses, and other livestock facilities."),
        specifications: l("送料螺旋：2.5寸至4寸半，直徑約7.5cm；料桶容量與尺寸請參考規格表。", "Feed auger: 2.5 to 4.5 inches, approximately 7.5 cm diameter. See the capacity table for silo dimensions."),
        images: [asset("IMG_5058.JPG"), asset("88s0.png")],
        specImages: [asset("eld9.png")],
      },
      {
        id: "aquaculture-tank",
        category: "farming",
        name: l("水產養殖槽", "Aquaculture tanks"),
        summary: l("耐腐蝕、耐摩擦、重量輕、抗衝擊且韌性佳。", "Corrosion resistant, wear resistant, lightweight and impact tolerant."),
        features: [l("耐腐蝕性強、耐摩擦、重量輕、抗衝擊、韌性佳。", "Strong corrosion and wear resistance with low weight, impact resistance and toughness.")],
        applications: l("適用於淡水、鹽水養殖等各類漁牧業。", "Suitable for freshwater and saltwater aquaculture."),
        specifications: l("可依需求客製。", "Custom sizes are available."),
        images: [asset("image003_msw8.jpg"), asset("image005_p5fe.jpg")],
      },
      {
        id: "transport-tank",
        category: "farming",
        name: l("水產運輸槽", "Aquaculture transport tanks"),
        summary: l("堅固、耐腐蝕且容易搬運的水產運輸容器。", "Durable, corrosion-resistant tanks designed for easier transport."),
        features: [l("耐腐蝕、耐摩擦、重量輕、抗衝擊，兼具韌性與搬運便利性。", "Corrosion and wear resistance, low weight, impact tolerance and easy handling.")],
        applications: l("適用於淡水、鹽水養殖與水產運輸。", "For freshwater and saltwater aquaculture transport."),
        specifications: l("可依需求客製。", "Custom sizes are available."),
        images: [asset("image007_omn3.jpg")],
      },
      {
        id: "farming-accessories",
        category: "farming",
        name: l("養殖設備配件", "Farming equipment accessories"),
        summary: l("依現場需求製作的 FRP 養殖配件與圓形人孔蓋。", "Custom FRP farming accessories and circular access covers."),
        features: [l("耐腐蝕、耐摩擦、重量輕、抗衝擊且容易搬運。", "Corrosion resistant, lightweight, impact tolerant and easy to handle.")],
        applications: l("養殖設備、淡鹽水環境與客製化人孔需求。", "Farming equipment, freshwater or saltwater environments and custom access openings."),
        specifications: l("可依需求客製。", "Custom sizes are available."),
        images: [asset("9msu.png")],
      },
      {
        id: "domestic-treatment",
        category: "wastewater",
        name: l("預鑄式生活污水處理設備－淨化槽", "Prefabricated domestic wastewater treatment tanks"),
        summary: l("依建築用途與處理水量選型的預鑄式淨化設備。", "Prefabricated treatment systems sized for building use and water volume."),
        features: [l("經環保署審定認可，可因應不同建築用途與處理水量。", "Reviewed and approved by Taiwan's environmental authority, with options for different building uses and treatment volumes."), l("處理廁所、廚房、浴室與洗衣等生活污水。", "Treats domestic wastewater from toilets, kitchens, bathrooms and laundry.")],
        applications: l("依建築物用途分類及每日使用人數選擇適用尺寸。", "Select the appropriate size according to building use and daily occupancy."),
        specifications: l("HLS-010 至 HLS-100 等型號，處理容量 2.50 至 25.00 CMD；詳見規格表。", "Models HLS-010 through HLS-100, with treatment capacities from 2.50 to 25.00 CMD. See the specification table."),
        images: [asset("af37.png")],
        specImages: [asset("c5su.png")],
      },
      {
        id: "septic-tank",
        category: "wastewater",
        name: l("生活污水處理設備－一般化糞池", "General septic tanks"),
        summary: l("體積精巧、安裝簡易，適用各式住宅生活污水。", "Compact, simple to install and suitable for residential wastewater."),
        features: [l("安裝簡易，可依建築用途與使用人數選擇處理水量。", "Easy installation with treatment capacity selected by building use and occupancy."), l("處理廁所、廚房、浴室與洗衣等生活污水。", "Treats domestic wastewater from toilets, kitchens, bathrooms and laundry.")],
        applications: l("適用各式住宅生活污水設施。", "Suitable for a wide range of residential wastewater installations."),
        specifications: l("提供方型與圓型，約6人份至500人份多種規格，詳見尺寸表。", "Rectangular and cylindrical models are available from approximately 6-person to 500-person capacities."),
        images: [asset("5ceb83851f72de6a45b7b01fc0533409.jpg"), asset("dwyt.png")],
        specImages: [asset("7an8.png"), asset("c8xs.png")],
      },
      {
        id: "oil-separator",
        category: "wastewater",
        name: l("廚房油水分離槽", "Kitchen grease separators"),
        summary: l("處理家庭與餐廳廚房油污水。", "Separates oils and grease from household and restaurant kitchen wastewater."),
        features: [l("主要功能為處理家用及餐廳廚房油污水。", "Designed to treat oily wastewater from residential and restaurant kitchens.")],
        applications: l("依每日使用水量選擇適用尺寸。", "Select the appropriate size based on daily water usage."),
        specifications: l("可依使用量與現場條件洽詢客製。", "Contact us for sizing based on usage and site conditions."),
        images: [asset("1jxw.png")],
      },
      {
        id: "chemical-tank",
        category: "storage",
        name: l("耐酸鹼化學桶槽及配件", "Chemical-resistant tanks & fittings"),
        summary: l("耐酸鹼、耐衝擊的一體成型工業儲存設備。", "One-piece industrial storage with chemical and impact resistance."),
        features: [l("質地堅韌，搬運簡便，耐震、耐衝擊。", "Tough construction for easy handling, vibration resistance and impact tolerance."), l("對各類酸、鹼具有優良抗腐蝕性。", "Excellent resistance to a wide range of acids and alkalis."), l("流線外型容易清潔，不易藏污。", "Streamlined surfaces are easy to clean."), l("桶體一體成型，不易破裂，兼具耐熱與耐凍性。", "One-piece construction resists cracking and performs across hot and cold conditions.")],
        applications: l("適用於儲水及工業用酸、鹼液體儲存。", "Suitable for water and industrial acid or alkaline liquid storage."),
        specifications: l("可依需求客製。", "Custom sizes are available."),
        images: [asset("image013_q6j5.jpg"), asset("j5y2.png")],
      },
      {
        id: "water-tank",
        category: "storage",
        name: l("儲水槽", "Water storage tanks"),
        summary: l("堅韌、美觀、經濟耐用的一體成型 FRP 儲水槽。", "Tough, clean-looking and economical one-piece FRP water storage."),
        features: [l("質地堅韌，搬運簡便，耐震、耐衝擊。", "Tough construction, easy handling and impact resistance."), l("外型流線美觀、不易藏污，容易清潔。", "Smooth surfaces resist dirt and are easy to clean."), l("桶體一體成型，不易破裂。", "One-piece construction resists cracking.")],
        applications: l("適用於各類儲水需求。", "Suitable for a variety of water storage applications."),
        specifications: l("可依需求客製。", "Custom sizes are available."),
        images: [asset("xa54.png")],
      },
      {
        id: "integrated-bathroom",
        category: "sanitation",
        name: l("整體浴室", "Integrated bathrooms"),
        summary: l("符合日常使用習慣，快速安裝、方便使用。", "Familiar, convenient facilities in a fast-installation modular unit."),
        features: [l("符合一般如廁習慣、安裝迅速、使用方便。", "Designed around familiar routines, with quick installation and convenient use.")],
        applications: l("適用於具備上下水與排水系統，或不便建造固定廁所的住宅、公園、景點、園林與社區等場地。", "For sites with water and drainage access or where permanent construction is impractical, including housing, parks, attractions and communities."),
        specifications: l("整體浴室：147 × 132 × 230 cm；可拆整體浴室：150 × 150 × 230 cm。", "Integrated bathroom: 147 × 132 × 230 cm. Demountable unit: 150 × 150 × 230 cm."),
        images: [asset("8r7q.JPG")],
        specImages: [asset("yxb9.png")],
      },
      {
        id: "portable-toilet",
        category: "sanitation",
        name: l("活動廁所", "Portable toilets"),
        summary: l("適合臨時與彈性場域配置的 FRP 活動廁所。", "FRP portable toilets for temporary and flexible site requirements."),
        features: [l("FRP 外殼耐用、重量相對輕，便於場地配置。", "Durable, comparatively lightweight FRP shell for flexible placement.")],
        applications: l("適用工地、活動、公園、景區與臨時設施。", "Suitable for construction sites, events, parks, attractions and temporary facilities."),
        specifications: l("可依設備內容與現場需求洽詢。", "Contact us for configuration and sizing options."),
        images: [asset("6i5l.jpg"), asset("ucdb.png")],
      },
    ],
    contacts: [
      {
        id: "taiwan",
        region: l("台灣・高雄", "Kaohsiung, Taiwan"),
        company: l("好利生實業股份有限公司", "HOU LI SHENG ENTERPRISE CO., LTD"),
        image: asset("50_4kf8.jpg"),
        address: l("高雄市大寮區大有一街33號", "No. 33, Dayou 1st St., Daliao Dist., Kaohsiung City, Taiwan"),
        phone: "+886-7-7871991",
        fax: "+886-7-7872906",
        email: "hlsfrp@gmail.com",
        line: "7871991",
      },
      {
        id: "thailand",
        region: l("泰國・曼谷", "Bangkok, Thailand"),
        company: l("How Ly Sung (Thailand) Co., LTD.", "How Ly Sung (Thailand) Co., LTD."),
        image: asset("49_dtjh.jpg"),
        address: l("175/1 Modern Home Places 3, Soi Onnut 46, Sukhumvit 77 Road, Suanluang, Bangkok 10250", "175/1 Modern Home Places 3, Soi Onnut 46, Sukhumvit 77 Road, Suanluang, Bangkok 10250"),
        phone: "+66-2-7215667-8",
        fax: "+66-2-7215669",
        email: "frp_thai@outlook.co.th",
        website: "http://www.hls.co.th",
        line: "7871991",
      },
      {
        id: "xiamen",
        region: l("中國・廈門", "Xiamen, China"),
        company: l("廈門好利興機械設備有限公司", "Xiamen HaoLiXing Livestock Machinery Co., Ltd."),
        image: asset("51_2s6h.jpg"),
        address: l("廈門市思明區禾祥西路", "Hexiang West Road, Siming District, Xiamen"),
        phone: "15001388846",
        email: "3232588119@qq.com",
      },
    ],
    news: [
      {
        id: 21,
        title: l("散装饲料助现代畜牧业提质增效", "Bulk feed improves quality and efficiency in modern livestock farming"),
        date: "2016-11-15",
        source: l("农民日报（原站标示）", "Farmers' Daily (as credited on the legacy site)"),
        author: "hkfb16ff",
        views: 4556,
        summary: l("饲料是现代养殖业发展的物质基础，散装饲料与自动喂料系统的结合可提升效率并节省人力成本。", "Bulk feed and automated feeding systems can improve efficiency, reduce handling and lower labor costs."),
        body: bulkFeedBody,
      },
      ...Object.keys(newsTitles)
        .map(Number)
        .sort((a, b) => b - a)
        .map((id) => ({
          id,
          title: l(newsTitles[id], newsTitles[id]),
          date: "2016-09-05",
          source: l("原站未註明", "Not specified on the legacy site"),
          author: "hkfb16ff",
          views: newsViews[id],
          summary: l("在畜禽養殖生產中，冬季加熱與現代化設備對生產效率與管理具有重要影響。", "Winter heating and modern equipment can have an important impact on livestock productivity and operations."),
          body: legacyHeatingBody,
        })),
    ],
  };
})();
