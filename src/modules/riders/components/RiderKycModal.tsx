import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  X, CheckCircle, XCircle, Clock, Loader2, ExternalLink,
  ShieldCheck, ShieldX, FileText, ImageOff
} from 'lucide-react';
import toast from 'react-hot-toast';
import { riderService, type AdminRider } from '@/core/api/riders';

// Flexible document shape — API may use any of these URL field names
type KycDoc = Record<string, any>;

interface RiderKycModalProps {
  rider: AdminRider;
  onClose: () => void;
}

// Exact Pascal-case types returned by the backend (from KycScreen.tsx)
const DOC_LABELS: Record<string, string> = {
  AadhaarFront:  'Aadhaar Card (Front)',
  AadhaarBack:   'Aadhaar Card (Back)',
  DrivingLicense:'Driving Licence',
  VehicleRC:     'Vehicle RC',
  PanCard:       'PAN Card',
  Selfie:        'Selfie / Photo',
};

// The API likely returns Pascal-case statuses too
function normalise(s: string) { return s?.toLowerCase(); }

function DocStatusBadge({ status }: { status: string }) {
  const s = normalise(status);
  if (s === 'approved') return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#ecfdf5] text-[#059669] border border-[#a7f3d0] rounded-full text-[11px] font-semibold">
      <CheckCircle className="w-3 h-3" /> Approved
    </span>
  );
  if (s === 'rejected') return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#fef2f2] text-[#dc2626] border border-[#fecaca] rounded-full text-[11px] font-semibold">
      <XCircle className="w-3 h-3" /> Rejected
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#fff7ed] text-[#ea580c] border border-[#fed7aa] rounded-full text-[11px] font-semibold">
      <Clock className="w-3 h-3" /> Pending
    </span>
  );
}

function resolveUrl(doc: KycDoc): string {
  return (
    doc.publicUrl ||
    doc.documentUrl ||
    doc.url ||
    doc.fileUrl ||
    doc.imageUrl ||
    ''
  );
}

function DocCard({ doc }: { doc: KycDoc }) {
  const [imgError, setImgError] = useState(false);
  const label = DOC_LABELS[doc.documentType] ?? doc.documentType;
  const url = resolveUrl(doc);
  // Derive display status from isVerified boolean (real API) or fall back to status string
  const verified = doc.isVerified === true;
  const statusLabel = verified ? 'Verified' : (doc.status ?? 'Pending');

  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden bg-white">
      {/* Image preview area */}
      <div className="w-full h-44 bg-gray-50 flex items-center justify-center border-b border-gray-100 relative overflow-hidden">
        {url && !imgError ? (
          <img
            src={url}
            alt={label}
            onError={() => setImgError(true)}
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-gray-300">
            {imgError ? (
              <ImageOff className="w-8 h-8" />
            ) : (
              <FileText className="w-8 h-8" />
            )}
            <span className="text-[11px]">{imgError ? 'Preview unavailable' : 'No preview'}</span>
          </div>
        )}
        {/* Status chip on image */}
        <div className="absolute top-2 right-2">
          <DocStatusBadge status={statusLabel} />
        </div>
      </div>

      {/* Doc info footer */}
      <div className="flex items-center justify-between px-3.5 py-2.5">
        <div>
          <p className="text-[13px] font-semibold text-gray-900">{label}</p>
          {doc.uploadedAt && (
            <p className="text-[11px] text-gray-400 mt-0.5">
              {new Date(doc.uploadedAt).toLocaleDateString('en-IN', {
                day: '2-digit', month: 'short', year: 'numeric',
              })}
            </p>
          )}
          {doc.rejectionReason && (
            <p className="text-[11px] text-red-500 mt-0.5 max-w-[180px] truncate" title={doc.rejectionReason}>
              {doc.rejectionReason}
            </p>
          )}
        </div>
        {url && (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors shrink-0"
            title="Open full size"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        )}
      </div>
    </div>
  );
}

