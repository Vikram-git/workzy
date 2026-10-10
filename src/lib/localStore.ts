const DB_NAME = 'workzy-local';
const STORE_NAME = 'app';
const STATE_KEY = 'state';

export interface LocalState {
  profiles: any[];
  workers: any[];
  bookings: any[];
  reviews: any[];
  reports: any[];
  blocks: { user_id: string; blocked_user_id: string }[];
  notifications: any[];
  categories: any[];
  languages: any[];
  areas: any[];
  demoDataVersion?: number;
}

const seed: LocalState = {
  profiles: [], workers: [], bookings: [], reviews: [], reports: [], blocks: [], notifications: [],
  categories: [
    ['cleaning','Cleaning','Home and office cleaning','sparkles'],['gardening','Gardening','Garden care and maintenance','sprout'],
    ['catering','Catering','Food preparation and events','utensils'],['electrician','Electrician','Electrical repairs and installation','zap'],
    ['plumbing','Plumbing','Plumbing repairs and installation','wrench'],['painting','Painting','Interior and exterior painting','paintbrush'],
    ['carpentry','Carpentry','Furniture and woodwork','hammer'],['moving','Loading & Shifting','Moving and loading help','boxes'],
  ].map(([id,name,description,icon])=>({id,name,description,icon,active:true})),
  languages: ['Tamil','Telugu','Malayalam','Hindi'].map(name=>({id:name.toLowerCase(),name,active:true})),
  areas: ['Adyar','Anna Nagar','Chromepet','Guindy','Mylapore','Tambaram','T. Nagar','Velachery'].map(name=>({id:name.toLowerCase().replaceAll(' ','-'),name,city:'Chennai',active:true})),
};

let database: Promise<IDBDatabase> | null = null;
function openDatabase() {
  if (!('indexedDB' in window)) return Promise.reject(new Error('This browser does not support local app storage.'));
  if (!database) database = new Promise((resolve,reject)=>{
    const request=indexedDB.open(DB_NAME,1);
    request.onupgradeneeded=()=>{if(!request.result.objectStoreNames.contains(STORE_NAME))request.result.createObjectStore(STORE_NAME)};
    request.onsuccess=()=>resolve(request.result);
    request.onerror=()=>reject(request.error||new Error('Unable to open local app storage.'));
  });
  return database;
}

