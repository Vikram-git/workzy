import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Copy, QrCode, X } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

function isLoopback(hostname: string) {
  return hostname === 'localhost' || hostname === '::1' || /^127(?:\.\d{1,3}){3}$/.test(hostname);
}

export function PhoneShareButton({ compact = false }: { compact?: boolean }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const isSecurePreview = url.startsWith('https://');

  useEffect(() => {
    if (!open) return;
    const dismissOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', dismissOnEscape);
    return () => window.removeEventListener('keydown', dismissOnEscape);
  }, [open]);

  async function showShareCode() {
    setOpen(true);
    setLoading(true);
    setCopied(false);
    setError('');
    try {
      if (isLoopback(window.location.hostname)) {
        const response = await fetch('/__workzy/lan-url', { cache: 'no-store' });
        const data = await response.json() as { url?: string; message?: string };
        if (!response.ok || !data.url) throw new Error(data.message || 'Unable to find a shareable Wi-Fi address.');
        setUrl(data.url);
      } else {
        setUrl(new URL('/', window.location.href).toString());
      }
    } catch (cause) {
      setUrl('');
      setError(cause instanceof Error ? cause.message : 'Unable to create a phone link.');
    } finally {
      setLoading(false);
    }
  }

  async function copyLink() {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setError('');
    } catch {
      setCopied(false);
      setError('Copy is unavailable here. Scan the QR code or select the address above.');
    }
  }

  return <>
    <button type="button" className={`phone-share-trigger${compact ? ' phone-share-trigger--compact' : ''}`} onClick={() => void showShareCode()} aria-haspopup="dialog" aria-label="Share WORKZY to a phone">
      <QrCode size={16}/><span>Share to phone</span>
    </button>
    {open ? createPortal(<div className="dialog-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setOpen(false)}>
      <section className="dialog phone-share-dialog" role="dialog" aria-modal="true" aria-labelledby="phone-share-title">
        <div className="dialog-head">
          <div><p className="eyebrow">WORKZY · PHONE PREVIEW</p><h2 id="phone-share-title">Open this demo on your phone</h2></div>
          <button type="button" className="icon-button" onClick={() => setOpen(false)} aria-label="Close QR code" autoFocus><X size={18}/></button>
        </div>
        <div className="phone-share-body">
          <p className="body-muted">{isSecurePreview ? 'Scan the code to open WORKZY over HTTPS on your phone.' : 'Connect your phone to the same Wi-Fi, then scan this code with its camera.'}</p>
          {loading ? <div className="phone-share-placeholder" role="status">Finding this Mac’s Wi-Fi address…</div> : error && !url ? <div className="phone-share-error" role="alert">{error}</div> : url ? <>
            <div className="phone-share-qr"><QRCodeSVG value={url} size={224} level="M" includeMargin title="QR code that opens the WORKZY demo on a phone"/></div>
            <label className="phone-share-link-label" htmlFor="phone-share-link">Phone link</label>
            <div className="phone-share-copy-row"><input id="phone-share-link" readOnly value={url} onFocus={(event) => event.currentTarget.select()}/><button type="button" className="phone-share-copy" onClick={() => void copyLink()} aria-label="Copy phone link"><Copy size={16}/><span>{copied ? 'Copied' : 'Copy'}</span></button></div>
            {error ? <p className="phone-share-error" role="status">{error}</p> : null}
            <p className="phone-share-note">{isSecurePreview ? 'Allow location when prompted. Install WORKZY from your browser menu; each device keeps its own demo data.' : 'The phone must stay on this Wi-Fi while using the local demo.'}</p>
          </> : null}
        </div>
      </section>
    </div>, document.body) : null}
  </>;
}
