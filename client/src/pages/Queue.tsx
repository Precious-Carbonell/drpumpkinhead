import { Users, Clock } from 'lucide-react';
import './Queue.css';

interface PublicCommission {
  maskedName: string;
  commissionType: string;
  queuePosition: number;
  commissionStatus: string;
  progressPercentage: number;
  estimatedCompletion: string;
}

// Mock data — will come from GET /api/commissions/public
const mockCommissions: PublicCommission[] = [
  {
    maskedName: 'P******s C***a',
    commissionType: 'Bust-up (Solo)',
    queuePosition: 1,
    commissionStatus: 'In Progress',
    progressPercentage: 80,
    estimatedCompletion: '2026-08-05',
  },
  {
    maskedName: 'J**n D*e',
    commissionType: 'Icon (Couple)',
    queuePosition: 2,
    commissionStatus: 'In Progress',
    progressPercentage: 45,
    estimatedCompletion: '2026-08-10',
  },
  {
    maskedName: 'A*a R***s',
    commissionType: 'Chibi Bust-up',
    queuePosition: 3,
    commissionStatus: 'Sketching',
    progressPercentage: 20,
    estimatedCompletion: '2026-08-14',
  },
  {
    maskedName: 'M**k T*n',
    commissionType: 'Icon (Solo)',
    queuePosition: 4,
    commissionStatus: 'Queued',
    progressPercentage: 0,
    estimatedCompletion: '2026-08-18',
  },
  {
    maskedName: 'S****h L*e',
    commissionType: 'Bust-up (Couple)',
    queuePosition: 5,
    commissionStatus: 'Queued',
    progressPercentage: 0,
    estimatedCompletion: '2026-08-22',
  },
];

function getStatusClass(status: string) {
  const lower = status.toLowerCase();
  if (lower.includes('progress') || lower.includes('sketch') || lower.includes('coloring'))
    return 'status-active';
  if (lower.includes('queue') || lower.includes('pending'))
    return 'status-pending';
  if (lower.includes('complete') || lower.includes('done'))
    return 'status-done';
  return '';
}

export default function Queue() {
  return (
    <main className="queue-page">
      <div className="container">
        <div className="queue-header">
          <img src="/queue.png" alt="Commission Queue" className="queue-heading-img" />
          <p>
            See where your commission is in the queue. Find your masked name below
            to check your status and estimated completion date.
          </p>
        </div>

        <div className="queue-stats">
          <div className="queue-stat-card">
            <Users size={20} />
            <div>
              <span className="stat-number">{mockCommissions.length}</span>
              <span className="stat-label">In Queue</span>
            </div>
          </div>
          <div className="queue-stat-card">
            <Clock size={20} />
            <div>
              <span className="stat-number">
                {mockCommissions.filter(c => c.commissionStatus.toLowerCase().includes('progress') || c.commissionStatus.toLowerCase().includes('sketch')).length}
              </span>
              <span className="stat-label">Active</span>
            </div>
          </div>
        </div>

        <div className="queue-table-wrapper">
          <table className="queue-table">
            <thead>
              <tr>
                <th>Client</th>
                <th>Commission Type</th>
                <th>Queue #</th>
                <th>Status</th>
                <th>Progress</th>
                <th>Est. Completion</th>
              </tr>
            </thead>
            <tbody>
              {mockCommissions.map((commission, index) => (
                <tr key={index}>
                  <td className="cell-name">{commission.maskedName}</td>
                  <td>{commission.commissionType}</td>
                  <td className="cell-queue">#{commission.queuePosition}</td>
                  <td>
                    <span className={`status-badge ${getStatusClass(commission.commissionStatus)}`}>
                      {commission.commissionStatus}
                    </span>
                  </td>
                  <td>
                    <div className="cell-progress">
                      <div className="mini-progress-bar">
                        <div
                          className="mini-progress-fill"
                          style={{ width: `${commission.progressPercentage}%` }}
                        />
                      </div>
                      <span className="progress-text">{commission.progressPercentage}%</span>
                    </div>
                  </td>
                  <td className="cell-date">
                    {new Date(commission.estimatedCompletion).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="queue-note">
          <p>
            <strong>Privacy note:</strong> Names are masked for privacy.
            Only the first and last letters of each name part are shown.
            No personal details, payment info, or project descriptions are displayed.
          </p>
        </div>
      </div>
    </main>
  );
}
