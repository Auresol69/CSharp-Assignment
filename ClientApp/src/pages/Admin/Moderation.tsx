import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Ban, Loader2, ShieldAlert, Undo2, Users } from "lucide-react";
import { getReportedPosts, getReportsByPost, removeFromBlacklist } from "../../services/api/moderationApi";
import type { IPostReportDetail, IReportedPostSummary } from "../../types/Moderation";
import { useTheme } from "../../context/ThemeContext";

const Moderation = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [summaries, setSummaries] = useState<IReportedPostSummary[]>([]);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [reports, setReports] = useState<IPostReportDetail[]>([]);
  const [loadingSummaries, setLoadingSummaries] = useState(true);
  const [loadingReports, setLoadingReports] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSummaries = async () => {
      try {
        setError(null);
        const data = await getReportedPosts();
        setSummaries(data);
        setSelectedPostId((current) => current ?? data[0]?.postId ?? null);
      } catch {
        setError("Không tải được danh sách bài bị báo cáo. Hãy kiểm tra quyền Admin và token đăng nhập.");
      } finally {
        setLoadingSummaries(false);
      }
    };

    void loadSummaries();
  }, []);

  useEffect(() => {
    if (!selectedPostId) {
      setReports([]);
      return;
    }

    const loadReports = async () => {
      try {
        setLoadingReports(true);
        setError(null);
        const data = await getReportsByPost(selectedPostId);
        setReports(data);
      } catch {
        setError("Không tải được chi tiết báo cáo của bài viết này.");
      } finally {
        setLoadingReports(false);
      }
    };

    void loadReports();
  }, [selectedPostId]);

  const selectedSummary = useMemo(
    () => summaries.find((item) => item.postId === selectedPostId) ?? null,
    [summaries, selectedPostId],
  );

  const totalReports = summaries.reduce((sum, item) => sum + item.reportCount, 0);
  const blacklistedCount = summaries.filter((item) => item.isBlacklisted).length;

  const handleUnblacklist = async (postId: string) => {
    try {
      setActionLoading(true);
      setError(null);
      await removeFromBlacklist(postId);
      setSummaries((current) => current.map((item) => item.postId === postId ? { ...item, isBlacklisted: false } : item));
    } catch {
      setError("Không thể gỡ blacklist lúc này.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className={`min-h-screen rounded-3xl border overflow-hidden shadow-2xl ${isDark ? "bg-gray-950 border-gray-800" : "bg-white border-slate-200"}`}>
      <div className={`px-6 py-6 border-b ${isDark ? "bg-gray-900/80 border-gray-800" : "bg-slate-50 border-slate-200"}`}>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.28em] font-semibold text-orange-500 mb-3">
              <ShieldAlert className="w-4 h-4" /> Moderation
            </div>
            <h1 className="text-3xl font-black tracking-tight">Báo cáo nội dung theo bài đăng</h1>
            <p className={`mt-2 text-sm max-w-2xl ${isDark ? "text-gray-400" : "text-slate-600"}`}>
              Theo dõi các bài viết bị người dùng báo cáo, xem danh sách lý do và gỡ blacklist thủ công khi cần.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 w-full sm:w-auto">
            <div className={`rounded-2xl px-4 py-3 border ${isDark ? "bg-gray-900 border-gray-800" : "bg-white border-slate-200"}`}>
              <div className="text-xs uppercase tracking-[0.2em] opacity-60">Reports</div>
              <div className="mt-1 text-2xl font-black">{totalReports}</div>
            </div>
            <div className={`rounded-2xl px-4 py-3 border ${isDark ? "bg-gray-900 border-gray-800" : "bg-white border-slate-200"}`}>
              <div className="text-xs uppercase tracking-[0.2em] opacity-60">Blacklisted</div>
              <div className="mt-1 text-2xl font-black">{blacklistedCount}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid xl:grid-cols-[360px_1fr] gap-0 min-h-[calc(100vh-11rem)]">
        <aside className={`border-r ${isDark ? "border-gray-800 bg-gray-950" : "border-slate-200 bg-slate-50"}`}>
          <div className="p-4 border-b border-inherit">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Users className="w-4 h-4" /> Danh sách bài bị báo cáo
            </div>
          </div>

          <div className="p-3 space-y-3 max-h-[calc(100vh-15rem)] overflow-y-auto">
            {loadingSummaries ? (
              <div className="flex items-center justify-center py-12 text-sm opacity-70 gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Đang tải...
              </div>
            ) : summaries.length === 0 ? (
              <div className="py-12 text-center text-sm opacity-70">
                Chưa có bài viết nào được báo cáo.
              </div>
            ) : summaries.map((item) => (
              <button
                key={item.postId}
                type="button"
                onClick={() => setSelectedPostId(item.postId)}
                className={`w-full text-left rounded-2xl border p-4 transition-all ${selectedPostId === item.postId
                  ? "border-orange-500 bg-orange-500/10 shadow-lg shadow-orange-500/10"
                  : isDark
                    ? "border-gray-800 bg-gray-900 hover:bg-gray-900/80"
                    : "border-slate-200 bg-white hover:bg-slate-50"}`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-11 h-11 rounded-2xl shrink-0 flex items-center justify-center font-black ${item.isBlacklisted ? "bg-red-500/15 text-red-500" : "bg-orange-500/15 text-orange-500"}`}>
                    {item.reportCount}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold truncate">{item.authorName ?? "Unknown author"}</span>
                      {item.isBlacklisted && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-full bg-red-500/15 text-red-500">
                          <Ban className="w-3 h-3" /> Blacklisted
                        </span>
                      )}
                    </div>
                    <p className={`mt-1 text-sm line-clamp-3 ${isDark ? "text-gray-400" : "text-slate-600"}`}>
                      {item.content || "Không có nội dung"}
                    </p>
                    <div className="mt-3 text-xs uppercase tracking-[0.18em] opacity-60">Post ID: {item.postId}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </aside>

        <section className="p-4 sm:p-6">
          {error && (
            <div className="mb-4 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {!selectedSummary ? (
            <div className={`rounded-3xl border p-8 text-center ${isDark ? "border-gray-800 bg-gray-900" : "border-slate-200 bg-white"}`}>
              Chọn một bài viết bên trái để xem danh sách báo cáo.
            </div>
          ) : (
            <div className="space-y-4">
              <div className={`rounded-3xl border p-5 ${isDark ? "border-gray-800 bg-gray-900" : "border-slate-200 bg-white"}`}>
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <div className="text-xs uppercase tracking-[0.2em] opacity-60">Selected post</div>
                    <h2 className="mt-2 text-2xl font-black">{selectedSummary.authorName ?? "Unknown author"}</h2>
                    <p className={`mt-2 ${isDark ? "text-gray-400" : "text-slate-600"}`}>{selectedSummary.content || "Không có nội dung"}</p>
                  </div>

                  <div className="flex flex-col items-end gap-3">
                    <div className="text-right">
                      <div className="text-xs uppercase tracking-[0.2em] opacity-60">Reports</div>
                      <div className="text-3xl font-black">{selectedSummary.reportCount}</div>
                    </div>
                    {selectedSummary.isBlacklisted ? (
                      <button
                        type="button"
                        disabled={actionLoading}
                        onClick={() => handleUnblacklist(selectedSummary.postId)}
                        className="inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold bg-emerald-500 text-white hover:bg-emerald-400 disabled:opacity-60"
                      >
                        {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Undo2 className="w-4 h-4" />}
                        Gỡ blacklist
                      </button>
                    ) : (
                      <div className="inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold bg-orange-500/10 text-orange-600">
                        <AlertTriangle className="w-4 h-4" /> Chưa blacklist
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className={`rounded-3xl border p-5 ${isDark ? "border-gray-800 bg-gray-900" : "border-slate-200 bg-white"}`}>
                <div className="flex items-center justify-between gap-3 mb-4">
                  <h3 className="text-lg font-bold">Danh sách báo cáo</h3>
                  {loadingReports && <Loader2 className="w-4 h-4 animate-spin opacity-60" />}
                </div>

                <div className="space-y-3">
                  {reports.length === 0 ? (
                    <div className="py-8 text-center text-sm opacity-70">Chưa có báo cáo cho bài viết này.</div>
                  ) : reports.map((report) => (
                    <div key={report.reportId} className={`rounded-2xl border p-4 ${isDark ? "border-gray-800 bg-gray-950" : "border-slate-200 bg-slate-50"}`}>
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-200 shrink-0">
                          {report.reporterAvatarUrl ? (
                            <img src={report.reporterAvatarUrl} alt={report.reporterName ?? "Reporter"} className="w-full h-full object-cover" />
                          ) : null}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-3 flex-wrap">
                            <div className="font-semibold">{report.reporterName ?? "Unknown reporter"}</div>
                            <div className="text-xs uppercase tracking-[0.18em] opacity-50">{report.reportId}</div>
                          </div>
                          <p className={`mt-2 text-sm ${isDark ? "text-gray-300" : "text-slate-700"}`}>
                            {report.reason || "Không có lý do cụ thể"}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Moderation;
