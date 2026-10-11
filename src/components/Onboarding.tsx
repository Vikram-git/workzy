import { useState } from 'react';
import { ArrowLeft, ArrowRight, CalendarCheck, SearchCheck, UsersRound } from 'lucide-react';
import { Button, Brand } from './ui';
import { PhoneShareButton } from './PhoneShare';

const steps=[
  {icon:UsersRound,title:'Find local workers',body:'Browse service professionals in Chennai, with clear areas, experience, languages, and rates.'},
  {icon:SearchCheck,title:'Compare what matters',body:'Filter profiles by service, neighborhood, language, rate type, and actual customer ratings.'},
  {icon:CalendarCheck,title:'Request a booking',body:'Share the date and work details. Follow status updates without exposing personal phone numbers.'},
];

export function Onboarding({onFinish}:{onFinish:()=>void}){
 const[index,setIndex]=useState(0),step=steps[index],Icon=step.icon;
 return <main className="onboarding"><header><Brand/><div className="onboarding-header-actions"><PhoneShareButton compact/><button className="text-action" onClick={onFinish}>Skip</button></div></header><section className="onboarding-panel"><div className="onboarding-art"><Icon size={34}/></div><p className="eyebrow">WORKZY · {index+1} OF {steps.length}</p><h1>{step.title}</h1><p>{step.body}</p><div className="onboarding-dots">{steps.map((_,i)=><span key={i} className={index===i?'active':''}/>)}</div><div className="onboarding-actions">{index>0?<Button variant="secondary" onClick={()=>setIndex(index-1)}><ArrowLeft size={15}/>Back</Button>:<span/>}{index<steps.length-1?<Button onClick={()=>setIndex(index+1)}>Continue<ArrowRight size={15}/></Button>:<Button onClick={onFinish}>Get started<ArrowRight size={15}/></Button>}</div></section><footer>Chennai, Tamil Nadu · Booking requests first · Pay the worker directly</footer></main>;
}
