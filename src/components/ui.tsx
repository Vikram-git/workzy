import { AlertCircle, BadgeCheck, BriefcaseBusiness, Check, ChevronRight, CircleHelp, LoaderCircle, MapPin, ShieldAlert, Star, UserRound } from 'lucide-react';
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from 'react';
import type { BookingStatus, WorkerDirectoryEntry } from '../types';
import { canTransitionBooking } from '../lib/bookingRules';

export function Brand({ compact = false }: { compact?: boolean }) {
  return <div className={`brand${compact ? ' brand--compact' : ''}`} aria-label="WORKZY">
    <span className="brand-mark" aria-hidden="true"><svg viewBox="0 0 40 48"><path d="M20 2.5C10.3 2.5 2.5 10.3 2.5 20c0 12.5 17.5 25 17.5 25S37.5 32.5 37.5 20C37.5 10.3 29.7 2.5 20 2.5Z" fill="currentColor"/><circle cx="20" cy="19" r="10.8" fill="white"/><path d="m12.7 19.5 3.2-3.3a3.7 3.7 0 0 1 5.1-.3l1.2 1 1.8-1.2a3.7 3.7 0 0 1 5 .6l.8.8-7.1 7.3a2.7 2.7 0 0 1-3.7 0l-6.3-4.9Z" fill="#193646"/><path d="m14.4 22.4 2.9-2.8m1.8 4.3 2.6-2.5m1.7 4 2.4-2.3" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg></span>
    <span className="brand-text">WORKZY <small>LOCAL SERVICES</small></span>
  </div>;
}

