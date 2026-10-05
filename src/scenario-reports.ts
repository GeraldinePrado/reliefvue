/** Fictional incidents at approximate area centres; never household addresses.
 * Add a licensed, consented image and caption only when genuine evidence is available.
 */
export interface ScenarioReport {
  province?: string; id: string; name: string; address: string; coordinates: [number, number];
  time: string; incident: string; detail: string; status: 'review' | 'resolved';
  source?: {url:string;label:string}; historicalStatus?: string;
  image?: {src: string; alt: string; caption: string};
}
const chiangMaiReports: ScenarioReport[] = [
  {id:'CM-106',name:'Chang Phueak',address:'Chang Phueak area, Mueang Chiang Mai',coordinates:[18.812,98.978],time:'11:32 AM',incident:'Flooding reported',detail:'Example report of water collecting along a local access road. Extent still needs review.',status:'review'},
  {id:'CM-105',name:'Saraphi',address:'Saraphi district, Chiang Mai',coordinates:[18.715,99.035],time:'11:24 AM',incident:'Road impassable',detail:'Example report of a flooded road restricting local travel. No safe route has been verified.',status:'review'},
  {id:'CM-104',name:'Old Town',address:'Old Town area, Mueang Chiang Mai',coordinates:[18.788,98.985],time:'11:18 AM',incident:'Water supply disrupted',detail:'Example report of an interrupted water supply. Household needs await assessment.',status:'review'},
  {id:'CM-103',name:'Mae Rim',address:'Mae Rim district, Chiang Mai',coordinates:[18.916,98.943],time:'11:06 AM',incident:'Flooding reported',detail:'Example report of rising water near a community road. A reviewer would check the location and evidence.',status:'review'},
  {id:'CM-102',name:'Hang Dong',address:'Hang Dong district, Chiang Mai',coordinates:[18.688,98.919],time:'10:52 AM',incident:'Access restored',detail:'Example of a closed report after a human reviewer confirms that access has been restored.',status:'resolved'},
  {id:'CM-101',name:'San Sai',address:'San Sai district, Chiang Mai',coordinates:[18.851,99.045],time:'10:41 AM',incident:'Household access disrupted',detail:'Example report of households unable to reach essential services. Disaster impact and eligibility need review; ReliefVue provides cash grants, not supply deliveries.',status:'review'},
];

// Selected dated reporting, not an exhaustive flood footprint or a live status feed.
export const historicalReports: ScenarioReport[] = [
 {id:'2024-01',name:'Mueang Chiang Mai',address:'Nawarat Bridge / Ping River area',coordinates:[18.787,99.005],time:'7 Oct 2024',incident:'River overflow and standing floodwater',detail:'The Royal Irrigation Office update describes falling river levels and floodwater remaining in Chiang Mai and Lamphun. This pin locates the reporting area, not the extent of inundation.',status:'review',historicalStatus:'Flood reported',source:{url:'https://www.prd.go.th/th/content/category/detail/id/37/iid/330050',label:'Thai PRD · Royal Irrigation Office'}},
 {id:'2024-02',name:'Mae Rim',address:'Mae Rim district, Chiang Mai',coordinates:[18.916,98.943],time:'3 Oct 2024',incident:'Flash flooding in river communities',detail:'The Nation reported flooding in communities along the Mae Sa and Mae Rim rivers after overnight rain.',status:'review',historicalStatus:'Flood reported',source:{url:'https://www.nationthailand.com/news/general/40042031',label:'The Nation · 3 October 2024'}},
 {id:'2024-03',name:'Saraphi',address:'Saraphi district, Chiang Mai',coordinates:[18.715,99.035],time:'7 Oct 2024',incident:'Flooded roads reported',detail:'The Nation reported a traffic-police warning about inundated roads in Saraphi, alongside a downstream evacuation appeal.',status:'review',historicalStatus:'Flood reported',source:{url:'https://www.nationthailand.com/news/general/40042131',label:'The Nation · 7 October 2024'}},
 {id:'2024-04',name:'Hang Dong',address:'Hang Dong district, Chiang Mai',coordinates:[18.688,98.919],time:'7 Oct 2024',incident:'Downstream evacuation warning',detail:'A reported governor’s appeal urged vulnerable residents to move to relief centres. This record documents a warning, not confirmation that the whole district flooded.',status:'review',historicalStatus:'Warning issued',source:{url:'https://www.nationthailand.com/news/general/40042131',label:'The Nation · 7 October 2024'}},
 {id:'2024-05',name:'San Pa Tong',address:'San Pa Tong district, Chiang Mai',coordinates:[18.628,98.895],time:'7 Oct 2024',incident:'Downstream evacuation warning',detail:'The same appeal included San Pa Tong. A warning is not a measured flood boundary or a confirmed impact at every location.',status:'review',historicalStatus:'Warning issued',source:{url:'https://www.nationthailand.com/news/general/40042131',label:'The Nation · 7 October 2024'}}
];

/** Authored simulation only. Coordinates are approximate public area centres. */
export const scenarioProvinces = ['Chiang Mai', 'Chiang Rai', 'Lamphun', 'Phra Nakhon Si Ayutthaya', 'Bangkok'] as const;
const provinceAreas: {province:string; prefix:string; places:[string,number,number][]}[] = [
 {province:'Chiang Rai',prefix:'CR',places:[['Mueang Chiang Rai',19.907,99.831],['Mae Sai',20.433,99.883],['Mae Chan',20.146,99.854],['Chiang Saen',20.274,100.083]]},
 {province:'Lamphun',prefix:'LP',places:[['Mueang Lamphun',18.574,99.008],['Pa Sang',18.526,98.939],['Ban Thi',18.651,99.116],['Ban Hong',18.315,98.817]]},
 {province:'Phra Nakhon Si Ayutthaya',prefix:'AY',places:[['Ayutthaya city area',14.353,100.568],['Bang Pa-in',14.228,100.577],['Sena',14.327,100.404],['Bang Sai',14.213,100.494]]},
 {province:'Bangkok',prefix:'BK',places:[['Bang Khen',13.874,100.597],['Don Mueang',13.914,100.590],['Lat Krabang',13.723,100.784],['Min Buri',13.813,100.729]]},
];
const examples = [
 {incident:'Flooding reported',detail:'Simulated resident report of floodwater near a public access road. Time, location and independent evidence need human review.',time:'11:38 AM',status:'review' as const},
 {incident:'Road access limited',detail:'Simulated local report of disrupted travel. This is not a route advisory or a confirmed emergency declaration.',time:'11:22 AM',status:'review' as const},
 {incident:'Households temporarily displaced',detail:'Simulated report of households moving to temporary accommodation. Review the disaster connection and usual residence before any grant decision.',time:'10:56 AM',status:'review' as const},
 {incident:'Access restored',detail:'Simulated report closed after a sample human review. Resolution does not indicate a household grant or transfer.',time:'10:34 AM',status:'resolved' as const},
];
export const scenarioReports: ScenarioReport[] = [
 ...chiangMaiReports.map(r=>({...r,province:'Chiang Mai'})),
 ...provinceAreas.flatMap(p=>p.places.map(([name,lat,lng],i)=>({id:`${p.prefix}-${101+i}`,province:p.province,name,address:`${name}, ${p.province}`,coordinates:[lat,lng] as [number,number],...examples[i]}))),
];
