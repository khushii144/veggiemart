'use client';
export const dynamic = 'force-dynamic';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  ArrowLeft, 
  User, 
  Mail, 
  Package, 
  Info, 
  ShieldAlert,
  Search,
  Filter,
  Zap,
  RefreshCw,
  Truck
} from 'lucide-react';

export default function AdminSubscriptionsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [verificationFilter, setVerificationFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isRunningCron, setIsRunningCron] = useState(false);
  const [cronResult, setCronResult] = useState(null);

  async function fetchSubscriptions() {
    try {
      const res = await fetch('/api/admin/subscriptions');
      if (res.ok) {
        const data = await res.json();
        setSubscriptions(data);
      }
    } catch (error) {
      console.error('Failed to fetch admin subscriptions:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (status !== 'loading') {
      if (status === 'unauthenticated' || (status === 'authenticated' && session.user.role !== 'admin')) {
        router.push('/');
      } else if (status === 'authenticated') {
        fetchSubscriptions();
      }
    }
  }, [status, session, router]);

  const handleRunRecurring = async () => {
    if (!window.confirm('Run recurring order processing now? This will generate new orders for all due active subscriptions.')) return;
    setIsRunningCron(true);
    setCronResult(null);
    try {
      const res = await fetch('/api/admin/run-recurring', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to run recurring orders.');
      setCronResult(data);
      // Refresh the list to show updated nextDeliveryDate values
      await fetchSubscriptions();
    } catch (err) {
      alert(err.message || 'An error occurred running recurring orders.');
    } finally {
      setIsRunningCron(false);
    }
  };

  const handleVerify = async (subscriptionId, action) => {
    const confirmMsg = action === 'approve' 
      ? 'Are you sure you want to APPROVE this subscription and activate it?' 
      : 'Are you sure you want to REJECT this subscription?';

    if (!window.confirm(confirmMsg)) return;

    setUpdatingId(subscriptionId);
    try {
      const res = await fetch('/api/admin/subscriptions/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ subscriptionId, action }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || `Failed to ${action} subscription`);
      }

      // Update the local state instantly
      setSubscriptions((prev) =>
        prev.map((sub) =>
          sub._id === subscriptionId 
            ? { 
                ...sub, 
                verificationStatus: action === 'approve' ? 'verified' : 'rejected',
                status: action === 'approve' ? 'active' : 'cancelled'
              } 
            : sub
        )
      );

      alert(`Subscription successfully ${action}d!`);
    } catch (error) {
      alert(error.message || `An error occurred during verification.`);
    } finally {
      setUpdatingId(null);
    }
  };

  const getVerificationBadge = (vStatus) => {
    switch (vStatus?.toLowerCase()) {
      case 'verified':
        return (
          <span className="flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 border border-green-100 rounded-full text-xs font-bold uppercase tracking-wider">
            <CheckCircle2 className="w-3.5 h-3.5" /> Verified
          </span>
        );
      case 'rejected':
        return (
          <span className="flex items-center gap-1 px-3 py-1 bg-red-50 text-red-700 border border-red-100 rounded-full text-xs font-bold uppercase tracking-wider">
            <XCircle className="w-3.5 h-3.5" /> Rejected
          </span>
        );
      case 'pending':
      default:
        return (
          <span className="flex items-center gap-1 px-3 py-1 bg-amber-50 text-amber-700 border border-amber-100 rounded-full text-xs font-bold uppercase tracking-wider animate-pulse">
            <Clock className="w-3.5 h-3.5 text-amber-600" /> Pending Verification
          </span>
        );
    }
  };

  const getStatusBadge = (subStatus) => {
    switch (subStatus?.toLowerCase()) {
      case 'active':
        return (
          <span className="flex items-center gap-1 px-2.5 py-0.5 bg-green-600 text-white rounded-full text-xs font-bold">
            Active
          </span>
        );
      case 'cancelled':
        return (
          <span className="flex items-center gap-1 px-2.5 py-0.5 bg-red-600 text-white rounded-full text-xs font-bold">
            Cancelled
          </span>
        );
      case 'paused':
        return (
          <span className="flex items-center gap-1 px-2.5 py-0.5 bg-amber-600 text-white rounded-full text-xs font-bold">
            Paused
          </span>
        );
      case 'inactive':
      default:
        return (
          <span className="flex items-center gap-1 px-2.5 py-0.5 bg-slate-500 text-white rounded-full text-xs font-bold">
            Inactive
          </span>
        );
    }
  };

  // Metrics
  const totalCount = subscriptions.length;
  const pendingCount = subscriptions.filter(s => s.verificationStatus === 'pending').length;
  const activeCount = subscriptions.filter(s => s.status === 'active').length;
  const pausedCount = subscriptions.filter(s => s.status === 'paused').length;

  // Filtered subscriptions
  const filteredSubscriptions = subscriptions.filter(sub => {
    const matchesSearch = 
      (sub.userId?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (sub.userId?.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (sub.productId?.name || '').toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesVerification = 
      verificationFilter === 'all' || 
      sub.verificationStatus?.toLowerCase() === verificationFilter.toLowerCase();
      
    const matchesStatus = 
      statusFilter === 'all' || 
      sub.status?.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesVerification && matchesStatus;
  });

  if (status === 'loading' || loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-green-200 border-t-green-600 animate-spin" />
        <p className="text-gray-500 font-medium">Loading subscription panel...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Link 
            href="/admin" 
            className="p-3 bg-white border border-gray-100 hover:bg-gray-50 rounded-2xl shadow-sm text-gray-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
              <Calendar className="w-8 h-8 text-green-600" />
              Manage Subscriptions
            </h1>
            <p className="text-gray-500 text-sm mt-1">Verify, approve, or reject customer wholesale subscriptions</p>
          </div>
        </div>
        {pendingCount > 0 && (
          <span className="self-start sm:self-center px-4 py-2 bg-amber-500 text-white rounded-full text-xs font-black uppercase tracking-wider shadow-md animate-pulse">
            {pendingCount} Pending Verification
          </span>
        )}
        <button
          onClick={handleRunRecurring}
          disabled={isRunningCron}
          className="self-start sm:self-center flex items-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-extrabold text-xs rounded-2xl shadow-md hover:shadow-lg active:scale-[0.98] transition-all uppercase tracking-wider"
        >
          {isRunningCron ? (
            <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Processing...</>
          ) : (
            <><Zap className="w-3.5 h-3.5" /> Run Recurring Orders</>
          )}
        </button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Total Orders</span>
          <h3 className="text-2xl font-black text-gray-900 mt-2">{totalCount}</h3>
        </div>
        <div className="bg-amber-500/10 p-6 rounded-3xl border border-amber-500/15 shadow-sm flex flex-col justify-between">
          <span className="text-xs text-amber-600 font-bold uppercase tracking-wider">Pending Verification</span>
          <h3 className="text-2xl font-black text-amber-700 mt-2">{pendingCount}</h3>
        </div>
        <div className="bg-green-600/10 p-6 rounded-3xl border border-green-600/15 shadow-sm flex flex-col justify-between">
          <span className="text-xs text-green-600 font-bold uppercase tracking-wider">Active Customers</span>
          <h3 className="text-2xl font-black text-green-700 mt-2">{activeCount}</h3>
        </div>
        <div className="bg-blue-600/10 p-6 rounded-3xl border border-blue-600/15 shadow-sm flex flex-col justify-between">
          <span className="text-xs text-blue-600 font-bold uppercase tracking-wider">Paused Terms</span>
          <h3 className="text-2xl font-black text-blue-700 mt-2">{pausedCount}</h3>
        </div>
      </div>

      {/* Cron Run Result Banner */}
      {cronResult && (
        <div className="bg-indigo-50 border border-indigo-100 rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600 rounded-xl">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="font-extrabold text-indigo-900 text-sm">Recurring Run Complete</div>
              <div className="text-indigo-600 text-xs mt-0.5">
                {cronResult.processed} order(s) created &nbsp;·&nbsp; {cronResult.skipped} skipped &nbsp;·&nbsp; {cronResult.failed} failed
              </div>
            </div>
          </div>
          <button onClick={() => setCronResult(null)} className="text-indigo-400 hover:text-indigo-600 text-xs font-bold self-start sm:self-auto">
            Dismiss ✕
          </button>
        </div>
      )}

      {/* Search & Filters */}
      <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input 
            type="text"
            placeholder="Search by customer, email, product..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 focus:border-green-500 focus:bg-white rounded-2xl text-sm text-gray-800 outline-none transition-all"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
          <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
            <Filter className="w-3.5 h-3.5" /> Filter by:
          </div>
          
          <select 
            value={verificationFilter}
            onChange={(e) => setVerificationFilter(e.target.value)}
            className="px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-gray-700 outline-none cursor-pointer focus:border-green-500"
          >
            <option value="all">Verification: All</option>
            <option value="pending">Pending</option>
            <option value="verified">Verified</option>
            <option value="rejected">Rejected</option>
          </select>

          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-gray-700 outline-none cursor-pointer focus:border-green-500"
          >
            <option value="all">Status: All</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="cancelled">Cancelled</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Subscription Grid List */}
      {filteredSubscriptions.length === 0 ? (
        <div className="bg-white rounded-[2.5rem] p-12 text-center border border-gray-100 shadow-sm max-w-md mx-auto">
          <div className="p-4 bg-gray-50 text-gray-400 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 border border-gray-100">
            <Info className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-1">No Subscriptions Found</h3>
          <p className="text-gray-500 text-sm">No wholesale customer subscriptions match your current filters or query terms.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredSubscriptions.map((sub) => {
            const product = sub.productId || {};
            const user = sub.userId || {};
            const basePrice = (product.price || 0) * sub.quantity;
            const recurringPrice = Math.round(basePrice * (sub.frequency === 'weekly' ? 0.9 : 0.85));
            const imageUrl = product.image || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?q=80&w=900&auto=format&fit=crop';

            return (
              <div 
                key={sub._id}
                className="bg-white rounded-[2rem] border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all overflow-hidden flex flex-col"
              >
                {/* Customer Pill Banner */}
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center text-green-700">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-gray-900 text-sm leading-tight">{user.name || 'Anonymous Customer'}</div>
                      <div className="text-[10px] text-gray-400 flex items-center gap-1">
                        <Mail className="w-3 h-3" /> {user.email || 'No email provided'}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    {getVerificationBadge(sub.verificationStatus)}
                  </div>
                </div>

                {/* Body Details */}
                <div className="p-6 flex-grow flex flex-col justify-between gap-6">
                  {/* Vegetable Image and basic description */}
                  <div className="flex gap-4 items-center">
                    <div className="relative w-16 h-16 bg-white border border-gray-100 rounded-2xl overflow-hidden p-2 flex-shrink-0 flex items-center justify-center">
                      <img 
                        src={imageUrl} 
                        alt={product.name || 'Vegetable'} 
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-gray-900 text-base leading-tight">
                        {product.name || 'Unknown Vegetable'}
                      </h4>
                      <div className="text-xs text-gray-400 mt-1 capitalize">
                        {sub.frequency} Delivery ({sub.deliveryDate})
                      </div>
                    </div>
                  </div>

                  {/* Quantity, Status, Pricing, and Next Delivery grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 bg-gray-50/50 border border-gray-100 rounded-2xl p-4 text-center gap-4 sm:gap-0 sm:divide-x sm:divide-gray-100">
                    <div>
                      <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Volume</div>
                      <div className="font-bold text-gray-800 text-xs mt-1">{sub.quantity} pack(s)</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Status</div>
                      <div className="flex justify-center mt-1">
                        {getStatusBadge(sub.status)}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Recurring</div>
                      <div className="font-extrabold text-green-600 text-xs mt-1">₹{recurringPrice}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider flex items-center justify-center gap-0.5">
                        <Truck className="w-2.5 h-2.5" /> Next Delivery
                      </div>
                      <div className="font-bold text-indigo-600 text-xs mt-1">
                        {sub.nextDeliveryDate
                          ? new Date(sub.nextDeliveryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
                          : '—'
                        }
                      </div>
                    </div>
                  </div>

                  {/* Action panel */}
                  {sub.verificationStatus === 'pending' ? (
                    <div className="flex items-center gap-3 pt-2">
                      <button
                        disabled={updatingId === sub._id}
                        onClick={() => handleVerify(sub._id, 'approve')}
                        className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white font-extrabold text-xs rounded-xl shadow-md hover:shadow-lg active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                      >
                        {updatingId === sub._id ? (
                          <div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                        ) : (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        )}
                        Approve
                      </button>
                      <button
                        disabled={updatingId === sub._id}
                        onClick={() => handleVerify(sub._id, 'reject')}
                        className="flex-1 py-3 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs rounded-xl hover:shadow-sm active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                      >
                        {updatingId === sub._id ? (
                          <div className="w-3.5 h-3.5 rounded-full border-2 border-red-300 border-t-transparent animate-spin" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5" />
                        )}
                        Reject
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-gray-400 text-xs font-semibold justify-center pt-2 select-none">
                      <CheckCircle2 className="w-3.5 h-3.5 text-gray-400" />
                      Verification Closed (ID: {sub._id})
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
