/** Fictional incidents at approximate area centres; never household addresses.
 * Add a licensed, consented image and caption only when genuine evidence is available.
 */
export interface ScenarioReport {
  id: string; name: string; address: string; coordinates: [number, number];
  time: string; incident: string; detail: string; status: 'review' | 'resolved';
  image?: {src: string; alt: string; caption: string};
}
export const scenarioReports: ScenarioReport[] = [
  {id:'CM-106',name:'Chang Phueak',address:'Chang Phueak area, Mueang Chiang Mai',coordinates:[18.812,98.978],time:'11:32 AM',incident:'Flooding reported',detail:'Example report of water collecting along a local access road. Extent still needs review.',status:'review'},
  {id:'CM-105',name:'Saraphi',address:'Saraphi district, Chiang Mai',coordinates:[18.715,99.035],time:'11:24 AM',incident:'Road impassable',detail:'Example report of a flooded road restricting local travel. No safe route has been verified.',status:'review'},
  {id:'CM-104',name:'Old Town',address:'Old Town area, Mueang Chiang Mai',coordinates:[18.788,98.985],time:'11:18 AM',incident:'Water supply disrupted',detail:'Example report of an interrupted water supply. Household needs await assessment.',status:'review'},
  {id:'CM-103',name:'Mae Rim',address:'Mae Rim district, Chiang Mai',coordinates:[18.916,98.943],time:'11:06 AM',incident:'Flooding reported',detail:'Example report of rising water near a community road. A reviewer would check the location and evidence.',status:'review'},
  {id:'CM-102',name:'Hang Dong',address:'Hang Dong district, Chiang Mai',coordinates:[18.688,98.919],time:'10:52 AM',incident:'Access restored',detail:'Example of a closed report after a human reviewer confirms that access has been restored.',status:'resolved'},
  {id:'CM-101',name:'San Sai',address:'San Sai district, Chiang Mai',coordinates:[18.851,99.045],time:'10:41 AM',incident:'Supplies requested',detail:'Example community request for drinking water. Need and delivery access are awaiting review.',status:'review'},
];
