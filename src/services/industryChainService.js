/**
 * Industry Chain Knowledge Base Service (臺灣股市全景產業鏈智庫)
 * 整合晶圓半導體、PCB載板、散熱模組、低軌衛星、CPO矽光子、AI伺服器、重電綠能、機器人、傳產等一整條產業鏈
 * 涵蓋上游原料、中游核心加工與零組件、下游終端整合，以及每家公司負責項目、核心技術與最新消息面
 */

export const INDUSTRY_CHAINS_DATA = [
  {
    id: 'PCB_SUBSTRATE',
    name: 'PCB 與 IC 載板產業鏈',
    subtitle: 'Printed Circuit Board & Advanced IC Substrate',
    iconName: 'Cpu',
    tag: 'AI 算力基石',
    themeColor: 'from-amber-500 to-rose-500',
    description: '從銅箔、玻纖布、銅箔基板(CCL)，到高階 HDI、軟板及 ABF/BT 半導體高階載板，支撐晶圓先進封裝與 AI 高速運算傳輸。',
    news: [
      {
        title: '【法說動向】欣興、南電看好 AI 載板稼動率逐季回升，高階 ABF 供不應求',
        source: 'CMoney 股市爆料同學會 & 鉅亨網',
        date: '2026-10-04',
        type: '法說會',
        highlight: '欣興表示次世代 AI 晶片面積大幅擴增 2~3 倍，載板層數推進至 24 層以上，高階 ABF 產能利用率達滿載水準。'
      },
      {
        title: '【材料升級】台光電、台燿受惠 M8/M9 高頻高速 CCL 材料出貨暴增，外資調升評等',
        source: 'MoneyDJ 理財網',
        date: '2026-10-03',
        type: '產業趨勢',
        highlight: 'AI 伺服器傳輸速率邁入 800G/1.6T，極低介電損耗 (Ultra Low Loss) 銅箔基板需求倍增，台廠掌握全球超 75% 份額。'
      },
      {
        title: '【低軌與車用】華通、健鼎 HDI HDI HDI 出貨強勁，切入低軌衛星第二代直連手機與衛星酬載板',
        source: '股癌 Gooaye 產業焦點',
        date: '2026-10-02',
        type: '訂單利多',
        highlight: 'SpaceX 與亞馬遜 Kuiper 衛星全面升級高頻 HDI 規格，華通作為第一大供應商，稼動率穩居 90% 以上。'
      }
    ],
    stages: [
      {
        stageName: '上游：原材料與基礎基板',
        stageDescription: '包含電子級玻璃纖維布、電解銅箔、環氧樹脂以及高頻高速銅箔基板 (CCL)',
        nodes: [
          {
            subCategory: '銅箔基板 (CCL)',
            companies: [
              {
                code: '2383',
                name: '台光電',
                role: '全球無鹵素 CCL 龍頭、AI 伺服器主板第一大供應商',
                techAdvantage: '掌握 M7/M8 等級超低損耗 CCL，市占率超過 60%，深度綁定輝達與北美 CSP 大廠。',
                price: 492.0,
                change: 14.0,
                pctChange: 2.93,
                volume: 8940
              },
              {
                code: '6274',
                name: '台燿',
                role: '高頻高速 CCL 核心大廠，800G 交換器基板主力',
                techAdvantage: '通過白牌雲端交換機 800G 極低損耗基板認證，出貨量顯著放量。',
                price: 184.5,
                change: 3.5,
                pctChange: 1.93,
                volume: 12500
              },
              {
                code: '6213',
                name: '聯茂',
                role: '車用與伺服器高階銅箔基板大廠',
                techAdvantage: '積極切入 M6/M7 高速傳輸板材，泰國新廠於 2025-2026 全面開出產能。',
                price: 76.8,
                change: -0.6,
                pctChange: -0.78,
                volume: 5320
              }
            ]
          },
          {
            subCategory: '玻纖布與銅箔原物料',
            companies: [
              {
                code: '1815',
                name: '富喬',
                role: '電子級超細紗玻纖布專業製造廠',
                techAdvantage: 'Low Dk/Df 低介電玻纖布取得國際大廠認證，供應高階 CCL 必備底材。',
                price: 24.3,
                change: 0.8,
                pctChange: 3.40,
                volume: 18400
              },
              {
                code: '8358',
                name: '金居',
                role: '高頻高速壓延與電解銅箔供應商',
                techAdvantage: 'RG 系列低粗糙度銅箔打入 PCIe Gen5/Gen6 伺服器傳輸板。',
                price: 65.2,
                change: 1.1,
                pctChange: 1.72,
                volume: 4120
              }
            ]
          }
        ]
      },
      {
        stageName: '中游：IC 載板與多層/高密度 PCB 製程',
        stageDescription: '包含半導體封裝載板 (ABF/BT)、高密度互連板 (HDI) 與軟硬結合板',
        nodes: [
          {
            subCategory: 'ABF / BT 半導體載板 (核心關鍵)',
            companies: [
              {
                code: '3037',
                name: '欣興',
                role: '全球 ABF 載板龍頭，AI GPU / ASIC 頂規載板主力供應商',
                techAdvantage: '量產 20+ 層超高層大型 ABF 載板，良率全球領先，獲 NVIDIA、AMD 深度長期認證。',
                price: 182.5,
                change: 4.5,
                pctChange: 2.53,
                volume: 32600
              },
              {
                code: '8046',
                name: '南電',
                role: '台塑集團旗下高階 ABF 與 BT 載板旗艦廠',
                techAdvantage: '專注於高階網通、車用晶片與 AI PC 封裝載板，細線路與微盲孔技術卓越。',
                price: 168.0,
                change: 2.0,
                pctChange: 1.20,
                volume: 9800
              },
              {
                code: '3189',
                name: '景碩',
                role: '和碩集團旗下 ABF 與記憶體 BT 載板大廠',
                techAdvantage: '在手機處理器 BT 載板及中高階 ABF 載板產能充沛，轉投資晶碩挹注獲利。',
                price: 110.5,
                change: -1.0,
                pctChange: -0.90,
                volume: 7200
              }
            ]
          },
          {
            subCategory: '高密度 HDI 與高階硬板',
            companies: [
              {
                code: '2313',
                name: '華通',
                role: '全球 HDI 龍頭、低軌衛星與蘋果全產品鏈核心供應商',
                techAdvantage: '衛星通訊板全球市占率超過 60%，重度受益於星鏈 (Starlink) 天線與衛星發射。',
                price: 78.6,
                change: 1.8,
                pctChange: 2.34,
                volume: 28400
              },
              {
                code: '3044',
                name: '健鼎',
                role: '全球第三大 PCB 製造商，伺服器與車用多層板翹楚',
                techAdvantage: '高層數伺服器板良率優異，財務體質穩健，全面吃下通用型與 AI 伺服器主板。',
                price: 226.0,
                change: 3.0,
                pctChange: 1.35,
                volume: 6400
              },
              {
                code: '4958',
                name: '臻鼎-KY',
                role: '全球 PCB 營收規模第一大廠，軟板/硬板/載板全方位佈局',
                techAdvantage: '鴻海集團主力 PCB 廠，積極擴建深圳與淮安高階載板與折疊機軟板產能。',
                price: 128.5,
                change: 0.5,
                pctChange: 0.39,
                volume: 8100
              }
            ]
          }
        ]
      },
      {
        stageName: '下游：系統組裝與終端應用 (EMS/ODM)',
        stageDescription: '將 PCB/載板焊接晶片與被動元件，製成伺服器主機板、終端電腦及車用電腦',
        nodes: [
          {
            subCategory: '伺服器主板與整機組裝 (ODM)',
            companies: [
              {
                code: '2317',
                name: '鴻海',
                role: '全球 EMS 龍頭，AI 伺服器 GPU 模組與基板代工霸主',
                techAdvantage: '取得 NVIDIA GB200 NVL72 整機機櫃及算力板垂直整合訂單，技術規模無人能及。',
                price: 222.0,
                change: 4.0,
                pctChange: 1.83,
                volume: 76500
              },
              {
                code: '2382',
                name: '廣達',
                role: '全球白牌資料中心雲端伺服器第一大廠',
                techAdvantage: '旗下雲達 (QCT) 具備完整液冷系統整機整合能力，出貨微軟、Google、Meta。',
                price: 284.5,
                change: 6.5,
                pctChange: 2.34,
                volume: 38200
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'COOLING_SYSTEM',
    name: '散熱模組與液冷系統產業鏈',
    subtitle: 'Thermal Management & Liquid Cooling Solutions',
    iconName: 'Flame',
    tag: '解熱革命',
    themeColor: 'from-blue-500 to-cyan-500',
    description: '因應 AI GPU TDP 功耗突破 1000W~1400W，散熱從傳統氣冷/風扇全面躍升至 3D VC 均熱片、水冷板 (Cold Plate)、冷卻液分配裝置 (CDU) 及水冷機櫃。',
    news: [
      {
        title: '【液冷爆發】奇鋐、雙鴻水冷板獲各大 CSP 追單，第 4 季水冷出貨比重突破 30%',
        source: '鉅亨網 & CMoney',
        date: '2026-10-04',
        type: '法說會',
        highlight: '水冷板與分歧管 (Manifold) 毛利率大幅高於傳統氣冷，兩大龍頭獲利結構顯著提升。'
      },
      {
        title: '【CDU關鍵元件】高力、晟銘電加速擴充冷卻液分配單元與水冷機箱產能',
        source: 'MoneyDJ 理財網',
        date: '2026-10-03',
        type: '擴產動態',
        highlight: '伺服器機櫃從氣冷轉向水冷需搭配精密銲接 CDU 與防漏快接頭，台廠供應鏈成為全球少數能供貨的群落。'
      }
    ],
    stages: [
      {
        stageName: '上游：金屬材料、均熱導管與精密加工',
        stageDescription: '包含無氧銅管、鋁擠型散熱片、超薄均熱板 (VC) 毛細結構與均熱面材料',
        nodes: [
          {
            subCategory: '均熱材料與導熱元件',
            companies: [
              {
                code: '3653',
                name: '健策',
                role: '全球均熱片 (Heat Spreader) 龍頭、半導體高階散熱蓋板',
                techAdvantage: '超高平整度鍛造技術，為 AMD 及 Intel 伺服器晶片封裝均熱片獨家/主要供應商。',
                price: 1385.0,
                change: 35.0,
                pctChange: 2.59,
                volume: 1820
              },
              {
                code: '2486',
                name: '一詮',
                role: '導線架與晶片高階均熱片製造廠',
                techAdvantage: '開發出高階相變導熱散熱元件，順利打入晶圓代工龍頭先進封裝 CoWoS 均熱片供應鏈。',
                price: 118.0,
                change: 2.5,
                pctChange: 2.16,
                volume: 8400
              }
            ]
          }
        ]
      },
      {
        stageName: '中游：散熱模組、風扇與液冷核心零組件',
        stageDescription: '包含 3D 均熱板 (3D VC)、散熱風扇、水冷板 (Cold Plate)、分歧管 (Manifold) 及 CDU',
        nodes: [
          {
            subCategory: '水冷板與整體散熱模組 (核心旗艦)',
            companies: [
              {
                code: '3017',
                name: '奇鋐',
                role: '全球伺服器散熱模組龍頭，水冷板與 3D VC 供應大廠',
                techAdvantage: '具備自家風扇 (AVC)、水冷板、分歧管垂直整合優勢，獲北美主要雲端客戶大單。',
                price: 615.0,
                change: 17.0,
                pctChange: 2.84,
                volume: 15300
              },
              {
                code: '3324',
                name: '雙鴻',
                role: '高階水冷散熱先驅，AI 伺服器水冷板關鍵供應商',
                techAdvantage: '自主研發水冷板、快接頭測試實驗室，已獲 NVIDIA 官方推薦名單肯定。',
                price: 662.0,
                change: 12.0,
                pctChange: 1.85,
                volume: 6200
              },
              {
                code: '2421',
                name: '建準',
                role: '全球散熱風扇龍頭、高轉速大風壓伺服器風扇大廠',
                techAdvantage: '磁浮馬達壽命與高散熱效率技術深厚，在水冷機櫃與電源散熱中仍不可或缺。',
                price: 98.4,
                change: -0.6,
                pctChange: -0.61,
                volume: 7800
              }
            ]
          },
          {
            subCategory: '冷卻液分配裝置 (CDU) 與水冷機箱',
            companies: [
              {
                code: '8996',
                name: '高力',
                role: '板式熱交換器龍頭，液冷 CDU 熱交換核心組件',
                techAdvantage: '硬焊型熱交換器具備超高抗壓與熱傳效率，成為資料中心液冷 CDU 首選核心。',
                price: 362.5,
                change: 8.5,
                pctChange: 2.40,
                volume: 4100
              },
              {
                code: '3013',
                name: '晟銘電',
                role: '伺服器機殼與水冷機櫃製造商，液冷分歧管 (Manifold)',
                techAdvantage: '開發出高精度防漏水冷機箱與自動化組裝線，緊密配合廣達等各大 ODM 廠。',
                price: 146.0,
                change: 5.0,
                pctChange: 3.55,
                volume: 19800
              }
            ]
          }
        ]
      },
      {
        stageName: '下游：整機水冷系統整合與雲端資料中心運維',
        stageDescription: '整機櫃液冷散熱測試、機房冷卻水塔與液冷監控系統 (DLC / 浸沒式散熱)',
        nodes: [
          {
            subCategory: '水冷機櫃與電源整合',
            companies: [
              {
                code: '2308',
                name: '台達電',
                role: '全球綠能電源與資料中心整體散熱方案霸主',
                techAdvantage: '從伺服器鈦金級超大瓦數電源、水冷板到整座機房冷卻基礎設施一站式包辦。',
                price: 388.0,
                change: 4.5,
                pctChange: 1.17,
                volume: 14200
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'LOW_EARTH_ORBIT',
    name: '低軌衛星與太空通訊產業鏈',
    subtitle: 'Low Earth Orbit (LEO) Satellite & Space Tech',
    iconName: 'Globe',
    tag: '星際通訊',
    themeColor: 'from-indigo-600 to-purple-600',
    description: '涵蓋衛星酬載微波元件、化合物半導體射頻元件、高多層衛星專用 PCB、地面接收站天線相位陣列與系統整合，全面受惠 SpaceX、OneWeb 等商用太空軍備競賽。',
    news: [
      {
        title: '【星鏈大單】昇達科低軌衛星微波元件營收年增 120%，毛利率突破 50%',
        source: '鉅亨網 & 股癌觀點',
        date: '2026-10-04',
        type: '法說會',
        highlight: '低軌衛星高頻毫米波 (E-band) 酬載濾波器出貨加速，已成為 SpaceX、Amazon Kuiper 核心直供夥伴。'
      },
      {
        title: '【太空PCB】華通取得次世代低軌衛星直連手機板 (Direct-to-Cell) 獨家供貨權',
        source: 'MoneyDJ 理財網',
        date: '2026-10-02',
        type: '訂單利多',
        highlight: 'SpaceX 積極布建手機直連衛星網絡，華通受惠高單價、高耐候性多層 HDI 板放量出貨。'
      }
    ],
    stages: [
      {
        stageName: '上游：高頻射頻元件、航太級微波材料與化合物半導體',
        stageDescription: '耐極端溫差與輻射之電子元件、GaN/GaAs 砷化鎵高頻功率放大器',
        nodes: [
          {
            subCategory: '射頻與化合物半導體',
            companies: [
              {
                code: '3105',
                name: '穩懋',
                role: '全球砷化鎵 (GaAs) 晶圓代工龍頭',
                techAdvantage: '提供衛星上行/下行高頻微波 PA 功率放大器代工，耐高頻與高溫特性絕佳。',
                price: 132.5,
                change: 1.5,
                pctChange: 1.15,
                volume: 5800
              },
              {
                code: '8086',
                name: '宏捷科',
                role: '砷化鎵代工二哥，低軌衛星射頻功率放大器',
                techAdvantage: '產品通過航太通訊可靠度驗證，受惠手機直連衛星射頻晶片拉貨。',
                price: 112.0,
                change: -1.0,
                pctChange: -0.88,
                volume: 4200
              }
            ]
          }
        ]
      },
      {
        stageName: '中游：衛星本體酬載 (Payload)、天線陣列與衛星專用 PCB',
        stageDescription: '衛星本體微波通訊濾波器、波導管、多工器以及耐低溫多層高頻 PCB 板',
        nodes: [
          {
            subCategory: '衛星微波通訊元件 (關鍵核心)',
            companies: [
              {
                code: '3491',
                name: '昇達科',
                role: '全球低軌衛星高頻微波元件龍頭，直供三大衛星營運商',
                techAdvantage: '毫米波 E-band 濾波器、相控陣天線饋源元件全球領先，為星鏈與 Kuiper 關鍵夥伴。',
                price: 312.0,
                change: 16.0,
                pctChange: 5.41,
                volume: 9600
              },
              {
                code: '2313',
                name: '華通',
                role: '低軌衛星專用高密度互連 (HDI) PCB 第一大供應商',
                techAdvantage: '衛星板市占全球過半，具備嚴苛航太防震耐候驗證標準，出貨衛星本體與地面站。',
                price: 78.6,
                change: 1.8,
                pctChange: 2.34,
                volume: 28400
              }
            ]
          }
        ]
      },
      {
        stageName: '下游：地面接收站 (User Terminal) 與網通系統組裝',
        stageDescription: '相位陣列天線接收器、路由器、衛星地面通訊網關與家用接收套件製造',
        nodes: [
          {
            subCategory: '地面接收設備與網通整合',
            companies: [
              {
                code: '6285',
                name: '啟碁',
                role: '網通設備龍頭，SpaceX 地面接收站天線與路由器代工廠',
                techAdvantage: '高階陣列天線設計實力強大，車用衛星通訊模組亦切入全球一線車廠。',
                price: 142.5,
                change: 2.0,
                pctChange: 1.42,
                volume: 6800
              },
              {
                code: '5388',
                name: '中磊',
                role: '電信寬頻網通大廠，企業級與衛星混合通訊設備',
                techAdvantage: '直銷電信商營運模式成熟，提供衛星寬頻與 5G FWA 融合方案。',
                price: 114.0,
                change: -0.5,
                pctChange: -0.44,
                volume: 3400
              },
              {
                code: '2312',
                name: '金寶',
                role: '電子代工大廠，衛星地面基地台組裝',
                techAdvantage: '長期為全球主要衛星營運商代工地面接收機櫃與電源基板。',
                price: 21.8,
                change: 0.4,
                pctChange: 1.87,
                volume: 24500
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'CPO_PHOTONICS',
    name: 'CPO 矽光子與光通訊產業鏈',
    subtitle: 'Co-Packaged Optics (CPO) & Silicon Photonics',
    iconName: 'Zap',
    tag: '光進銅退',
    themeColor: 'from-violet-600 to-pink-600',
    description: '解決 AI 超級算力銅線傳輸耗能與延遲瓶頸，將光引擎與交換晶片共裝封裝 (CPO)，引爆 800G / 1.6T 矽光子革命。',
    news: [
      {
        title: '【光電共裝】台積電領軍矽光子聯盟，聯亞、華星光共同驗證次世代 CPO 光引擎',
        source: 'CMoney 股市爆料同學會',
        date: '2026-10-04',
        type: '技術突破',
        highlight: '台積電 COUPE 異質整合封裝技術推進，預計 2026 年底邁入量產階段。'
      },
      {
        title: '【800G爆發】智邦、眾達-KY 800G 光收發模組出貨暢旺，帶動營收創高',
        source: 'MoneyDJ 理財網',
        date: '2026-10-03',
        type: '營收動能',
        highlight: '資料中心 AI 叢集對高速低延遲光互連需求迫切，光模組成為算力集群不可或缺之核心。'
      }
    ],
    stages: [
      {
        stageName: '上游：磷化銦雷射磊晶、光學晶片與光纖零組件',
        stageDescription: '包含 InP 磷化銦磊晶片、連續波外部光源 (CW Laser)、高精度光纖陣列 (FAU)',
        nodes: [
          {
            subCategory: '雷射磊晶與光纖陣列',
            companies: [
              {
                code: '3081',
                name: '聯亞',
                role: '全球矽光子雷射磊晶龍頭，CW Laser 磊晶片關鍵供應商',
                techAdvantage: '磷化銦 (InP) 磊晶材料良率傲視全球，為美系晶片巨頭 CPO 光源必備合作夥伴。',
                price: 348.0,
                change: 18.0,
                pctChange: 5.45,
                volume: 12200
              },
              {
                code: '3363',
                name: '上詮',
                role: '光纖被動元件廠，台積電矽光子光纖連接器關鍵夥伴',
                techAdvantage: '開發出高階保偏光纖陣列 (FAU) 與光學跳線，切入 CoWoS-CPO 連接架構。',
                price: 215.0,
                change: 9.0,
                pctChange: 4.37,
                volume: 8700
              },
              {
                code: '3163',
                name: '波若威',
                role: '高密度光波分多工器 (WDM) 與微光學元件大廠',
                techAdvantage: '高通道光連接模組獲得國際大廠採用，具備自動化高精度耦合封裝實力。',
                price: 135.5,
                change: 2.5,
                pctChange: 1.88,
                volume: 6400
              }
            ]
          }
        ]
      },
      {
        stageName: '中游：光收發模組 (Transceiver) 與矽光晶片封裝',
        stageDescription: '400G / 800G / 1.6T 光收發模組製造、光電混合封裝測試',
        nodes: [
          {
            subCategory: '光收發模組與矽光封裝 (核心代工)',
            companies: [
              {
                code: '4979',
                name: '華星光',
                role: '高階雲端資料中心 800G 光通訊主動元件與模組主力',
                techAdvantage: '與北美雲端大廠 (Marvell 等) 合作密切，具備晶粒自製與模組化整合實力。',
                price: 154.0,
                change: 4.0,
                pctChange: 2.67,
                volume: 14800
              },
              {
                code: '4977',
                name: '眾達-KY',
                role: '高階光收發模組專業廠，深耕外部光源與 CPO 光引擎',
                techAdvantage: '與博通 (Broadcom) 深度合作開拓 CPO 共同封裝光學標準模組。',
                price: 92.6,
                change: 1.2,
                pctChange: 1.31,
                volume: 5300
              },
              {
                code: '4908',
                name: '前鼎',
                role: '光收發模組廠，主攻電信與資料中心高階光模組',
                techAdvantage: '具備微型化光收發封裝專利，持續提升 800G 產能良率。',
                price: 88.2,
                change: -0.4,
                pctChange: -0.45,
                volume: 3100
              }
            ]
          }
        ]
      },
      {
        stageName: '下游：白牌交換器 (Switch) 與雲端資料中心系統',
        stageDescription: '800G / 1.6T 網路交換機系統、大型資料中心骨幹網路整合',
        nodes: [
          {
            subCategory: '網路交換機與系統整合',
            companies: [
              {
                code: '2345',
                name: '智邦',
                role: '全球白牌資料中心交換器霸主，800G 交換機出貨龍頭',
                techAdvantage: '全球雲端資料中心交換機市占超過 50%，與 Broadcom 共同推動 CPO 交換機架構。',
                price: 546.0,
                change: 11.0,
                pctChange: 2.06,
                volume: 7200
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'WAFER_FOUNDRY',
    name: '晶圓製造與半導體先進製程產業鏈',
    subtitle: 'Semiconductor Wafer Foundry & Advanced Packaging',
    iconName: 'Cpu',
    tag: '台灣護國神山',
    themeColor: 'from-emerald-500 to-teal-600',
    description: '從矽晶圓、光阻、矽智財 (IP)，到 2nm/3nm 先進製程與 CoWoS 3D 封裝，構建全球頂尖半導體生態系。',
    news: [
      {
        title: '【先進封裝】台積電擴大 CoWoS 產能至每月 6.5 萬片，辛耘、弘塑訂單排至 2027',
        source: 'CMoney 股市爆料同學會',
        date: '2026-10-04',
        type: '擴產動態',
        highlight: '台積電嘉義與台南新廠如火如荼擴建，濕製程清洗設備廠直接受惠爆發。'
      }
    ],
    stages: [
      {
        stageName: '上游：矽晶圓、材料化學品與矽智財 (IP)',
        stageDescription: '矽晶圓切片、特殊化學氣體、光阻劑、矽智財設計架構',
        nodes: [
          {
            subCategory: '矽晶圓與化學耗材',
            companies: [
              {
                code: '6488',
                name: '環球晶',
                role: '全球第三大半導體矽晶圓製造商',
                techAdvantage: '具備 12 吋先進製程拋光與磊晶片完整產能，全球多國設廠分散風險。',
                price: 432.0,
                change: 6.0,
                pctChange: 1.41,
                volume: 3200
              },
              {
                code: '5434',
                name: '崇越',
                role: '半導體材料通路龍頭，日本信越化學光阻液代理',
                techAdvantage: '深耕台積電先進製程光阻液、石英爐管，並擴展綠能環保工程。',
                price: 278.5,
                change: 3.5,
                pctChange: 1.27,
                volume: 2900
              }
            ]
          },
          {
            subCategory: '矽智財 (IP) 與 ASIC 設計服務',
            companies: [
              {
                code: '3661',
                name: '世芯-KY',
                role: '全球客製化 AI ASIC 晶片設計服務龍頭',
                techAdvantage: '深度服務 AWS 與微軟超大算力晶片設計，具備 3nm/2nm 先進製程設計經驗。',
                price: 2480.0,
                change: 55.0,
                pctChange: 2.27,
                volume: 1650
              },
              {
                code: '3443',
                name: '創意',
                role: '台積電旗下 ASIC 設計服務旗艦，HBM 控制器 IP 領導者',
                techAdvantage: '台積電先進封裝 CoWoS 第一線合作夥伴，獲 CSP 大廠委託設計。',
                price: 1190.0,
                change: -15.0,
                pctChange: -1.24,
                volume: 2400
              }
            ]
          }
        ]
      },
      {
        stageName: '中游：晶圓代工製造 (Foundry)',
        stageDescription: '2nm / 3nm / 5nm 先進製程與成熟特殊製程晶圓製造',
        nodes: [
          {
            subCategory: '晶圓代工製造商',
            companies: [
              {
                code: '2330',
                name: '台積電',
                role: '全球晶圓代工絕對霸主，先進製程市占超過 90%',
                techAdvantage: '領先全球推出 N2 GAA、A16 製程與 CoWoS 先進封裝，掌握全球科技核心命脈。',
                price: 1045.0,
                change: 15.0,
                pctChange: 1.46,
                volume: 38450
              },
              {
                code: '2303',
                name: '聯電',
                role: '全球成熟製程晶圓代工大廠',
                techAdvantage: '深耕 28nm/22nm 高壓製程、車用與 OLED 驅動 IC 晶圓代工，殖利率穩健。',
                price: 52.8,
                change: 0.3,
                pctChange: 0.57,
                volume: 42100
              }
            ]
          }
        ]
      },
      {
        stageName: '下游：先進封測 (CoWoS) 與設備耗材',
        stageDescription: '2.5D/3D 異質整合封裝、封裝清洗設備、測試載板與測試廠',
        nodes: [
          {
            subCategory: 'CoWoS 封裝設備與封測廠',
            companies: [
              {
                code: '3711',
                name: '日月光投控',
                role: '全球第一大半導體封裝與測試龍頭 (OSAT)',
                techAdvantage: '推出 VIPack 先進封裝平台，與台積電合作擴充先進封測量能。',
                price: 158.5,
                change: 2.5,
                pctChange: 1.60,
                volume: 18400
              },
              {
                code: '3583',
                name: '辛耘',
                role: '台積電 CoWoS 濕製程單晶圓清洗設備主要供應商',
                techAdvantage: '自製濕製程設備在先進封裝產線占有率高達 50% 以上，並具備再生晶圓業務。',
                price: 412.0,
                change: 14.0,
                pctChange: 3.52,
                volume: 7200
              },
              {
                code: '3131',
                name: '弘塑',
                role: '半導體濕製程設備大廠，酸洗與去光阻設備主力',
                techAdvantage: '受惠台積電 CoWoS 擴產大浪潮，在手訂單能見度直達數季。',
                price: 1620.0,
                change: 45.0,
                pctChange: 2.86,
                volume: 1200
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'ROBOTICS_AUTOMATION',
    name: '機器人與智慧自動化產業鏈',
    subtitle: 'Humanoid Robotics & Smart Industrial Automation',
    iconName: 'Bot',
    tag: '具身智慧',
    themeColor: 'from-orange-500 to-amber-600',
    description: '涵蓋精密減速機、滾珠螺桿、視覺 AI 感測演算法、機器人關節與協作手臂整合，受惠人形機器人 (Tesla Optimus) 狂潮。',
    news: [
      {
        title: '【黃仁勳效應】所羅門、廣明受惠 NVIDIA Isaac 機器人平台認證，擴大歐美出貨',
        source: '鉅亨網 & 韭菜畢業班',
        date: '2026-10-04',
        type: '合作動態',
        highlight: '所羅門 3D 視覺 AI 方案全面支援機器人自主導航與精準抓取，營運添活水。'
      }
    ],
    stages: [
      {
        stageName: '上游：精密減速機、諧波傳動與滾珠螺桿',
        stageDescription: '機器人關節核心「機械骨骼與肌腱」，決定關節精密度與承載重量',
        nodes: [
          {
            subCategory: '傳動元件與減速機',
            companies: [
              {
                code: '2049',
                name: '上銀',
                role: '全球滾珠螺桿與線性滑軌大廠，機器人諧波減速機',
                techAdvantage: '自主研發機器人專用交叉滾子軸承與諧波減速機，具備整機關節自製實力。',
                price: 242.0,
                change: 5.5,
                pctChange: 2.33,
                volume: 5400
              },
              {
                code: '1597',
                name: '直得',
                role: '微型線性滑軌專家，專攻醫療與微型機器人',
                techAdvantage: '微型滑軌抗高溫高負載技術領先，切入高精度機器人關節傳動。',
                price: 94.2,
                change: 2.1,
                pctChange: 2.28,
                volume: 4800
              }
            ]
          }
        ]
      },
      {
        stageName: '中游：3D 視覺感測、驅動器與運動控制',
        stageDescription: '機器人之「眼睛」與「大腦神經」，負責環境辨識與運動姿態控制',
        nodes: [
          {
            subCategory: '機器人視覺 AI 與控制系統',
            companies: [
              {
                code: '2359',
                name: '所羅門',
                role: '3D 視覺 AI 感測領導者，輝達 Isaac 機器人平台夥伴',
                techAdvantage: 'AI 3D 視覺穿透與深度演算法，賦予機器人高階自主辨識與定位能力。',
                price: 158.0,
                change: 6.0,
                pctChange: 3.95,
                volume: 21500
              },
              {
                code: '6188',
                name: '廣明',
                role: '旗下達明機器人 (TM Robot) 為全球第二大協作型機器人大廠',
                techAdvantage: '獨家內建視覺系統的協作型機器手臂，獲 Continental 等國際車廠採用。',
                price: 108.5,
                change: 3.0,
                pctChange: 2.84,
                volume: 13200
              }
            ]
          }
        ]
      },
      {
        stageName: '下游：整機機器人與智慧製造整合',
        stageDescription: '人形機器人整機、自動化工廠物流 AMR 與智慧倉儲解決方案',
        nodes: [
          {
            subCategory: '整機系統與自動化解決方案',
            companies: [
              {
                code: '2308',
                name: '台達電',
                role: '工業自動化 (IA) 整合龍頭，提供機器人控制器與伺服馬達',
                techAdvantage: '打造智慧工廠整體數位雙生 (Digital Twin) 與自動化產線軟硬體。',
                price: 388.0,
                change: 4.5,
                pctChange: 1.17,
                volume: 14200
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'TRADITIONAL_SHIPPING',
    name: '傳統產業與貨櫃航運/重電',
    subtitle: 'Shipping Logistics & Heavy Electric Grid',
    iconName: 'Ship',
    tag: '基建與全球貿易',
    themeColor: 'from-sky-600 to-blue-700',
    description: '涵蓋全球航運物流樞紐（貨櫃三雄）、電網強韌計畫重電設備（變壓器外銷北美），彰顯傳產剛性需求與高殖利率實力。',
    news: [
      {
        title: '【重電出海】華城、士電北美電力變壓器訂單能見度長達 3 年，外銷毛利創歷史新高',
        source: 'MoneyDJ 理財網',
        date: '2026-10-04',
        type: '訂單利多',
        highlight: '北美老舊電網更新疊加 AI 資料中心電力需求爆發，超高壓變壓器供不應求。'
      },
      {
        title: '【海運運價】SCFI 運價指數震盪走揚，長榮、陽明高配息策略獲外資逢低加碼',
        source: '鉅亨網 & 股感 StockFeel',
        date: '2026-10-03',
        type: '營運觀察',
        highlight: '地緣政治繞行好望角常態化，長榮雙燃料新船隊具備極高燃油成本優勢。'
      }
    ],
    stages: [
      {
        stageName: '電網重電族群：變壓器、開關與重型電纜',
        stageDescription: '台電強韌電網計畫與北美變壓器大缺貨的核心受惠群',
        nodes: [
          {
            subCategory: '電力變壓器與配電盤',
            companies: [
              {
                code: '1519',
                name: '華城',
                role: '變壓器外銷霸主，美國電力公司超高壓變壓器首選夥伴',
                techAdvantage: '500kV 級超大型變壓器技術優良，美國在手訂單破百億元。',
                price: 645.0,
                change: 15.0,
                pctChange: 2.38,
                volume: 4800
              },
              {
                code: '1503',
                name: '士電',
                role: '重電設備大廠，配電盤與綠能升壓站統包商',
                techAdvantage: '新竹新豐廠大幅擴增大型變壓器產能，深耕外銷與台電標案。',
                price: 215.0,
                change: 3.5,
                pctChange: 1.65,
                volume: 5200
              },
              {
                code: '1609',
                name: '大亞',
                role: '超高壓特高壓電力電纜龍頭，太陽能儲能電廠投資',
                techAdvantage: '台電 345kV 特高壓電纜唯一通過驗證供應商之一，儲能挹注穩定現金流。',
                price: 49.8,
                change: 0.6,
                pctChange: 1.22,
                volume: 12400
              }
            ]
          }
        ]
      },
      {
        stageName: '航運物流族群：全球貨櫃海運與散裝航運',
        stageDescription: '全球跨國貿易命脈，高現金流與高股息代表',
        nodes: [
          {
            subCategory: '貨櫃航運三雄',
            companies: [
              {
                code: '2603',
                name: '長榮',
                role: '全球第七大貨櫃船隊，洋聯航線樞紐霸主',
                techAdvantage: '超大型新式雙燃料節能船隊比重最高，每箱航行成本遠低於同業，獲利能力稱霸全球。',
                price: 198.5,
                change: 3.0,
                pctChange: 1.53,
                volume: 18500
              },
              {
                code: '2609',
                name: '陽明',
                role: 'THE Alliance 核心聯盟成員，歐美遠洋貨櫃航運',
                techAdvantage: '歐洲線布局深厚，財務結構健全零負債，受惠紅海繞道運價支撐。',
                price: 66.8,
                change: 0.8,
                pctChange: 1.21,
                volume: 24000
              },
              {
                code: '2615',
                name: '萬海',
                role: '近洋線龍頭、深耕美西線與亞洲區域航網',
                techAdvantage: '亞洲區間高頻航線調度靈活，美西專用碼頭保障裝卸時效。',
                price: 84.5,
                change: 1.2,
                pctChange: 1.44,
                volume: 16200
              }
            ]
          }
        ]
      }
    ]
  }
];

/**
 * 輔助方法：依代碼或關鍵字查詢所屬產業鏈節點
 */
export function searchIndustryChains(query) {
  if (!query || !query.trim()) return INDUSTRY_CHAINS_DATA;
  const q = query.trim().toLowerCase();

  return INDUSTRY_CHAINS_DATA.map(chain => {
    // 檢查鏈條層級關鍵字
    const matchChainName = chain.name.toLowerCase().includes(q) || chain.subtitle.toLowerCase().includes(q);

    // 過濾階段與節點
    const filteredStages = chain.stages.map(st => {
      const filteredNodes = st.nodes.map(node => {
        const filteredCompanies = node.companies.filter(c => 
          c.name.toLowerCase().includes(q) ||
          c.code.includes(q) ||
          c.role.toLowerCase().includes(q) ||
          c.techAdvantage.toLowerCase().includes(q)
        );
        return {
          ...node,
          companies: filteredCompanies
        };
      }).filter(node => node.companies.length > 0 || node.subCategory.toLowerCase().includes(q));

      return {
        ...st,
        nodes: filteredNodes
      };
    }).filter(st => st.nodes.length > 0 || st.stageName.toLowerCase().includes(q));

    if (matchChainName || filteredStages.length > 0) {
      return {
        ...chain,
        stages: filteredStages.length > 0 ? filteredStages : chain.stages
      };
    }
    return null;
  }).filter(Boolean);
}
