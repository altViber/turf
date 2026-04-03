import { useState, useRef } from 'react';
import { Camera, X, Plus, Users, FileText, Link2, Calendar, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import type { Ground } from '../../../types';
import { useApp } from '../../../context/AppContext';

interface LogVisitModalProps {
  ground: Ground | null;
  open: boolean;
  onClose: () => void;
}

interface PendingPhoto {
  file: File;
  previewUrl: string;
}

type SubmitState = 'idle' | 'saving' | 'uploading' | 'success' | 'error';

export function LogVisitModal({ ground, open, onClose }: LogVisitModalProps) {
  const { addVisit, addPhotoToVisit, groups } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [note, setNote] = useState('');
  const [groupId, setGroupId] = useState('');
  const [companions, setCompanions] = useState('');
  const [photos, setPhotos] = useState<PendingPhoto[]>([]);
  const [submitState, setSubmitState] = useState<SubmitState>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const reset = () => {
    setDate(format(new Date(), 'yyyy-MM-dd'));
    setNote('');
    setGroupId('');
    setCompanions('');
    // Revoke object URLs to free memory
    photos.forEach((p) => URL.revokeObjectURL(p.previewUrl));
    setPhotos([]);
    setSubmitState('idle');
    setErrorMsg('');
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const newPhotos: PendingPhoto[] = files.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
    }));
    setPhotos((prev) => [...prev, ...newPhotos]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removePhoto = (idx: number) => {
    setPhotos((prev) => {
      URL.revokeObjectURL(prev[idx].previewUrl);
      return prev.filter((_, i) => i !== idx);
    });
  };

  const handleSubmit = async () => {
    if (!ground || !date) return;
    setSubmitState('saving');
    setErrorMsg('');

    try {
      const visitId = await addVisit({
        groundId: ground.id,
        groundData: ground,
        date,
        note: note.trim() || null,
        groupId: groupId || null,
        companions: companions.trim() || null,
      });

      if (photos.length > 0) {
        setSubmitState('uploading');
        for (const { file } of photos) {
          await addPhotoToVisit(visitId, file);
        }
      }

      setSubmitState('success');
      setTimeout(() => {
        handleClose();
      }, 900);
    } catch (e) {
      console.error('Failed to save visit:', e);
      setErrorMsg(e instanceof Error ? e.message : 'An error occurred while saving');
      setSubmitState('error');
    }
  };

  if (!open || !ground) return null;

  const isSubmitting = submitState === 'saving' || submitState === 'uploading';

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={isSubmitting ? undefined : handleClose} />

      {/* Modal */}
      <div className="relative w-full bg-surface-elevated rounded-t-3xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pb-3 border-b border-divider">
          <div>
            <h2 className="text-foreground" style={{ fontSize: '18px', fontWeight: 700 }}>Log Visit</h2>
            <p className="text-text-tertiary text-sm truncate max-w-[240px]">{ground.name}</p>
          </div>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="w-8 h-8 rounded-full bg-surface-muted flex items-center justify-center disabled:opacity-40"
          >
            <X className="w-4 h-4 text-text-secondary" />
          </button>
        </div>

        {/* Success state */}
        {submitState === 'success' && (
          <div className="flex-1 flex flex-col items-center justify-center py-10 gap-3">
            <CheckCircle className="w-12 h-12 text-accent-primary" />
            <p className="text-text-secondary font-semibold text-base">Visit saved!</p>
            <p className="text-text-tertiary text-sm">{photos.length > 0 ? `${photos.length} photo${photos.length !== 1 ? 's' : ''} uploaded` : 'No photos'}</p>
          </div>
        )}

        {/* Error state */}
        {submitState === 'error' && (
          <div className="px-5 py-3 bg-error/10 border-b border-error/20 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-error flex-shrink-0 mt-0.5" />
            <p className="text-error text-xs leading-snug">{errorMsg}</p>
          </div>
        )}

        {/* Scrollable content */}
        {submitState !== 'success' && (
          <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">
            {/* Date */}
            <div>
              <label className="flex items-center gap-1.5 text-text-secondary text-sm font-medium mb-1.5">
                <Calendar className="w-4 h-4" />
                Date
              </label>
              <input
                type="date"
                value={date}
                max={format(new Date(), 'yyyy-MM-dd')}
                onChange={(e) => setDate(e.target.value)}
                disabled={isSubmitting}
                className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-text-secondary outline-none focus:border-accent-primary text-sm disabled:opacity-60"
              />
            </div>

            {/* Photos */}
            <div>
              <label className="flex items-center gap-1.5 text-text-secondary text-sm font-medium mb-1.5">
                <Camera className="w-4 h-4" />
                Photos <span className="text-text-tertiary font-normal">(optional)</span>
              </label>
              <div className="flex gap-2 flex-wrap">
                {photos.map((p, i) => (
                  <div key={i} className="relative w-16 h-16 rounded-xl overflow-hidden">
                    <img src={p.previewUrl} alt={p.file.name} className="w-full h-full object-cover" />
                    {!isSubmitting && (
                      <button
                        onClick={() => removePhoto(i)}
                        className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center"
                      >
                        <X className="w-3 h-3 text-white" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isSubmitting}
                  className="w-16 h-16 rounded-xl border-2 border-dashed border-border flex items-center justify-center hover:border-accent-primary transition-colors disabled:opacity-40"
                >
                  <Plus className="w-5 h-5 text-text-tertiary" />
                </button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            {/* Note */}
            <div>
              <label className="flex items-center gap-1.5 text-text-secondary text-sm font-medium mb-1.5">
                <FileText className="w-4 h-4" />
                Note <span className="text-text-tertiary font-normal">(optional)</span>
              </label>
              <textarea
                placeholder="Match result, atmosphere, getting there…"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                disabled={isSubmitting}
                rows={3}
                className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-text-secondary placeholder-text-tertiary text-sm outline-none resize-none focus:border-accent-primary disabled:opacity-60"
              />
            </div>

            {/* Companions */}
            <div>
              <label className="flex items-center gap-1.5 text-text-secondary text-sm font-medium mb-1.5">
                <Users className="w-4 h-4" />
                Companions <span className="text-text-tertiary font-normal">(optional)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Jana, Felix, …"
                value={companions}
                onChange={(e) => setCompanions(e.target.value)}
                disabled={isSubmitting}
                className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-text-secondary placeholder-text-tertiary text-sm outline-none focus:border-accent-primary disabled:opacity-60"
              />
            </div>

            {/* Link to group */}
            <div>
              <label className="flex items-center gap-1.5 text-text-secondary text-sm font-medium mb-1.5">
                <Link2 className="w-4 h-4" />
                Link to group <span className="text-text-tertiary font-normal">(optional)</span>
              </label>
              <select
                value={groupId}
                onChange={(e) => setGroupId(e.target.value)}
                disabled={isSubmitting}
                className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-text-secondary text-sm outline-none focus:border-accent-primary disabled:opacity-60"
              >
                <option value="">No group</option>
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.emoji} {g.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Submit */}
        {submitState !== 'success' && (
          <div className="px-5 py-4 pb-8 border-t border-divider bg-surface-elevated">
            <button
              onClick={submitState === 'error' ? handleSubmit : handleSubmit}
              disabled={isSubmitting || !date}
              className="w-full py-3.5 rounded-2xl bg-accent-primary text-white font-semibold text-sm disabled:opacity-40 active:opacity-80 flex items-center justify-center gap-2"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {submitState === 'saving' && 'Saving visit…'}
              {submitState === 'uploading' && `Uploading ${photos.length} photo${photos.length !== 1 ? 's' : ''}…`}
              {(submitState === 'idle' || submitState === 'error') && 'Save Visit'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}