import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { hashPassword, localSessionUserId, newId, readState, setLocalSessionUserId, updateState } from '../lib/localStore';
import type { Profile, Role } from '../types';

type LocalUser={id:string;email:string};
interface AuthState {
  session: { user: LocalUser } | null; user: LocalUser | null; profile: Profile | null; loading: boolean; error: string | null;
  signIn(email:string,password:string):Promise<void>;
  signUp(input:{email:string;password:string;fullName:string;phone:string;role:Role}):Promise<boolean>;
  resetPassword(email:string,phone:string,password:string):Promise<void>;
  signOut():Promise<void>; refreshProfile():Promise<void>; clearError():void;
}
const Context=createContext<AuthState|null>(null);
export function AuthProvider({children}:{children:ReactNode}){
 const[profile,setProfile]=useState<Profile|null>(null),[loading,setLoading]=useState(true),[error,setError]=useState<string|null>(null);
 const load=useCallback(async()=>{const id=localSessionUserId();if(!id){setProfile(null);return}const state=await readState(),next=state.profiles.find(p=>p.auth_user_id===id)||null;if(next?.account_status==='suspended'){setLocalSessionUserId(null);setProfile(null);throw new Error('This account is suspended. Contact the local administrator.')}setProfile(next)},[]);
 useEffect(()=>{let active=true;void load().catch(e=>active&&setError(e instanceof Error?e.message:'Unable to load local account.')).finally(()=>active&&setLoading(false));return()=>{active=false}},[load]);
 const value=useMemo<AuthState>(()=>{
  const user=profile?{id:profile.auth_user_id,email:profile.email}:null;
  return {session:user?{user}:null,user,profile,loading,error,
   async signIn(email,password){setError(null);const normalized=email.trim().toLowerCase(),state=await readState(),account=state.profiles.find(p=>p.email.toLowerCase()===normalized);if(!account)throw new Error('Email or password is incorrect.');if(account.account_status!=='active')throw new Error('This account is suspended. Contact the local administrator.');const candidate=await hashPassword(password,account.password_salt);if(candidate.hash!==account.password_hash)throw new Error('Email or password is incorrect.');setLocalSessionUserId(account.auth_user_id);setProfile(account)},
   async signUp(input){setError(null);const email=input.email.trim().toLowerCase();if(!/^\S+@\S+\.\S+$/.test(email))throw new Error('Enter a valid email address.');if(input.password.length<8)throw new Error('Use a password with at least 8 characters.');if(input.fullName.trim().length<2)throw new Error('Enter your full name.');if(!/^\+?[0-9 ()-]{7,20}$/.test(input.phone.trim()))throw new Error('Enter a valid phone number.');const credentials=await hashPassword(input.password),id=newId();const created=await updateState<Profile>(state=>{if(state.profiles.some(p=>p.email.toLowerCase()===email))throw new Error('An account with this email already exists.');const row:Profile&{password_salt:string;password_hash:string}={id:newId(),auth_user_id:id,role:input.role,full_name:input.fullName.trim(),phone:input.phone.trim(),email,profile_image:null,account_status:'active',created_at:new Date().toISOString(),password_salt:credentials.salt,password_hash:credentials.hash};state.profiles.push(row);return row});setLocalSessionUserId(id);setProfile(created);return true},
   async resetPassword(email,phone,password){if(password.length<8)throw new Error('Use a password with at least 8 characters.');const normalized=email.trim().toLowerCase(),credentials=await hashPassword(password);await updateState(state=>{const account=state.profiles.find(p=>p.email.toLowerCase()===normalized&&p.phone===phone.trim());if(!account)throw new Error('Email and phone number do not match a local account.');account.password_salt=credentials.salt;account.password_hash=credentials.hash})},
   async signOut(){setLocalSessionUserId(null);setProfile(null);setError(null)},
   async refreshProfile(){await load()},clearError(){setError(null)}};
 },[profile,loading,error,load]);
 return <Context.Provider value={value}>{children}</Context.Provider>
}
export function useAuth(){const value=useContext(Context);if(!value)throw new Error('useAuth must be used inside AuthProvider');return value}
