import { Component, useEffect, useState, type ErrorInfo, type ReactNode } from 'react';
import { Bell, CalendarDays, Home, LogOut, Menu, Search, ShieldCheck, UserRound, Wrench, X } from 'lucide-react';
import { useAuth } from './context/AuthContext';
import { explainError } from './lib/errors';
import { listNotifications, markAllNotificationsRead, markNotificationRead } from './services/marketplace';
import type { AppNotification, WorkerDirectoryEntry } from './types';
import { AdminScreen } from './components/AdminScreens';
import { AuthScreen } from './components/AuthScreen';
import { BookingListScreen, CustomerHome, ProfileScreen, WorkerProfileDialog, WorkerSearchScreen } from './components/CustomerScreens';
import { WorkerHistory, WorkerHome, WorkerProfileEditor } from './components/WorkerScreens';
import { Onboarding } from './components/Onboarding';
import { PhoneShareButton } from './components/PhoneShare';
import { Avatar, Button, Brand, EmptyState, ErrorMessage, LoadingState } from './components/ui';

type Page='home'|'search'|'requests'|'bookings'|'profile'|'profile-edit'|'admin';
type NavItem={page:Page;label:string;icon:typeof Home};

export function App(){
 const auth=useAuth();
 const [page,setPage]=useState<Page>('home'),[categoryId,setCategoryId]=useState(''),[savedSearch,setSavedSearch]=useState(false),[selectedWorker,setSelectedWorker]=useState<WorkerDirectoryEntry|null>(null),[notice,setNotice]=useState(''),[mobileNav,setMobileNav]=useState(false);
 const [onboardingDone,setOnboardingDone]=useState(()=>window.localStorage.getItem('workzy-onboarding-done')==='true');
 useEffect(()=>{if(auth.profile?.role==='admin')setPage('admin');else if(auth.profile?.role==='worker'&&page==='home')setPage('home');else if(!auth.profile)setPage('home')},[auth.profile?.role]);
 useEffect(()=>{if(!notice)return;const timer=window.setTimeout(()=>setNotice(''),3500);return()=>window.clearTimeout(timer)},[notice]);

 if(auth.loading)return <div className="boot-screen"><Brand/><LoadingState label="Checking your session"/></div>;
 if(!auth.user&&!onboardingDone)return <Onboarding onFinish={()=>{window.localStorage.setItem('workzy-onboarding-done','true');setOnboardingDone(true)}}/>;
 if(!auth.user){return <><AuthScreen initialMode="login" onNotice={setNotice}/><Toast message={notice}/></>}
 if(!auth.profile)return <div className="boot-screen"><Brand/>{auth.error?<><ErrorMessage>{auth.error}</ErrorMessage><Button variant="secondary" onClick={()=>void auth.signOut()}>Sign out</Button></>:<LoadingState label="Loading your account"/>}</div>;

 const role=auth.profile.role;
 const items:NavItem[]=role==='customer'?[{page:'home',label:'Home',icon:Home},{page:'search',label:'Search',icon:Search},{page:'bookings',label:'Bookings',icon:CalendarDays},{page:'profile',label:'Profile',icon:UserRound}]:role==='worker'?[{page:'home',label:'Home',icon:Home},{page:'requests',label:'Requests',icon:Wrench},{page:'bookings',label:'Bookings',icon:CalendarDays},{page:'profile-edit',label:'Profile',icon:UserRound}]:[{page:'admin',label:'Admin',icon:ShieldCheck}];
 const goto=(target:string)=>{if(target==='search:saved'){setCategoryId('');setSavedSearch(true);setPage('search')}else if(target.startsWith('search:')){setCategoryId(target.slice(7));setSavedSearch(false);setPage('search')}else{setCategoryId('');setSavedSearch(false);setPage(target as Page)}setMobileNav(false)};
 return <div className={`app-shell app-shell--${role}`}>
   <aside className={`app-sidebar ${mobileNav?'app-sidebar--open':''}`}><Brand/><div className="sidebar-caption">{role==='admin'?'ADMINISTRATION':role==='worker'?'WORKER WORKSPACE':'YOUR WORKSPACE'}</div><nav className="side-navigation">{items.map(({page:p,label,icon:Icon})=><button key={p} className={page===p?'active':''} onClick={()=>goto(p)}><Icon size={18}/>{label}</button>)}</nav>{role==='worker'?<div className="side-notice"><ShieldCheck size={17}/><span>Verification must be approved before your profile is listed.</span></div>:role==='customer'?<div className="side-notice"><ShieldCheck size={17}/><span>Payment is arranged directly with the worker.</span></div>:null}<div className="sidebar-account"><Avatar name={auth.profile.full_name} image={auth.profile.profile_image}/><span><strong>{auth.profile.full_name}</strong><small>{role}</small></span><button aria-label="Sign out" onClick={()=>void auth.signOut()}><LogOut size={16}/></button></div></aside>
   {mobileNav?<button className="mobile-nav-scrim" onClick={()=>setMobileNav(false)} aria-label="Close navigation"/>:null}
   <div className="app-main"><div className="local-mode-banner"><strong>Local device mode</strong><span>Data stays in this browser and is not protected for multi-user use.</span></div><header className="app-header"><button className="mobile-menu" onClick={()=>setMobileNav(!mobileNav)} aria-label="Toggle navigation">{mobileNav?<X size={20}/>:<Menu size={20}/>}</button><span className="header-location"><span className="location-pip"/>Chennai, Tamil Nadu</span><div className="header-actions"><PhoneShareButton/><Notifications/><div className="header-profile"><Avatar name={auth.profile.full_name} image={auth.profile.profile_image}/><span><strong>{auth.profile.full_name}</strong><small>{role}</small></span></div></div></header>
    <main className={`app-content ${role==='admin'?'app-content--admin':''}`}>
      {role==='customer'&&page==='home'?<CustomerHome onNavigate={goto} onOpenWorker={setSelectedWorker}/>:null}
      {role==='customer'&&page==='search'?<WorkerSearchScreen key={`${savedSearch?'saved':'explore'}-${categoryId||'all'}`} initialCategory={categoryId} initialSaved={savedSearch} onOpenWorker={setSelectedWorker}/>:null}
      {role==='customer'&&page==='bookings'?<BookingListScreen role="customer" onNotice={setNotice}/>:null}
      {role==='customer'&&page==='profile'?<ProfileScreen onChanged={auth.refreshProfile} onNotice={setNotice}/>:null}
      {role==='worker'&&page==='home'?<WorkerHome onNavigate={goto} onNotice={setNotice}/>:null}
      {role==='worker'&&page==='requests'?<BookingListScreen key="requests" role="worker" initialStatus="pending" onNotice={setNotice}/>:null}
      {role==='worker'&&page==='bookings'?<WorkerHistory/>:null}
      {role==='worker'&&page==='profile-edit'?<WorkerProfileEditor onNotice={setNotice}/>:null}
      {role==='admin'&&page==='admin'?<AdminScreen onNotice={setNotice}/>:null}
    </main>
   </div>
   {selectedWorker&&role==='customer'?<WorkerProfileDialog worker={selectedWorker} onClose={()=>setSelectedWorker(null)} onNotice={setNotice}/>:null}
   {role!=='admin'?<nav className="bottom-navigation" aria-label="Primary navigation">{items.map(({page:p,label,icon:Icon})=><button key={p} className={page===p?'active':''} onClick={()=>goto(p)}><Icon size={19}/><span>{label}</span></button>)}</nav>:null}
   <Toast message={notice}/>
 </div>;
}

