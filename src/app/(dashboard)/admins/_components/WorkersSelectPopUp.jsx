'use client';

import React, { useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const WorkersSelectPopUp = ({ workers, onClose, loading, issueId }) => {
  const [confirmWorker, setConfirmWorker] = useState(null);
  const [assigning, setAssigning] = useState(false);

  const assignWorker = async (worker) => {
    try {
      setAssigning(true);
      const res = await fetch(`/api/admin/admin-issues?id=${worker.id}&selected_issue=${issueId.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: worker.id }),
      });

      const result = await res.json();
      console.log(result)

      if (res.ok) {
        alert('User assigned successfully!');
        onClose();
      } else {
        alert(result.error || 'Failed to assign user');
      }
    } catch (err) {
      alert('Something went wrong');
      console.error(err);
    } finally {
      setAssigning(false);
      setConfirmWorker(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md relative">
        <button className="absolute top-2 right-3 text-xl" onClick={onClose}>
          &times;
        </button>
        <h2 className="text-lg font-semibold mb-4">Select Worker to Assign</h2>

        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-6 w-2/4" />
          </div>
        ) : workers.length ? (
          <ul className="space-y-2">
            {workers.map((worker) => (
              <li
                key={worker.id}
                className="p-2 border rounded hover:bg-gray-100 cursor-pointer"
                onClick={() => setConfirmWorker(worker)}
              >
                {worker.full_name || worker.email}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground">No workers found for this department.</p>
        )}

        {confirmWorker && (
          <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-xl shadow-md max-w-sm w-full text-center">
              <p className="mb-4">
                Are you sure you want to assign <strong>{confirmWorker.full_name}</strong>?
              </p>
              <div className="flex justify-around">
                <button
                  onClick={() => assignWorker(confirmWorker)}
                  disabled={assigning}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  {assigning ? 'Assigning...' : 'Yes'}
                </button>
                <button
                  onClick={() => setConfirmWorker(null)}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkersSelectPopUp;
