import React from 'react';
import { FolderSearch } from 'lucide-react';

export default function EmptyState({
  icon: Icon = FolderSearch,
  title = 'No items found',
  description = 'Try adjusting your filters or search keywords.',
  actionText,
  onAction,
}) {
  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl border border-dashed border-gray-300 dark:border-dark-border bg-gray-50/50 dark:bg-dark-card/30">
      <div className="w-14 h-14 mb-4 rounded-2xl bg-brand-50 dark:bg-brand-950/50 text-brand-600 dark:text-brand-400 flex items-center justify-center">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
        {title}
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mb-6">
        {description}
      </p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-xl text-white bg-brand-600 hover:bg-brand-700 shadow-sm transition-colors"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}
