import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import { API_BASE_URL, ALGORITHM_API_BASE_URL, ALLOCATION_SERVICE_URL, API_ENDPOINTS } from '../../config/api';
import { apiFetch } from '../../lib/http';

// ── Icons ──────────────────────────────────────────────────────────────────────
const CogIcon = ({ className, spin }) => (
  <svg className={`${className} ${spin ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const PlayIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const CheckCircleIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const XCircleIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const EyeIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const ChevronDownIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

const UsersIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const RefreshIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

const StarIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

const ClockIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

// ── Helpers ────────────────────────────────────────────────────────────────────
const getScoreColor = (score) => {
  if (score >= 85) return 'text-emerald-700 bg-emerald-50 border-emerald-200';
  if (score >= 70) return 'text-green-700 bg-green-50 border-green-200';
  if (score >= 50) return 'text-amber-700 bg-amber-50 border-amber-200';
  return 'text-red-700 bg-red-50 border-red-200';
};

const getScoreBarColor = (score) => {
  if (score >= 85) return '#10b981';
  if (score >= 70) return '#22c55e';
  if (score >= 50) return '#f59e0b';
  return '#ef4444';
};

const statusBadge = (status) => {
  const map = {
    DRAFT:    'bg-amber-50 text-amber-700 border-amber-200',
    APPROVED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    REJECTED: 'bg-red-50 text-red-700 border-red-200',
  };
  return map[status] || 'bg-gray-50 text-gray-700 border-gray-200';
};

const fmt = (iso) => iso ? new Date(iso).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '—';

const fmtYear = (y) => {
  if (!y) return 'All Years';
  const suffixes = { 1: '1st', 2: '2nd', 3: '3rd', 4: '4th' };
  return `${suffixes[y] || y + 'th'} Year`;
};

// ── Main component ─────────────────────────────────────────────────────────────
export default function AllocationPage() {
  const [tab, setTab] = useState('run');          // 'run' | 'history'
  const [strategies, setStrategies] = useState([]);
  const [selectedStrategy, setSelectedStrategy] = useState('preference_queue_louvain');
  const [selectedYear, setSelectedYear] = useState('ALL'); // 'ALL' | '1' | '2' | '3' | '4'
  const [runNotes, setRunNotes] = useState('');

  // Run state
  const [running, setRunning] = useState(false);
  const [asyncStatus, setAsyncStatus] = useState(null);
  const [runError, setRunError] = useState(null);
  const [latestRun, setLatestRun] = useState(null);   // the most-recent triggered run

  // History
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Expanded run detail
  const [detailRun, setDetailRun] = useState(null);
  const [detailGroups, setDetailGroups] = useState([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [expandedGroup, setExpandedGroup] = useState(null);

  // Student stats (for the header banner)
  const [stats, setStats] = useState({ totalStudents: 0, twoSharing: 0, threeSharing: 0 });

  // ── Fetch strategies + stats on mount ────────────────────────────────────
  useEffect(() => {
    fetchStrategies();
    fetchStats();
    fetchHistory();
  }, []);

  const fetchStrategies = async () => {
    try {
      const res = await apiFetch(`${ALGORITHM_API_BASE_URL}${API_ENDPOINTS.ALGO_STRATEGIES}`);
      if (!res.ok) return;
      const data = await res.json();
      setStrategies(data.strategies || []);
      setSelectedStrategy(data.default || 'preference_queue_louvain');
    } catch {
      setSelectedStrategy('preference_queue_louvain');
    }
  };

  const fetchStats = async () => {
    try {
      const res = await apiFetch(`${API_BASE_URL}${API_ENDPOINTS.ADMIN_STATS}`);
      if (!res.ok) return;
      const data = await res.json();
      setStats({
        totalStudents: data.totalStudents || 0,
        twoSharing: data.twoSharing || 0,
        threeSharing: data.threeSharing || 0,
      });
    } catch { /* ignore */ }
  };

  const fetchHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const res = await apiFetch(`${ALGORITHM_API_BASE_URL}${API_ENDPOINTS.ALGO_RUNS}`);
      if (!res.ok) throw new Error('Engine not reachable');
      const data = await res.json();
      setHistory(data);
    } catch {
      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  // ── Trigger allocation run via RabbitMQ ────────────────────────────────────
  const handleRunAllocation = async () => {
    setRunning(true);
    setRunError(null);
    setLatestRun(null);
    setAsyncStatus({
      status: 'ENQUEUING',
      message: 'Submitting allocation job to Allocation Service via RabbitMQ…',
    });

    const reqPayload = {
      strategy: selectedStrategy,
      runBy: 'admin',
      notes: runNotes.trim() || null,
      year: selectedYear === 'ALL' ? null : parseInt(selectedYear, 10),
    };

    try {
      // 1. Dispatch async task to Allocation Service via RabbitMQ
      let triggeredJobId = null;
      let usedAsync = false;

      try {
        const res = await apiFetch(`${ALLOCATION_SERVICE_URL}${API_ENDPOINTS.ALLOCATION_TRIGGER}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(reqPayload),
        });

        if (res.ok) {
          const triggerData = await res.json();
          triggeredJobId = triggerData.jobId;
          usedAsync = true;
          setAsyncStatus({
            jobId: triggeredJobId,
            status: 'PROCESSING',
            message: 'Task enqueued in RabbitMQ! Background worker processing allocation…',
          });
        }
      } catch (err) {
        console.warn('Async trigger via RabbitMQ failed, falling back to direct engine run:', err);
      }

      if (usedAsync) {
        // Poll for newly created run created by the background worker
        let matchedRun = null;
        let attempts = 0;
        while (attempts < 20) {
          await new Promise(r => setTimeout(r, 1000));
          const runsRes = await apiFetch(`${ALGORITHM_API_BASE_URL}${API_ENDPOINTS.ALGO_RUNS}`);
          if (runsRes.ok) {
            const runs = await runsRes.json();
            if (runs && runs.length > 0) {
              const candidate = runs.find(r => r.notes?.includes(triggeredJobId)) || runs[0];
              if (candidate) {
                matchedRun = candidate;
                break;
              }
            }
          }
          attempts++;
        }

        if (matchedRun) {
          const detailRes = await apiFetch(`${ALGORITHM_API_BASE_URL}${API_ENDPOINTS.ALGO_RUN_BY_ID(matchedRun.id)}`);
          if (detailRes.ok) {
            const detail = await detailRes.json();
            setLatestRun(detail);
          } else {
            setLatestRun(matchedRun);
          }
        }
        setAsyncStatus({
          jobId: triggeredJobId,
          status: 'COMPLETED',
          message: 'Allocation completed successfully via RabbitMQ background worker.',
        });
      } else {
        // Direct synchronous fallback
        const res = await apiFetch(`${ALGORITHM_API_BASE_URL}${API_ENDPOINTS.ALGO_RUN}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            strategy: selectedStrategy,
            run_by: 'admin',
            notes: runNotes.trim() || null,
            year: selectedYear === 'ALL' ? null : parseInt(selectedYear, 10),
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || 'Allocation run failed');
        setLatestRun(data);
      }

      await fetchHistory(); // refresh history list
    } catch (e) {
      setRunError(e.message);
    } finally {
      setRunning(false);
    }
  };

  // ── Approve / Reject ───────────────────────────────────────────────────────
  const handleApprove = async (runId) => {
    try {
      const res = await apiFetch(`${ALGORITHM_API_BASE_URL}${API_ENDPOINTS.ALGO_APPROVE(runId)}`, { method: 'POST' });
      if (!res.ok) throw new Error('Failed to approve');
      await fetchHistory();
      if (detailRun?.id === runId) fetchDetail(runId);
      if (latestRun?.id === runId) setLatestRun(prev => ({ ...prev, status: 'APPROVED' }));
    } catch (e) { alert(e.message); }
  };

  const handleReject = async (runId) => {
    if (!confirm('Reject this allocation run? Admin can trigger a new one instead.')) return;
    try {
      const res = await apiFetch(`${ALGORITHM_API_BASE_URL}${API_ENDPOINTS.ALGO_REJECT(runId)}`, { method: 'POST' });
      if (!res.ok) throw new Error('Failed to reject');
      await fetchHistory();
      if (detailRun?.id === runId) fetchDetail(runId);
      if (latestRun?.id === runId) setLatestRun(prev => ({ ...prev, status: 'REJECTED' }));
    } catch (e) { alert(e.message); }
  };

  // ── Fetch detail for a run ─────────────────────────────────────────────────
  const fetchDetail = async (runId) => {
    setDetailLoading(true);
    setExpandedGroup(null);
    try {
      const res = await apiFetch(`${ALGORITHM_API_BASE_URL}${API_ENDPOINTS.ALGO_RUN_BY_ID(runId)}`);
      if (!res.ok) throw new Error('Failed to fetch run details');
      const data = await res.json();
      setDetailRun(data);
      setDetailGroups((data.groups || []).filter(g => g.group_size > 0));  // exclude unallocated sentinel
    } catch (e) { alert(e.message); }
    finally { setDetailLoading(false); }
  };

  const openDetail = (run) => {
    setDetailRun(run);
    fetchDetail(run.id);
  };

  const closeDetail = () => {
    setDetailRun(null);
    setDetailGroups([]);
    setExpandedGroup(null);
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">

        {/* ── Page header ─────────────────────────────────────────────────── */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Room Allocation</h1>
            <p className="text-sm text-gray-400 mt-0.5">Algorithm-powered roommate grouping and room assignment</p>
          </div>
          <button
            onClick={() => { fetchHistory(); fetchStats(); }}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <RefreshIcon className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {/* ── Tabs ───────────────────────────────────────────────────────── */}
        <div className="flex gap-1 mb-6 bg-gray-100 rounded-xl p-1 w-fit">
          {[
            { key: 'run',     label: 'Run Allocation' },
            { key: 'history', label: `History (${history.length})` },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-5 py-2 text-sm font-medium rounded-lg transition-all ${
                tab === t.key
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ════════════════════════════════════════════════════════════════
            TAB: RUN ALLOCATION
        ════════════════════════════════════════════════════════════════ */}
        {tab === 'run' && (
          <div className="space-y-5">

            {/* Stats banner */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Students with Submitted Preferences', value: stats.totalStudents, color: '#3b82f6' },
                { label: '2-Sharing Preference', value: stats.twoSharing, color: '#10b981' },
                { label: '3-Sharing Preference', value: stats.threeSharing, color: '#8b5cf6' },
              ].map(s => (
                <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-4">
                  <p className="text-xs text-gray-500 mb-1">{s.label}</p>
                  <p className="text-3xl font-bold" style={{ color: s.color }}>{s.value}</p>
                </div>
              ))}
            </div>

            {/* Strategy + trigger card */}
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #2d5016, #4a7c2c)' }}>
                  <CogIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-lg font-bold text-gray-900">Start Allocation Run</h2>
                    {/* <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      RabbitMQ Async Worker Active
                    </span> */}
                  </div>
                  {/* <p className="text-sm text-gray-500 mt-0.5">
                    Tasks are dispatched via <strong>RabbitMQ</strong> to the background worker and processed asynchronously by the Algorithm Engine.
                  </p> */}
                </div>
              </div>

              {/* Target Year selector */}
              <div className="mb-5">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold text-gray-700">Target Student Year</label>
                  <span className="text-xs text-gray-400">Filter students considered for room allocation</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  {[
                    { id: 'ALL', label: 'All Years', desc: 'Any submitted student' },
                    { id: '1', label: '1st Year', desc: 'Batch 2024' },
                    { id: '2', label: '2nd Year', desc: 'Batch 2023' },
                    { id: '3', label: '3rd Year', desc: 'Batch 2022' },
                    { id: '4', label: '4th Year', desc: 'Batch 2021' },
                  ].map(y => {
                    const isSelected = selectedYear === y.id;
                    return (
                      <button
                        key={y.id}
                        type="button"
                        onClick={() => setSelectedYear(y.id)}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'border-green-600 bg-green-50/70 ring-2 ring-green-600/20 shadow-sm'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <p className={`text-sm font-bold ${isSelected ? 'text-green-800' : 'text-gray-800'}`}>
                            {y.label}
                          </p>
                          {isSelected && (
                            <span className="w-2 h-2 rounded-full bg-green-600"></span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">{y.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Notes */}
              <div className="mb-5">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Notes (optional)</label>
                <textarea
                  value={runNotes}
                  onChange={e => setRunNotes(e.target.value)}
                  placeholder="e.g. Academic year 2025-26, Batch A"
                  rows={2}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300 resize-none"
                />
              </div>

              {/* Error */}
              {runError && (
                <div className="mb-4 flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  <XCircleIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>{runError}</span>
                </div>
              )}

              {/* Run button */}
              <button
                id="btn-run-allocation"
                onClick={handleRunAllocation}
                disabled={running}
                className="flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white rounded-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                style={{ background: 'linear-gradient(135deg, #2d5016, #4a7c2c)' }}
              >
                {running ? <CogIcon className="w-5 h-5 text-white" spin /> : <PlayIcon className="w-5 h-5" />}
                {running ? (asyncStatus?.status === 'ENQUEUING' ? 'Enqueuing to RabbitMQ…' : 'Worker Computing…') : 'Run Allocation'}
              </button>

              {/* RabbitMQ Async Status Banner */}
              {running && asyncStatus && (
                <div className="mt-4 p-4 rounded-xl bg-emerald-50/80 border border-emerald-200/80 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700 flex-shrink-0">
                    <CogIcon className="w-5 h-5" spin />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-emerald-950">
                        {asyncStatus.status === 'ENQUEUING' ? 'Submitting to RabbitMQ…' : 'RabbitMQ Background Processing'}
                      </p>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-200/60 text-emerald-800">
                        ASYNC
                      </span>
                    </div>
                    <p className="text-xs text-emerald-700 mt-0.5">
                      {asyncStatus.message}
                      {asyncStatus.jobId && <span className="font-mono ml-1.5 opacity-75">(Job ID: {asyncStatus.jobId.slice(0, 8)}…)</span>}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Result card — shown after a successful run */}
            {latestRun && !running && (
              <div className={`bg-white rounded-xl border p-6 ${
                latestRun.status === 'APPROVED' ? 'border-emerald-200' : 'border-amber-200'
              }`}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <CheckCircleIcon className="w-5 h-5 text-emerald-600" />
                      <h3 className="text-base font-bold text-gray-900">Run Completed</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${statusBadge(latestRun.status)}`}>
                        {latestRun.status}
                      </span>
                      <span className="text-xs px-2.5 py-0.5 rounded-full border border-blue-200 bg-blue-50 text-blue-700 font-medium">
                        {fmtYear(latestRun.year)}
                      </span>
                      {/* <span className="text-xs px-2.5 py-0.5 rounded-full border border-purple-200 bg-purple-50 text-purple-700 font-medium flex items-center gap-1">
                        RabbitMQ Async
                      </span> */}
                    </div>
                    <p className="text-xs text-gray-500">
                      {fmt(latestRun.created_at)} · Strategy: <strong>{latestRun.strategy}</strong> · Target: <strong>{fmtYear(latestRun.year)}</strong>
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openDetail(latestRun)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      <EyeIcon className="w-3.5 h-3.5" /> View Groups
                    </button>
                    {latestRun.status === 'DRAFT' && (
                      <>
                        <button
                          onClick={() => handleApprove(latestRun.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white rounded-lg"
                          style={{ background: 'linear-gradient(135deg, #2d5016, #4a7c2c)' }}
                        >
                          <CheckCircleIcon className="w-3.5 h-3.5" /> Approve
                        </button>
                        <button
                          onClick={() => handleReject(latestRun.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-600 border border-red-200 rounded-lg hover:bg-red-50"
                        >
                          <XCircleIcon className="w-3.5 h-3.5" /> Reject
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: 'Total Students', value: latestRun.total_students },
                    { label: 'Allocated', value: latestRun.allocated_count, good: true },
                    { label: 'Unallocated', value: latestRun.unallocated_count, warn: latestRun.unallocated_count > 0 },
                    { label: 'Groups Formed', value: latestRun.total_groups },
                  ].map(m => (
                    <div key={m.label} className="bg-gray-50 rounded-lg p-3 text-center">
                      <p className="text-xs text-gray-500 mb-1">{m.label}</p>
                      <p className={`text-2xl font-bold ${
                        m.good ? 'text-emerald-600' : m.warn ? 'text-amber-600' : 'text-gray-900'
                      }`}>{m.value}</p>
                    </div>
                  ))}
                </div>

                {/* Avg score bar */}
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                    <span>Avg Compatibility Score</span>
                    <span className="font-semibold text-gray-800">
                      {Math.min(latestRun.avg_compatibility_score, 100).toFixed(1)} / 100
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5">
                    <div
                      className="h-2.5 rounded-full transition-all duration-700"
                      style={{
                        width: `${Math.min(latestRun.avg_compatibility_score, 100)}%`,
                        background: getScoreBarColor(latestRun.avg_compatibility_score),
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════
            TAB: HISTORY
        ════════════════════════════════════════════════════════════════ */}
        {tab === 'history' && (
          <div className="space-y-4">
            {historyLoading ? (
              <div className="flex items-center justify-center py-16">
                <CogIcon className="w-8 h-8 text-gray-300" spin />
              </div>
            ) : history.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-100 py-16 text-center">
                <ClockIcon className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">No allocation runs yet</p>
                <p className="text-sm text-gray-400 mt-1">Switch to "Run Allocation" to trigger the first one.</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      {['Run ID', 'Year', 'Strategy', 'Date', 'Students', 'Groups', 'Avg Score', 'Status', 'Actions'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {history.map(run => (
                      <tr key={run.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <span className="text-xs font-mono text-gray-500">{run.id.slice(0, 8)}…</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-block text-xs px-2.5 py-0.5 rounded-full font-medium bg-blue-50 text-blue-700 border border-blue-200">
                            {fmtYear(run.year)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-gray-700 capitalize">{run.strategy.replace(/_/g, ' ')}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-gray-600">{fmt(run.created_at)}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm font-medium text-gray-800">{run.allocated_count}/{run.total_students}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-gray-700">{run.total_groups}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <div className="w-16 h-1.5 bg-gray-100 rounded-full">
                              <div
                                className="h-1.5 rounded-full"
                                style={{
                                  width: `${Math.min(run.avg_compatibility_score, 100)}%`,
                                  background: getScoreBarColor(run.avg_compatibility_score),
                                }}
                              />
                            </div>
                            <span className="text-xs text-gray-600">{run.avg_compatibility_score.toFixed(1)}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${statusBadge(run.status)}`}>
                            {run.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => openDetail(run)}
                              className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                              title="View Groups"
                            >
                              <EyeIcon className="w-4 h-4" />
                            </button>
                            {run.status === 'DRAFT' && (
                              <>
                                <button
                                  onClick={() => handleApprove(run.id)}
                                  className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50"
                                  title="Approve"
                                >
                                  <CheckCircleIcon className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleReject(run.id)}
                                  className="p-1.5 rounded-lg text-red-500 hover:bg-red-50"
                                  title="Reject"
                                >
                                  <XCircleIcon className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Detail Modal ─────────────────────────────────────────────────────── */}
      {detailRun && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-10 pb-6 px-4 overflow-y-auto"
          style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl">

            {/* Modal header */}
            <div className="flex items-start justify-between px-6 py-5 border-b border-gray-100">
              <div>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h2 className="text-lg font-bold text-gray-900">Allocation Groups</h2>
                  <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${statusBadge(detailRun.status)}`}>
                    {detailRun.status}
                  </span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full border border-blue-200 bg-blue-50 text-blue-700 font-medium">
                    {fmtYear(detailRun.year)}
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  Strategy: <strong>{(detailRun.strategy || '').replace(/_/g, ' ')}</strong>
                  &ensp;·&ensp;Target: <strong>{fmtYear(detailRun.year)}</strong>
                  &ensp;·&ensp;{fmt(detailRun.created_at)}
                  &ensp;·&ensp;Run ID: <span className="font-mono">{(detailRun.id || '').slice(0, 8)}…</span>
                </p>
              </div>
              <div className="flex items-center gap-2">
                {detailRun.status === 'DRAFT' && (
                  <>
                    <button
                      onClick={() => handleApprove(detailRun.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-white rounded-lg"
                      style={{ background: 'linear-gradient(135deg, #2d5016, #4a7c2c)' }}
                    >
                      <CheckCircleIcon className="w-4 h-4" /> Approve
                    </button>
                    <button
                      onClick={() => handleReject(detailRun.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-red-600 border border-red-200 rounded-lg hover:bg-red-50"
                    >
                      <XCircleIcon className="w-4 h-4" /> Reject
                    </button>
                  </>
                )}
                <button
                  onClick={closeDetail}
                  className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Summary row */}
            <div className="grid grid-cols-4 gap-px bg-gray-100 border-b border-gray-100">
              {[
                { label: 'Total Groups', value: detailRun.total_groups },
                { label: 'Allocated', value: detailRun.allocated_count },
                { label: 'Unallocated', value: detailRun.unallocated_count },
                { label: 'Avg Score', value: `${Math.min(detailRun.avg_compatibility_score || 0, 100).toFixed(1)}` },
              ].map(m => (
                <div key={m.label} className="bg-white px-5 py-3 text-center">
                  <p className="text-xs text-gray-500">{m.label}</p>
                  <p className="text-xl font-bold text-gray-800">{m.value}</p>
                </div>
              ))}
            </div>

            {/* Groups list */}
            <div className="p-6 max-h-[60vh] overflow-y-auto space-y-3">
              {detailLoading ? (
                <div className="flex items-center justify-center py-12">
                  <CogIcon className="w-7 h-7 text-gray-300" spin />
                </div>
              ) : detailGroups.length === 0 ? (
                <p className="text-center text-gray-400 py-10">No groups found in this run.</p>
              ) : (
                detailGroups.map((group, idx) => {
                  const isExpanded = expandedGroup === group.id;
                  const score = group.compatibility_score;
                  return (
                    <div key={group.id}
                      className={`border rounded-xl overflow-hidden transition-all ${
                        group.has_explicit_preference ? 'border-amber-200' : 'border-gray-100'
                      }`}>
                      {/* Group header */}
                      <button
                        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
                        onClick={() => setExpandedGroup(isExpanded ? null : group.id)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                            style={{ background: 'linear-gradient(135deg, #2d5016, #4a7c2c)' }}>
                            {idx + 1}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-semibold text-gray-800">
                                {group.group_size}-Sharing
                                {group.room_number ? ` · Room ${group.room_number}` : ' · No room assigned'}
                              </p>
                              {group.has_explicit_preference && (
                                <span className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                                  <StarIcon className="w-3 h-3" /> Explicit Match
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {group.student_names.join('  ·  ') || group.student_ids.join(', ')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="text-xs text-gray-400">Compatibility</p>
                            <p className="text-sm font-bold" style={{ color: getScoreBarColor(score) }}>
                              {Math.min(score, 100).toFixed(1)}<span className="text-xs font-normal text-gray-400">/100</span>
                            </p>
                          </div>
                          <ChevronDownIcon className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                        </div>
                      </button>

                      {/* Expanded group detail */}
                      {isExpanded && (
                        <div className="px-4 py-4 border-t border-gray-100">
                          {/* Score bar */}
                          <div className="mb-4">
                            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                              <span>Group Compatibility Score</span>
                              <span className={`px-2 py-0.5 rounded-full border text-xs font-medium ${getScoreColor(score)}`}>
                                {Math.min(score, 100).toFixed(1)} / 100
                              </span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2">
                              <div
                                className="h-2 rounded-full transition-all"
                                style={{ width: `${Math.min(score, 100)}%`, background: getScoreBarColor(score) }}
                              />
                            </div>
                          </div>

                          {/* Room info */}
                          <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                            <div className="bg-gray-50 rounded-lg p-3">
                              <p className="text-xs text-gray-400 mb-0.5">Room</p>
                              <p className="font-semibold text-gray-800">{group.room_number || '—'}</p>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-3">
                              <p className="text-xs text-gray-400 mb-0.5">Notes</p>
                              <p className="text-gray-600 text-xs">{group.notes || '—'}</p>
                            </div>
                          </div>

                          {/* Students */}
                          <div className="space-y-2">
                            {group.student_names.map((name, i) => (
                              <div key={i} className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-lg">
                                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                                  style={{ background: 'linear-gradient(135deg, #2d5016, #4a7c2c)' }}>
                                  {name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-800">{name}</p>
                                  <p className="text-xs text-gray-400">ID: {group.student_ids[i]}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