export function Button({ variant = 'primary', size = 'md', loading = false, children, disabled, className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary'|'secondary'|'ghost'|'danger'; size?: 'sm'|'md'; loading?: boolean }) {
  return <button className={`button button--${variant} button--${size} ${className}`} disabled={disabled || loading} {...props}>
    {loading ? <LoaderCircle className="spin" size={16} aria-hidden="true"/> : null}{children}
  </button>;
}

export function Input({ label, error, hint, ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string; hint?: string }) {
  const id = props.id ?? props.name;
  return <div className="field-wrap"><label className="field-label" htmlFor={id}>{label}</label><input className={`field${error ? ' field--error' : ''}`} id={id} {...props}/>{error ? <span className="field-error"><AlertCircle size={13}/>{error}</span> : hint ? <span className="field-hint">{hint}</span> : null}</div>;
}

export function Select({ label, children, error, ...props }: SelectHTMLAttributes<HTMLSelectElement> & { label: string; error?: string }) {
  const id = props.id ?? props.name;
  return <div className="field-wrap"><label className="field-label" htmlFor={id}>{label}</label><select id={id} className={`field${error ? ' field--error' : ''}`} {...props}>{children}</select>{error ? <span className="field-error"><AlertCircle size={13}/>{error}</span> : null}</div>;
}

export function Textarea({ label, error, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; error?: string }) {
  const id = props.id ?? props.name;
  return <div className="field-wrap"><label className="field-label" htmlFor={id}>{label}</label><textarea id={id} className={`field textarea${error ? ' field--error' : ''}`} {...props}/>{error ? <span className="field-error"><AlertCircle size={13}/>{error}</span> : null}</div>;
}

export function ErrorMessage({ children, onDismiss }: { children: ReactNode; onDismiss?: () => void }) {
  return <div className="notice notice--error" role="alert"><AlertCircle size={17}/><span>{children}</span>{onDismiss ? <button aria-label="Dismiss error" onClick={onDismiss}>×</button> : null}</div>;
}

export function SuccessMessage({ children }: { children: ReactNode }) {
  return <div className="notice notice--success" role="status"><Check size={16}/><span>{children}</span></div>;
}

export function LoadingState({ label = 'Loading' }: { label?: string }) {
  return <div className="loading-state" role="status"><LoaderCircle className="spin" size={20}/><span>{label}</span></div>;
}

export function EmptyState({ title, description, icon = 'briefcase', action }: { title: string; description: string; icon?: 'briefcase'|'help'|'safety'; action?: ReactNode }) {
  const Icon = icon === 'help' ? CircleHelp : icon === 'safety' ? ShieldAlert : BriefcaseBusiness;
  return <div className="empty-state"><span className="empty-state__icon"><Icon size={21}/></span><strong>{title}</strong><p>{description}</p>{action}</div>;
}

export function StatusBadge({ status }: { status: string }) {
  return <span className={`status-badge status-badge--${status}`}>{status.replaceAll('_', ' ')}</span>;
}

export function Rating({ average, count }: { average: number; count: number }) {
  if (!count) return <span className="rating rating--empty">No reviews yet</span>;
  return <span className="rating"><Star size={14} fill="currentColor"/><b>{average.toFixed(1)}</b><span>({count})</span></span>;
}

export function WorkerCard({ worker, onOpen }: { worker: WorkerDirectoryEntry; onOpen: (worker: WorkerDirectoryEntry) => void }) {
  return <article className={`worker-card ${worker.is_demo?'worker-card--demo':''}`}><div className="worker-card__avatar">{worker.profile_image ? <img loading="lazy" src={worker.profile_image} alt=""/> : <span aria-hidden="true">{worker.full_name.split(/\s+/).map((p) => p[0]).slice(0,2).join('').toUpperCase()}</span>}</div><div className="worker-card__main"><div className="worker-card__title"><h3>{worker.full_name}</h3>{worker.is_demo?<span className="demo-label">Demo · not verified</span>:worker.verification_status === 'verified' ? <span className="verified-label"><BadgeCheck size={14}/>Verified</span> : null}</div><p className="worker-card__trade">{worker.category_names.join(' · ') || 'Local service professional'}</p><p className="worker-card__meta"><MapPin size={13}/>{worker.service_areas.join(', ') || 'Area not listed'}<span>·</span>{worker.experience_years} years’ experience</p><div className="worker-card__tags">{worker.languages.map((language) => <span className="chip" key={language}>{language}</span>)}<StatusBadge status={worker.availability_status==='available'&&worker.accepting_bookings?'available':'unavailable'}/></div></div><div className="worker-card__aside"><Rating average={Number(worker.average_rating)} count={Number(worker.review_count)}/><div className="worker-card__rates"><strong>₹{Number(worker.hourly_rate).toLocaleString('en-IN')}<small>/hr</small></strong><span>₹{Number(worker.daily_rate).toLocaleString('en-IN')} / day</span></div><Button variant="secondary" size="sm" onClick={() => onOpen(worker)}>View profile <ChevronRight size={15}/></Button></div></article>;
}

export function Avatar({ name, image, size = 'md' }: { name: string; image?: string | null; size?: 'sm'|'md'|'lg' }) {
  return <span className={`avatar avatar--${size}`}>{image ? <img src={image} alt=""/> : <><UserRound size={size === 'lg' ? 25 : 17}/><span className="sr-only">{name}</span></>}</span>;
}

export function StatusActions({ status, role, onTransition, busy = false }: { status: BookingStatus; role: 'customer'|'worker'; onTransition: (status: BookingStatus) => void; busy?: boolean }) {
  if (status === 'pending' && role === 'worker') return <div className="card-actions"><Button size="sm" onClick={() => canTransitionBooking(status,'accepted')&&onTransition('accepted')} loading={busy}>Accept</Button><Button size="sm" variant="secondary" onClick={() => canTransitionBooking(status,'rejected')&&onTransition('rejected')} disabled={busy}>Decline</Button></div>;
  if ((status === 'pending' || status === 'accepted') && role === 'customer') return <Button size="sm" variant="ghost" onClick={() => canTransitionBooking(status,'cancelled')&&onTransition('cancelled')} disabled={busy}>Cancel request</Button>;
  if (status === 'accepted' && role === 'worker') return <Button size="sm" onClick={() => canTransitionBooking(status,'completed')&&onTransition('completed')} loading={busy}>Mark complete</Button>;
  return null;
}
