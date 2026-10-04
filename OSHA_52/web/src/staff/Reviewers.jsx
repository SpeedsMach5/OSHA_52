import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { api } from '../api.js';
import { useSession } from '../session.jsx';
import { useApi, Loading, ErrorBox, formatDate, formatDateTime } from '../util.jsx';
import { useAction, Secret } from './common.jsx';

const STATUS = { active: ['passed', 'Active'], invited: ['wait', 'Invite sent'], revoked: ['locked', 'Revoked'] };

function ReviewerRow({ r, onLink, onDone }) {
  const { busy, error, run } = useAction();
  const post = (path, confirmText, linkLabel) => run(async () => {
    if (confirmText && !window.confirm(confirmText)) return;
    const res = await api(path, { method: 'POST' });
    if (linkLabel) onLink({ label: `${linkLabel} for ${r.name}`, url: res.inviteUrl || res.resetUrl, expiresAt: res.expiresAt });
    onDone();
  });
  const [chip, label] = STATUS[r.status];
  return (
    <tr>
      <td data-label="Name"><strong>{r.name}</strong><br /><span className="small muted">{r.email}</span></td>
      <td data-label="Status"><span className={`chip chip-${chip}`}>{label}</span>
        {r.pendingLinkExpiresAt && <><br /><span className="small muted">{r.pendingLinkKind === 'password_reset' ? 'Reset link' : 'Invite link'} expires {formatDate(r.pendingLinkExpiresAt)}</span></>}
      </td>
      <td data-label="Added">{formatDate(r.createdAt)}</td>
      <td data-label="Actions" className="row-actions">
        {r.status === 'active' && (
          <button type="button" className="btn btn-secondary btn-small" disabled={busy}
            onClick={() => post(`/admin/reviewers/${r.id}/reset-password`, `Reset the password for ${r.name}? Their current password stops working now. You'll get a one-time link to send them.`, 'Password reset link')}>Reset password</button>
        )}
        {r.status !== 'active' && (
          <button type="button" className="btn btn-secondary btn-small" disabled={busy}
            onClick={() => post(`/admin/reviewers/${r.id}/reinvite`, null, 'New invite link')}>{r.status === 'revoked' ? 'Restore with new invite' : 'New invite link'}</button>
        )}
        {r.status !== 'revoked' && (
          <button type="button" className="btn btn-danger btn-small" disabled={busy}
            onClick={() => post(`/admin/reviewers/${r.id}/revoke`, `Revoke ${r.name}? They are signed out at once and cannot sign in. Pending links stop working.`)}>Revoke</button>
        )}
        {error && <p className="small fail">{error}</p>}
      </td>
    </tr>
  );
}

export default function Reviewers() {
  const { session } = useSession();
  const { data, error, loading, reload } = useApi(['/admin/reviewers']);
  const invite = useAction();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [link, setLink] = useState(null);
  if (session.user.role !== 'admin') return <Navigate to="/staff" replace />;
  if (loading && !data) return <Loading />;
  if (error) return <ErrorBox error={error} onRetry={reload} />;
  const [{ reviewers }] = data;

  const send = e => {
    e.preventDefault();
    invite.run(async () => {
      const r = await api('/admin/reviewers/invite', { method: 'POST', body: { name, email } });
      setLink({ label: `Invite link for ${name.trim()}`, url: r.inviteUrl, expiresAt: r.expiresAt });
      setName(''); setEmail('');
      reload();
    });
  };

  return (
    <>
      <h1>Reviewers</h1>
      <section className="card">
        <h2>Invite a reviewer</h2>
        <p className="small muted">You get a one-time link to send them (by email or text). They choose their own password. Reviewers can see all results, approve sign-ups, unlock weeks and reset PINs.</p>
        <form className="filters" onSubmit={send}>
          <div className="field"><label htmlFor="r-name">Full name</label><input id="r-name" value={name} onChange={e => setName(e.target.value)} required /></div>
          <div className="field"><label htmlFor="r-email">Email</label><input id="r-email" type="email" value={email} onChange={e => setEmail(e.target.value)} required /></div>
          <div className="filter-buttons"><button type="submit" className="btn btn-primary btn-small" disabled={invite.busy}>Create invite link</button></div>
        </form>
        {invite.error && <div className="notice notice-error" role="alert">{invite.error}</div>}
      </section>
      {link && <Secret label={link.label} value={link.url} note={`Works once. Expires ${formatDateTime(link.expiresAt)}. This link is only shown now, so copy it before leaving this page.`} />}

      <h2>All reviewers</h2>
      {reviewers.length === 0 ? <p className="muted">No reviewers yet.</p> : (
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Name</th><th>Status</th><th>Added</th><th>Actions</th></tr></thead>
            <tbody>{reviewers.map(r => <ReviewerRow key={r.id} r={r} onLink={setLink} onDone={reload} />)}</tbody>
          </table>
        </div>
      )}
    </>
  );
}