function Notifications(){
 const [open,setOpen]=useState(false),[rows,setRows]=useState<AppNotification[]>([]),[error,setError]=useState(''),[loading,setLoading]=useState(false);
 async function toggle(){if(open){setOpen(false);return}setOpen(true);setLoading(true);setError('');try{setRows(await listNotifications())}catch(e){setError(explainError(e))}finally{setLoading(false)}}
 async function read(id:string){try{await markNotificationRead(id);setRows(old=>old.map(n=>n.id===id?{...n,read:true}:n))}catch(e){setError(explainError(e))}}
 async function readAll(){try{await markAllNotificationsRead();setRows(old=>old.map(n=>({...n,read:true})))}catch(e){setError(explainError(e))}}
 const unread=rows.filter(n=>!n.read).length;
 return <div className="notification-anchor"><button className="icon-button notification-trigger" aria-label="Notifications" aria-expanded={open} onClick={()=>void toggle()}><Bell size={18}/>{unread>0?<span className="notification-dot"/>:null}</button>{open?<section className="notification-popover"><div className="popover-head"><strong>Notifications</strong>{unread?<button className="text-action" onClick={()=>void readAll()}>Mark all read</button>:null}</div>{error?<ErrorMessage>{error}</ErrorMessage>:null}{loading?<LoadingState label="Loading notifications"/>:rows.length?rows.map(n=><button className={`notification-row ${n.read?'':'unread'}`} key={n.id} onClick={()=>void read(n.id)}><strong>{n.title}</strong><span>{n.message}</span><small>{new Date(n.created_at).toLocaleString('en-IN')}</small></button>):<EmptyState title="You’re all caught up" description="Booking and profile updates will appear here."/>}</section>:null}</div>;
}

function Toast({message}:{message:string}){return <div className={`toast ${message?'visible':''}`} role="status">{message}</div>}

export class ApplicationErrorBoundary extends Component<{children:ReactNode},{failed:boolean}> {
  state={failed:false};
  static getDerivedStateFromError(){return{failed:true}}
  componentDidCatch(error:Error,info:ErrorInfo){console.error('Application render error',error,info.componentStack)}
  render(){return this.state.failed?<main className="boot-screen"><Brand/><EmptyState title="This screen could not be opened" description="Refresh the page. If the problem continues, contact WORKZY support." action={<Button variant="secondary" onClick={()=>window.location.reload()}>Refresh application</Button>}/></main>:this.props.children}
}
