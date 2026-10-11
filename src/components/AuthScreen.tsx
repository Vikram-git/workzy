import { useState, type FormEvent } from 'react';
import { ArrowLeft, ArrowRight, Eye, EyeOff, ShieldCheck, UserRound, Wrench } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Brand, Button, ErrorMessage, Input } from './ui';
import { PhoneShareButton } from './PhoneShare';
import type { Role } from '../types';

type Mode = 'login'|'register'|'forgot'|'reset';

export function AuthScreen({ initialMode = 'login', onNotice }: { initialMode?: Mode; onNotice: (message: string) => void }) {
  const auth = useAuth();
  const [mode, setMode] = useState<Mode>(initialMode);
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState('');
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ email: '', password: '', confirm: '', fullName: '', phone: '', role: 'customer' as Role });
  const change = (event: React.ChangeEvent<HTMLInputElement|HTMLSelectElement>) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  async function submit(event: FormEvent) {
    event.preventDefault(); setBusy(true); setLocalError(''); auth.clearError();
    try {
      if (mode === 'register') {
        if (form.password.length < 8) throw new Error('Use a password with at least 8 characters.');
        if (form.password !== form.confirm) throw new Error('The passwords do not match.');
        if (!/^\+?[0-9 ()-]{7,20}$/.test(form.phone.trim())) throw new Error('Enter a valid phone number.');
        const hasSession = await auth.signUp({ email: form.email, password: form.password, fullName: form.fullName, phone: form.phone, role: form.role });
        if (hasSession) onNotice('Account created. Complete your profile to get started.');
      } else if (mode === 'login') {
        await auth.signIn(form.email, form.password);
      } else if (mode === 'forgot') {
        if (form.password.length < 8) throw new Error('Use a password with at least 8 characters.');
        if (form.password !== form.confirm) throw new Error('The passwords do not match.');
        await auth.resetPassword(form.email, form.phone, form.password); setSent(true);
      } else {
        if (form.password.length < 8) throw new Error('Use a password with at least 8 characters.');
        if (form.password !== form.confirm) throw new Error('The passwords do not match.');
        throw new Error('Password reset is available from the sign-in screen.');
      }
    } catch (error) { setLocalError(error instanceof Error ? error.message : 'Unable to complete this request.'); }
    finally { setBusy(false); }
  }

  const title = mode === 'register' ? 'Create your account' : mode === 'forgot' ? 'Reset your password' : mode === 'reset' ? 'Choose a new password' : 'Welcome back';
  return <main className="auth-shell"><div className="auth-top"><Brand/><div className="auth-top-actions"><PhoneShareButton compact/><span className="local-mode-pill">LOCAL DEVICE MODE · data stays in this browser</span></div></div><section className="auth-layout"><div className="auth-story"><p className="eyebrow">CHENNAI · LOCAL SERVICES</p><h1>Find the right local worker.<br/><span>Book with confidence.</span></h1><p className="auth-story__body">A clear way to compare local professionals, understand their rates, and request the help you need.</p><ul className="auth-proof"><li><span><ShieldCheck size={18}/></span>Worker approval is managed in this device</li><li><span><UserRound size={18}/></span>Your contact details stay private in listings</li><li><span><Wrench size={18}/></span>Booking requests with clear status updates</li></ul><p className="local-mode-disclaimer">Local mode is for one device. It does not provide secure multi-user authentication or sync.</p></div>
    <section className="auth-card"><div className="auth-card__heading"><h2>{sent ? 'Password updated' : title}</h2><p>{sent ? 'Your local password has been changed.' : mode === 'register' ? 'Choose an account type to get started.' : mode === 'login' ? 'Sign in to continue to your account.' : mode === 'forgot' ? 'Enter your account email and phone, then choose a new password. No email is sent in local mode.' : 'Use at least eight characters for your new password.'}</p></div>
      {sent ? <div className="sent-state"><div className="sent-state__icon"><ShieldCheck size={23}/></div><p>Password updated for this browser. Email and phone are not verified by an external service.</p><Button variant="secondary" onClick={() => {setSent(false);setMode('login')}}>Back to sign in</Button></div> : <form className="auth-form" onSubmit={submit}>
        {mode === 'register' ? <><div className="account-choice" role="group" aria-label="Account type"><button type="button" className={form.role==='customer'?'selected':''} onClick={()=>setForm({...form,role:'customer'})}><UserRound size={16}/>Customer</button><button type="button" className={form.role==='worker'?'selected':''} onClick={()=>setForm({...form,role:'worker'})}><Wrench size={16}/>Worker</button><button type="button" className={form.role==='admin'?'selected':''} onClick={()=>setForm({...form,role:'admin'})}><ShieldCheck size={16}/>Local admin</button></div><p className="local-mode-disclaimer">Local admin access is not protected and should only be used for testing on this device.</p><Input label="Full name" name="fullName" autoComplete="name" value={form.fullName} onChange={change} required minLength={2} maxLength={100}/><Input label="Phone number" name="phone" type="tel" autoComplete="tel" value={form.phone} onChange={change} required placeholder="+91 98765 43210"/><Input label="Email address" name="email" type="email" autoComplete="email" value={form.email} onChange={change} required/></> : null}
        {mode === 'login' || mode === 'forgot' ? <><Input label="Email address" name="email" type="email" autoComplete="email" value={form.email} onChange={change} required/>{mode==='forgot'?<Input label="Phone number on account" name="phone" type="tel" value={form.phone} onChange={change} required/>:null}</> : null}
        {mode === 'login' || mode === 'register' || mode === 'forgot' ? <div className="password-wrap"><Input label={mode === 'forgot' ? 'New password' : 'Password'} name="password" type={showPassword?'text':'password'} autoComplete={mode === 'login'?'current-password':'new-password'} value={form.password} onChange={change} required minLength={8} hint={mode !== 'login' ? 'At least 8 characters' : undefined}/><button type="button" className="password-toggle" onClick={()=>setShowPassword(!showPassword)} aria-label={showPassword?'Hide password':'Show password'}>{showPassword?<EyeOff size={16}/>:<Eye size={16}/>}</button></div> : null}
        {mode === 'register' || mode === 'reset' || mode === 'forgot' ? <Input label="Confirm password" name="confirm" type="password" autoComplete="new-password" value={form.confirm} onChange={change} required minLength={8}/> : null}
        {mode === 'login' ? <button className="text-action auth-forgot" type="button" onClick={()=>{setMode('forgot');setLocalError('')}}>Forgot password?</button> : null}
        {mode === 'login' ? <div className="demo-login"><div><strong>Try a demo worker account</strong><span>Local sample account · password workzy-demo</span></div><button type="button" onClick={()=>setForm(current=>({...current,email:'demo.meena@workzy.local',password:'workzy-demo'}))}>Use demo login</button></div> : null}
        {localError || auth.error ? <ErrorMessage onDismiss={()=>{setLocalError('');auth.clearError()}}>{localError || auth.error}</ErrorMessage> : null}
        <Button type="submit" className="auth-submit" loading={busy}>{mode === 'register' ? 'Create account' : mode === 'forgot' ? 'Update local password' : mode === 'reset' ? 'Update password' : 'Sign in'}<ArrowRight size={16}/></Button>
        {mode !== 'login' ? <button type="button" className="text-action auth-back" onClick={()=>{setMode('login');setLocalError('')}}><ArrowLeft size={14}/>{mode === 'register' ? 'Already have an account? Sign in' : 'Back to sign in'}</button> : <p className="auth-switch">New to WORKZY? <button type="button" className="text-action" onClick={()=>setMode('register')}>Create an account</button></p>}
      </form>}</section></section><footer className="auth-footer">WORKZY <span>·</span> Chennai, Tamil Nadu</footer></main>;
}
