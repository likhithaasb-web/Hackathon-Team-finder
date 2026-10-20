import React, { useState } from 'react';
import Modal from './Modal.jsx';
import apiClient from '../api/client.js';
import toast from 'react-hot-toast';
import { Flag } from 'lucide-react';

export default function ReportModal({ isOpen, onClose, targetType, targetId, targetName }) {
  const [reason, setReason] = useState('Inappropriate conduct or spam');
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await apiClient.post('/reports', {
        targetType,
        targetId,
        reason,
        details,
      });
      if (res.data?.success) {
        toast.success('Report submitted. Our moderation team will review it.');
        onClose();
      }
    } catch (err) {
      toast.error('Failed to submit report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Report ${targetName || targetType}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
            Reason for reporting
          </label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 dark:bg-dark-card border border-gray-300 dark:border-dark-border rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500"
          >
            <option value="Inappropriate conduct or spam">Inappropriate conduct or spam</option>
            <option value="Fake profile or misleading experience">Fake profile or misleading experience</option>
            <option value="Harassment or hate speech">Harassment or hate speech</option>
            <option value="Ghosting or team disruption">Ghosting or deliberate team disruption</option>
            <option value="Copyright or intellectual property violation">Copyright or IP violation</option>
            <option value="Other">Other reason</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
            Additional Context
          </label>
          <textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            rows={4}
            placeholder="Please provide any relevant details to help our moderation team investigate..."
            className="w-full px-3 py-2 bg-gray-50 dark:bg-dark-card border border-gray-300 dark:border-dark-border rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 resize-none"
          />
        </div>

        <div className="flex justify-end space-x-3 pt-3 border-t border-gray-200 dark:border-dark-border">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-border transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-xl text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 transition-colors shadow-sm"
          >
            <Flag className="w-4 h-4" />
            <span>{submitting ? 'Submitting...' : 'Submit Report'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
