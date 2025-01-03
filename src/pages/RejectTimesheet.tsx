import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useApprovals } from '@/lib/hooks/useApprovals';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { XCircle, CheckCircle } from 'lucide-react';
import type { Approval } from '@/types';

export default function RejectTimesheet() {
  const [searchParams] = useSearchParams();
  const { rejectTimesheet, isRejecting } = useApprovals();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [approval, setApproval] = useState<Approval | null>(null);
  const [comments, setComments] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const approvalId = searchParams.get('id');

  useEffect(() => {
    async function fetchApproval() {
      if (!approvalId) {
        setError('No approval ID provided');
        return;
      }

      try {
        const approvalRef = doc(db, 'approvals', approvalId);
        const approvalDoc = await getDoc(approvalRef);

        if (!approvalDoc.exists()) {
          setError('Approval not found');
          return;
        }

        const approvalData = approvalDoc.data() as Approval;
        
        if (approvalData.status !== 'pending') {
          setError('This timesheet has already been processed');
          return;
        }

        setApproval(approvalData);
      } catch (err) {
        setError('Failed to load approval details');
        console.error(err);
      }
    }

    fetchApproval();
  }, [approvalId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    
    if (!comments.trim()) {
      setValidationError('Please provide rejection comments');
      return;
    }

    setError(null);

    try {
        const rejection = {...approval,comments:comments}
      await rejectTimesheet(rejection);
      setIsComplete(true);
    } catch (error) {
      setError('Failed to submit rejection. Please try again.');
      console.error(error);
    }
  };

  if (!approvalId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-lg p-6">
          <div className="text-center text-red-600">
            <XCircle className="h-12 w-12 mx-auto mb-4" />
            <h1 className="text-xl font-semibold">Invalid Request</h1>
            <p className="mt-2">No approval ID provided</p>
          </div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-lg p-6">
          <div className="text-center text-red-600">
            <XCircle className="h-12 w-12 mx-auto mb-4" />
            <h1 className="text-xl font-semibold">Error</h1>
            <p className="mt-2">{error}</p>
          </div>
        </Card>
      </div>
    );
  }

  if (!approval) {
    return <LoadingScreen />;
  }

  if (isComplete) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-lg p-6">
          <div className="text-center text-green-600">
            <CheckCircle className="h-12 w-12 mx-auto mb-4" />
            <h1 className="text-xl font-semibold">Timesheet Rejected</h1>
            <p className="mt-2">The timesheet has been rejected and the submitter will be notified.</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg p-6">
        <div className="space-y-6">
          <div>
            <h1 className="text-xl font-semibold">Reject Timesheet</h1>
            <p className="mt-2 text-sm text-gray-600">
              Please provide feedback about why this timesheet is being rejected.
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 text-sm space-y-2">
            <div>
              <span className="font-medium">Client:</span>
              <span className="ml-2">{approval.client.name}</span>
            </div>
            <div>
              <span className="font-medium">Project:</span>
              <span className="ml-2">{approval.project.name}</span>
            </div>
            <div>
              <span className="font-medium">Total Hours:</span>
              <span className="ml-2">{approval.totalHours.toFixed(2)}</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField label="Rejection Comments">
              <textarea
                value={comments}
                onChange={(e) => {
                  setComments(e.target.value);
                  setValidationError(null);
                }}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                rows={4}
                required
                placeholder="Please explain why this timesheet is being rejected..."
              />
              {validationError && (
                <p className="mt-1 text-sm text-red-600">{validationError}</p>
              )}
            </FormField>

            <div className="flex justify-end gap-3">
              <Button
                type="submit"
                disabled={isRejecting}
              >
                {isRejecting ? 'Submitting...' : 'Submit Rejection'}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}