export default function RiderKycModal({ rider, onClose }: RiderKycModalProps) {
  const queryClient = useQueryClient();

  // kycStatus already comes from the riders list — no separate GET needed
  const overallStatus = rider.kycStatus;

  const { data: documents, isLoading } = useQuery({
    queryKey: ['rider-kyc-documents', rider.id],
    queryFn: () => riderService.getKycDocuments(rider.id),
  });

  const approveMutation = useMutation({
    mutationFn: () => riderService.updateKycStatus(rider.id, 'Verified'),
    onSuccess: () => {
      toast.success('KYC approved successfully!');
      queryClient.invalidateQueries({ queryKey: ['riders'] });
      onClose();
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to approve KYC.');
    },
  });

  const rejectMutation = useMutation({
    mutationFn: () => riderService.updateKycStatus(rider.id, 'Rejected'),
    onSuccess: () => {
      toast.success('KYC rejected.');
      queryClient.invalidateQueries({ queryKey: ['riders'] });
      onClose();
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to reject KYC.');
    },
  });

  const isPending = approveMutation.isPending || rejectMutation.isPending;

  const initials = rider.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const docs = documents ?? [];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[680px] flex flex-col max-h-[92vh]">

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#1a1a1a] text-white flex items-center justify-center font-bold text-[13px] shrink-0">
              {initials}
            </div>
            <div>
              <h2 className="text-[16px] font-bold text-gray-900 leading-tight">{rider.name}</h2>
              <p className="text-[12px] text-gray-400">{rider.phone} · {rider.vehicleType}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Overall status pill in header */}
            {!isLoading && (
              <>
                {normalise(overallStatus) === 'verified' && (
                  <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 bg-[#ecfdf5] text-[#059669] border border-[#a7f3d0] rounded-full text-[12px] font-bold">
                    <CheckCircle className="w-3.5 h-3.5" /> Verified
                  </span>
                )}
                {normalise(overallStatus) === 'rejected' && (
                  <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 bg-[#fef2f2] text-[#dc2626] border border-[#fecaca] rounded-full text-[12px] font-bold">
                    <XCircle className="w-3.5 h-3.5" /> Rejected
                  </span>
                )}
                {normalise(overallStatus) === 'pending' && (
                  <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 bg-[#fff7ed] text-[#ea580c] border border-[#fed7aa] rounded-full text-[12px] font-bold">
                    <Clock className="w-3.5 h-3.5" /> Pending
                  </span>
                )}
              </>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="flex-1 overflow-y-auto px-6 py-5 custom-scrollbar">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
              <span className="ml-2 text-[13px] text-gray-400">Loading KYC documents...</span>
            </div>
          ) : docs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <FileText className="w-10 h-10 opacity-30 mb-3" />
              <p className="text-[14px] font-medium">No documents submitted yet</p>
              <p className="text-[12px] mt-1 text-gray-300">The rider hasn't uploaded any KYC documents.</p>
            </div>
          ) : (
            <>
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-3">
                {docs.length} Document{docs.length !== 1 ? 's' : ''} Submitted
              </p>
              {/* Grid: 2 columns on wider screens */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {docs.map((doc, idx) => (
                  <DocCard key={idx} doc={doc} />
                ))}
              </div>

            </>
          )}
        </div>

        {/* ── Footer: Approve / Reject ── */}
        {normalise(overallStatus) === 'pending' && !isLoading && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3 shrink-0 bg-gray-50/60 rounded-b-2xl">
            <button
              onClick={() => rejectMutation.mutate()}
              disabled={isPending}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-bold text-white bg-[#dc2626] hover:bg-[#b91c1c] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {rejectMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldX className="w-4 h-4" />}
              Reject KYC
            </button>
            <button
              onClick={() => approveMutation.mutate()}
              disabled={isPending}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-bold text-white bg-[#059669] hover:bg-[#047857] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {approveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
              Verify KYC
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