export async function readState(): Promise<LocalState> {
  const db=await openDatabase();
  return new Promise<LocalState>((resolve,reject)=>{
    const tx=db.transaction(STORE_NAME,'readonly');
    const request=tx.objectStore(STORE_NAME).get(STATE_KEY);
    request.onsuccess=()=>resolve(request.result||structuredClone(seed));
    request.onerror=()=>reject(request.error||new Error('Unable to read local app data.'));
  }).then(async state=>{
    if(state.demoDataVersion===2)return state;
    const demoWorkers=[
      {slug:'meena',name:'Meena S.',email:'demo.meena@workzy.local',phone:'+91 90000 00101',category:'cleaning',areas:['adyar','mylapore'],languages:['tamil'],experience:5,hourly:400,daily:2600,bio:'Home cleaning and routine upkeep. Demo profile for exploring WORKZY.'},
      {slug:'karthik',name:'Karthik R.',email:'demo.karthik@workzy.local',phone:'+91 90000 00102',category:'plumbing',areas:['velachery','guindy'],languages:['tamil','telugu'],experience:7,hourly:550,daily:3500,bio:'Plumbing repairs and fixture installation. Demo profile for exploring WORKZY.'},
      {slug:'farah',name:'Farah K.',email:'demo.farah@workzy.local',phone:'+91 90000 00103',category:'electrician',areas:['anna-nagar','t-nagar'],languages:['tamil','hindi'],experience:6,hourly:600,daily:3900,bio:'Electrical repair and installation work. Demo profile for exploring WORKZY.'},
      {slug:'arun',name:'Arun P.',email:'demo.arun@workzy.local',phone:'+91 90000 00104',category:'painting',areas:['tambaram','chromepet'],languages:['tamil'],experience:8,hourly:500,daily:3200,bio:'Interior painting and surface preparation. Demo profile for exploring WORKZY.'},
      {slug:'revathi',name:'Revathi M.',email:'demo.revathi@workzy.local',phone:'+91 90000 00105',category:'gardening',areas:['mylapore','adyar'],languages:['tamil','malayalam'],experience:4,hourly:350,daily:2200,bio:'Garden care, pruning, and planting. Demo profile for exploring WORKZY.'},
      {slug:'suresh',name:'Suresh V.',email:'demo.suresh@workzy.local',phone:'+91 90000 00106',category:'carpentry',areas:['guindy','velachery'],languages:['tamil','telugu'],experience:9,hourly:650,daily:4200,bio:'Furniture repair and custom carpentry. Demo profile for exploring WORKZY.'},
      {slug:'nisha',name:'Nisha A.',email:'demo.nisha@workzy.local',phone:'+91 90000 00107',category:'catering',areas:['t-nagar','anna-nagar'],languages:['tamil','hindi'],experience:6,hourly:700,daily:4800,bio:'Small event catering and meal preparation. Demo profile for exploring WORKZY.'},
      {slug:'vijay',name:'Vijay K.',email:'demo.vijay@workzy.local',phone:'+91 90000 00108',category:'moving',areas:['chromepet','tambaram'],languages:['tamil'],experience:5,hourly:450,daily:2800,bio:'Careful loading and household shifting assistance. Demo profile for exploring WORKZY.'},
    ];
    const credentials=await hashPassword('workzy-demo');
    const accounts=demoWorkers.map(worker=>({worker,credentials}));
    await updateState(current=>{
      if(current.demoDataVersion===2)return;
      for(const {worker,credentials} of accounts){
        const areaIds=worker.areas.map(slug=>current.areas.find(area=>area.name.toLowerCase().replace(/[^a-z0-9]+/g,'-')===slug)?.id).filter(Boolean);
        const profileId=`demo-profile-${worker.slug}`,authId=`demo-auth-${worker.slug}`,workerId=`demo-worker-${worker.slug}`;
        const profile=current.profiles.find(value=>value.email===worker.email);
        if(!profile)current.profiles.push({id:profileId,auth_user_id:authId,role:'worker',full_name:worker.name,phone:worker.phone,email:worker.email,profile_image:null,account_status:'active',created_at:new Date().toISOString(),password_salt:credentials.salt,password_hash:credentials.hash,is_demo:true});
        const existing=current.workers.find(value=>value.id===workerId);
        if(existing){existing.area_ids=areaIds;existing.is_demo=true;continue}
        current.workers.push({id:workerId,profile_id:profileId,primary_category_id:worker.category,category_ids:[worker.category],language_ids:worker.languages,area_ids:areaIds,bio:worker.bio,experience_years:worker.experience,hourly_rate:worker.hourly,daily_rate:worker.daily,availability:[{weekday:1,start_time:'09:00',end_time:'17:00',active:true},{weekday:2,start_time:'09:00',end_time:'17:00',active:true},{weekday:3,start_time:'09:00',end_time:'17:00',active:true},{weekday:4,start_time:'09:00',end_time:'17:00',active:true},{weekday:5,start_time:'09:00',end_time:'17:00',active:true}],availability_status:'available',accepting_bookings:true,verification_status:'pending',created_at:new Date().toISOString(),updated_at:new Date().toISOString(),is_demo:true});
      }
      current.demoDataVersion=2;
    });
    return new Promise<LocalState>((resolve,reject)=>{const tx=db.transaction(STORE_NAME,'readonly'),get=tx.objectStore(STORE_NAME).get(STATE_KEY);get.onsuccess=()=>resolve(get.result as LocalState);get.onerror=()=>reject(get.error)});
  });
}

export async function updateState<T>(change:(state:LocalState)=>T):Promise<T>{
  const db=await openDatabase();
  return new Promise((resolve,reject)=>{
    const tx=db.transaction(STORE_NAME,'readwrite');
    const store=tx.objectStore(STORE_NAME); let result:T;
    const request=store.get(STATE_KEY);
    request.onsuccess=()=>{
      const state=(request.result||structuredClone(seed)) as LocalState;
      try { result=change(state); store.put(state,STATE_KEY); } catch(error) { tx.abort(); reject(error); }
    };
    request.onerror=()=>{tx.abort();reject(request.error||new Error('Unable to update local app data.'))};
    tx.oncomplete=()=>resolve(result!);
    tx.onerror=()=>reject(tx.error||new Error('Unable to update local app data.'));
    tx.onabort=()=>reject(tx.error||new Error('Local app data update was cancelled.'));
  });
}

export function localSessionUserId(){return window.localStorage.getItem('workzy-local-user')}
export function setLocalSessionUserId(id:string|null){if(id)window.localStorage.setItem('workzy-local-user',id);else window.localStorage.removeItem('workzy-local-user')}
export function newId(){return crypto.randomUUID()}
export function currentProfile(state:LocalState){const id=localSessionUserId();return state.profiles.find(p=>p.auth_user_id===id)||null}

const encoder=new TextEncoder();
function toHex(bytes:Uint8Array){return [...bytes].map(x=>x.toString(16).padStart(2,'0')).join('')}
export async function hashPassword(password:string,salt?:string){
  const saltBytes=salt?new Uint8Array(salt.match(/.{2}/g)!.map(v=>parseInt(v,16))):crypto.getRandomValues(new Uint8Array(16));
  const key=await crypto.subtle.importKey('raw',encoder.encode(password),'PBKDF2',false,['deriveBits']);
  const bits=await crypto.subtle.deriveBits({name:'PBKDF2',salt:saltBytes,iterations:120000,hash:'SHA-256'},key,256);
  return {salt:toHex(saltBytes),hash:toHex(new Uint8Array(bits))};
}
