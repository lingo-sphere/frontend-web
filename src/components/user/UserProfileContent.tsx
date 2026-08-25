import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SectionHeading } from "@/components/dashboard/SectionHeading";
import { Icon } from "@/components/icons/icon-map";
import { useAuthStore } from "@/store/auth-store";
import { userService } from "@/services/user.service";
import type {
  User,
  EditProfileForm,
  Achievement,
  Activity,
  Badge,
} from "@/types/user";
import type { GamificationProfile, LeaderboardEntry } from "@/types/api.types";
import {
  currentUser as defaultUser,
  userAchievements,
  userActivities,
  leaderboardData as defaultLeaderboard,
  getUserRank,
  getXPForNextLevel,
} from "@/data/user-data";

function Avatar({ src, size = "md", editable = false, onClick }: {
  src?: string; size?: "sm" | "md" | "lg" | "xl"; editable?: boolean; onClick?: () => void;
}) {
  const sizeClasses = { sm: "w-8 h-8", md: "w-12 h-12", lg: "w-20 h-20", xl: "w-28 h-28" };
  return (
    <div className="relative group">
      {src ? (
        <img src={src} alt="Avatar" className={`${sizeClasses[size]} rounded-full object-cover ring-2 ring-surface-subtle`} />
      ) : (
        <div className={`${sizeClasses[size]} rounded-full bg-primary-20 flex items-center justify-center`}>
          <Icon name="user" size={size === "xl" ? 40 : size === "lg" ? 24 : 16} />
        </div>
      )}
      {editable && (
        <button onClick={onClick} className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <Icon name="camera" size={20} className="text-white" />
        </button>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, subtext, color = "primary" }: {
  icon: string; label: string; value: string | number; subtext?: string; color?: "primary" | "success" | "warning" | "error" | "info";
}) {
  const { i18n } = useTranslation()
  const isVietnamese = i18n.language === 'vi'
  const colorClasses = { primary: "bg-primary-10 text-primary", success: "bg-success-10 text-success", warning: "bg-warning-10 text-warning", error: "bg-error-10 text-error", info: "bg-info-10 text-info" };
  return (
    <div className="bg-surface-subtle rounded-xl p-4">
      <div className={`w-10 h-10 ${colorClasses[color]} rounded-lg flex items-center justify-center mb-3`}><Icon name={icon} size={20} /></div>
      <div className="text-2xl font-bold text-text-primary">{value}</div>
      <div className="text-sm text-text-secondary">{label}</div>
      {subtext && <div className="text-xs text-text-tertiary mt-1">{subtext}</div>}
    </div>
  );
}

function XPProgress({ currentXP }: { currentXP: number }) {
  const { i18n } = useTranslation()
  const isVietnamese = i18n.language === 'vi'
  const { current, required, progress } = getXPForNextLevel(currentXP);
  return (
    <div className="bg-surface-subtle rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-text-secondary">{isVietnamese ? 'Cấp độ tiếp theo' : 'Next level'}</span>
        <span className="text-sm text-text-tertiary">{current}/{required} XP</span>
      </div>
      <div className="h-2 bg-surface rounded-full overflow-hidden">
        <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}

function AchievementCard({ achievement }: { achievement: Achievement }) {
  const { i18n } = useTranslation()
  const isVietnamese = i18n.language === 'vi'
  return (
    <div className={`rounded-xl p-4 ${achievement.isCompleted ? "bg-primary-10" : "bg-surface-subtle"}`}>
      <div className="flex items-center gap-3">
        <div className={`text-3xl ${achievement.isCompleted ? "" : "grayscale opacity-50"}`}>{achievement.icon}</div>
        <div className="flex-1">
          <div className="font-medium text-text-primary">{achievement.title}</div>
          <div className="text-xs text-text-secondary">{achievement.description}</div>
          {!achievement.isCompleted && (
            <div className="mt-2">
              <div className="h-1.5 bg-surface rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }} />
              </div>
              <div className="text-xs text-text-tertiary mt-1">{achievement.progress}/{achievement.maxProgress}</div>
            </div>
          )}
        </div>
        {achievement.isCompleted && (
          <div className="w-6 h-6 bg-success rounded-full flex items-center justify-center"><Icon name="check" size={14} className="text-white" /></div>
        )}
      </div>
    </div>
  );
}

function ActivityItem({ activity }: { activity: Activity }) {
  const { i18n } = useTranslation()
  const isVietnamese = i18n.language === 'vi'
  const typeIcons: Record<string, string> = { vocabulary: "book", listening: "headphones", speaking: "mic", exercise: "check-square", streak: "flame", achievement: "award" };
  const typeColors: Record<string, string> = { vocabulary: "bg-primary-10 text-primary", listening: "bg-info-10 text-info", speaking: "bg-warning-10 text-warning", exercise: "bg-success-10 text-success", streak: "bg-error-10 text-error", achievement: "bg-purple-10 text-purple" };
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 24) return `${hours} ${isVietnamese ? 'giờ trước' : 'hours ago'}`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} ${isVietnamese ? 'ngày trước' : 'days ago'}`;
    return date.toLocaleDateString(isVietnamese ? "vi-VN" : "en-US");
  };
  return (
    <div className="flex items-start gap-3 py-3 border-b border-surface-subtle last:border-0">
      <div className={`w-8 h-8 ${typeColors[activity.type]} rounded-lg flex items-center justify-center flex-shrink-0`}><Icon name={typeIcons[activity.type]} size={16} /></div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-text-primary text-sm">{activity.title}</div>
        <div className="text-xs text-text-secondary">{activity.description}</div>
        <div className="text-xs text-text-tertiary mt-1">{formatTime(activity.timestamp)}</div>
      </div>
      <div className="text-sm font-medium text-primary flex-shrink-0">+{activity.xpEarned} XP</div>
    </div>
  );
}

function EditProfileModal({ user, onClose, onSave }: { user: User; onClose: () => void; onSave: (data: EditProfileForm) => void }) {
  const { i18n } = useTranslation()
  const isVietnamese = i18n.language === 'vi'
  const [form, setForm] = useState<EditProfileForm>({ displayName: user.displayName, bio: user.bio || "", phone: user.phone || "", dateOfBirth: user.dateOfBirth || "", gender: user.gender || "", address: user.address || "", city: user.city || "", country: user.country || "" });
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">{isVietnamese ? 'Chỉnh sửa hồ sơ' : 'Edit Profile'}</h3>
            <button onClick={onClose} className="text-text-tertiary hover:text-text-primary"><Icon name="x" size={20} /></button>
          </div>
          <div className="flex justify-center mb-6"><Avatar src={user.avatar} size="xl" editable /></div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">{isVietnamese ? 'Tên hiển thị' : 'Display name'}</label>
              <Input value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value })} placeholder={isVietnamese ? 'Nhập tên hiển thị' : 'Enter display name'} />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">{isVietnamese ? 'Giới thiệu' : 'Bio'}</label>
              <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder={isVietnamese ? 'Viết vài dòng về bạn...' : 'Write a few lines about yourself...'} className="w-full h-24 px-3 py-2 border border-surface-subtle rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">{isVietnamese ? 'Số điện thoại' : 'Phone'}</label>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="0912345678" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">{isVietnamese ? 'Ngày sinh' : 'Date of birth'}</label>
                <Input type="date" value={form.dateOfBirth} onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">{isVietnamese ? 'Giới tính' : 'Gender'}</label>
              <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value as EditProfileForm["gender"] })} className="w-full px-3 py-2 border border-surface-subtle rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
                <option value="">{isVietnamese ? 'Chọn giới tính' : 'Select gender'}</option>
                <option value="male">{isVietnamese ? 'Nam' : 'Male'}</option>
                <option value="female">{isVietnamese ? 'Nữ' : 'Female'}</option>
                <option value="other">{isVietnamese ? 'Khác' : 'Other'}</option>
                <option value="prefer_not_to_say">{isVietnamese ? 'Không muốn tiết lộ' : 'Prefer not to say'}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">{isVietnamese ? 'Địa chỉ' : 'Address'}</label>
              <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="123 ABC Street" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">{isVietnamese ? 'Thành phố' : 'City'}</label>
                <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder={isVietnamese ? 'TP. Hồ Chí Minh' : 'Ho Chi Minh City'} />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">{isVietnamese ? 'Quốc gia' : 'Country'}</label>
                <Input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} placeholder={isVietnamese ? 'Việt Nam' : 'Vietnam'} />
              </div>
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <Button variant="outline" onClick={onClose} className="flex-1">{isVietnamese ? 'Hủy' : 'Cancel'}</Button>
            <Button onClick={() => onSave(form)} className="flex-1">{isVietnamese ? 'Lưu thay đổi' : 'Save changes'}</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ChangePasswordModal({ onClose }: { onClose: () => void }) {
  const { i18n } = useTranslation()
  const isVietnamese = i18n.language === 'vi'
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const handleSubmit = () => {
    if (form.newPassword !== form.confirmPassword) { setError(isVietnamese ? 'Mật khẩu mới không khớp' : 'New passwords do not match'); return; }
    if (form.newPassword.length < 6) { setError(isVietnamese ? 'Mật khẩu mới phải có ít nhất 6 ký tự' : 'New password must be at least 6 characters'); return; }
    onClose();
  };
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">{isVietnamese ? 'Đổi mật khẩu' : 'Change Password'}</h3>
            <button onClick={onClose} className="text-text-tertiary hover:text-text-primary"><Icon name="x" size={20} /></button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">{isVietnamese ? 'Mật khẩu hiện tại' : 'Current password'}</label>
              <Input type="password" value={form.currentPassword} onChange={(e) => setForm({ ...form, currentPassword: e.target.value })} placeholder={isVietnamese ? 'Nhập mật khẩu hiện tại' : 'Enter current password'} />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">{isVietnamese ? 'Mật khẩu mới' : 'New password'}</label>
              <Input type="password" value={form.newPassword} onChange={(e) => setForm({ ...form, newPassword: e.target.value })} placeholder={isVietnamese ? 'Nhập mật khẩu mới' : 'Enter new password'} />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">{isVietnamese ? 'Xác nhận mật khẩu mới' : 'Confirm new password'}</label>
              <Input type="password" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} placeholder={isVietnamese ? 'Nhập lại mật khẩu mới' : 'Confirm new password'} />
            </div>
            {error && <div className="text-sm text-error bg-error-10 px-3 py-2 rounded-lg">{error}</div>}
          </div>
          <div className="flex gap-3 mt-6">
            <Button variant="outline" onClick={onClose} className="flex-1">{isVietnamese ? 'Hủy' : 'Cancel'}</Button>
            <Button onClick={handleSubmit} className="flex-1">{isVietnamese ? 'Đổi mật khẩu' : 'Change Password'}</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function LeaderboardSection() {
  const { i18n } = useTranslation()
  const isVietnamese = i18n.language === 'vi'
  const currentRank = getUserRank(defaultUser.id);
  return (
    <div className="space-y-4">
      <div className="bg-primary-10 rounded-xl p-4 flex items-center gap-4">
        <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold text-lg">#{currentRank}</div>
        <div className="flex-1">
          <div className="font-medium text-text-primary">{isVietnamese ? 'Xếp hạng của bạn' : 'Your ranking'}</div>
          <div className="text-sm text-text-secondary">{isVietnamese ? 'Top' : 'Top'} {Math.round((1 - currentRank / defaultLeaderboard.length) * 100)}% {isVietnamese ? 'người học' : 'learners'}</div>
        </div>
      </div>
      {defaultLeaderboard.slice(0, 5).map((user: (typeof defaultLeaderboard)[0], index: number) => (
        <div key={user.userId} className={`bg-surface-subtle rounded-xl p-3 flex items-center gap-3 ${user.isCurrentUser ? "ring-2 ring-primary" : ""}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${index === 0 ? "bg-yellow text-yellow" : index === 1 ? "bg-gray-300 text-gray" : index === 2 ? "bg-amber-600 text-white" : "bg-surface text-text-tertiary"}`}>{index + 1}</div>
          <Avatar src={user.avatar} size="sm" />
          <div className="flex-1 min-w-0">
            <div className="font-medium text-text-primary truncate">{user.displayName}{user.isCurrentUser && <span className="text-primary ml-1">({isVietnamese ? 'Bạn' : 'You'})</span>}</div>
            <div className="text-xs text-text-tertiary">Level {user.level} • 🔥 {user.streak} {isVietnamese ? 'ngày' : 'days'}</div>
          </div>
          <div className="text-right"><div className="font-medium text-primary">{user.xp.toLocaleString()} XP</div></div>
        </div>
      ))}
    </div>
  );
}

export function UserProfileContent() {
  const { i18n } = useTranslation()
  const isVietnamese = i18n.language === 'vi'
  const { user } = useAuthStore()
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "achievements" | "activity" | "leaderboard">("overview");

  const activeUser = {
    ...defaultUser,
    displayName: user?.full_name || defaultUser.displayName,
    avatar: user?.avatar_url || defaultUser.avatar,
    email: user?.email || defaultUser.email,
  }

  const tabs = [
    { id: "overview", label: isVietnamese ? "Tổng quan" : "Overview", icon: "layout" },
    { id: "achievements", label: isVietnamese ? "Thành tựu" : "Achievements", icon: "award" },
    { id: "activity", label: isVietnamese ? "Hoạt động" : "Activity", icon: "activity" },
    { id: "leaderboard", label: isVietnamese ? "Bảng xếp hạng" : "Leaderboard", icon: "trophy" },
  ] as const;

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <SectionHeading eyebrow="" title={isVietnamese ? "Trang cá nhân" : "Profile"} description={isVietnamese ? "Quản lý thông tin và theo dõi tiến độ học tập" : "Manage your info and track learning progress"} />

      <Card className="mb-6 overflow-hidden">
        <div className="h-32 bg-linear-to-r from-primary to-primary-hover" />
        <CardContent className="px-8 pb-8 pt-4">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 -mt-14">
            <Avatar src={activeUser.avatar} size="xl" editable onClick={() => setShowEditModal(true)} />
            <div className="flex-1 text-center sm:text-left">
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <h2 className="text-xl font-bold text-text-primary">{activeUser.displayName}</h2>
                {activeUser.isVerified && <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center"><Icon name="check" size={12} className="text-white" /></div>}
              </div>
              <p className="text-sm text-text-secondary">@{activeUser.username}</p>
              <p className="text-sm text-text-tertiary mt-1 line-clamp-2">{activeUser.bio}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowEditModal(true)}><Icon name="edit" size={16} /><span className="ml-1 hidden sm:inline">{isVietnamese ? 'Chỉnh sửa' : 'Edit'}</span></Button>
              <Button variant="outline" onClick={() => setShowPasswordModal(true)}>{isVietnamese ? 'Đổi mật khẩu' : 'Change Password'}</Button>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
            <div className="bg-surface-subtle rounded-xl p-3 text-center"><div className="text-xl font-bold text-primary">{activeUser.stats.level}</div><div className="text-xs text-text-tertiary">{isVietnamese ? 'Cấp độ' : 'Level'}</div></div>
            <div className="bg-surface-subtle rounded-xl p-3 text-center"><div className="text-xl font-bold text-warning">{activeUser.stats.currentStreak}</div><div className="text-xs text-text-tertiary">Streak 🔥</div></div>
            <div className="bg-surface-subtle rounded-xl p-3 text-center"><div className="text-xl font-bold text-success">{activeUser.stats.averageAccuracy}%</div><div className="text-xs text-text-tertiary">{isVietnamese ? 'Độ chính xác' : 'Accuracy'}</div></div>
            <div className="bg-surface-subtle rounded-xl p-3 text-center"><div className="text-xl font-bold text-info">{activeUser.stats.totalVocabularyLearned}</div><div className="text-xs text-text-tertiary">{isVietnamese ? 'Từ vựng' : 'Vocabulary'}</div></div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-1 mb-6 bg-surface-subtle rounded-xl p-1 overflow-x-auto">
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${activeTab === tab.id ? "bg-white text-primary shadow-sm" : "text-text-secondary hover:text-text-primary"}`}>
            <Icon name={tab.icon} size={16} />{tab.label}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <h3 className="font-semibold text-text-primary">{isVietnamese ? 'Thống kê học tập' : 'Learning Statistics'}</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatCard icon="book" label={isVietnamese ? 'Bài học' : 'Exercises'} value={activeUser.stats.totalExercises} color="primary" />
              <StatCard icon="headphones" label={isVietnamese ? 'Bài nghe' : 'Listening'} value={activeUser.stats.totalListeningExercises} color="info" />
              <StatCard icon="clock" label={isVietnamese ? 'Giờ học' : 'Study hours'} value={Math.round(activeUser.stats.totalStudyTime / 60)} subtext={isVietnamese ? 'tổng cộng' : 'total'} color="success" />
              <StatCard icon="target" label={isVietnamese ? 'Đúng/Sai' : 'Correct/Wrong'} value={`${activeUser.stats.totalCorrectAnswers}/${activeUser.stats.totalWrongAnswers}`} color="warning" />
            </div>
            <XPProgress currentXP={activeUser.stats.totalXP} />
            <div className="grid grid-cols-2 gap-3">
              <StatCard icon="flame" label={isVietnamese ? 'Streak hiện tại' : 'Current streak'} value={`${activeUser.stats.currentStreak} ${isVietnamese ? 'ngày' : 'days'}`} color="error" />
              <StatCard icon="award" label={isVietnamese ? 'Badge đạt được' : 'Badges earned'} value={activeUser.stats.badges.length} color="warning" />
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-text-primary mb-4">{isVietnamese ? 'Huy hiệu của bạn' : 'Your Badges'}</h3>
            <div className="space-y-3">
              {activeUser.stats.badges.map((badge: Badge) => (
                <div key={badge.id} className="bg-surface-subtle rounded-xl p-4 flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${badge.tier === "gold" ? "bg-yellow-100 text-yellow" : badge.tier === "silver" ? "bg-gray-100 text-gray" : "bg-amber-100 text-amber-700"}`}><Icon name={badge.icon} size={20} /></div>
                  <div><div className="font-medium text-text-primary">{badge.name}</div><div className="text-xs text-text-tertiary">{badge.description}</div></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "achievements" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{userAchievements.map((achievement) => (<AchievementCard key={achievement.id} achievement={achievement} />))}</div>
      )}

      {activeTab === "activity" && (
        <Card><CardContent className="p-4"><h3 className="font-semibold text-text-primary mb-4">{isVietnamese ? 'Hoạt động gần đây' : 'Recent Activity'}</h3>
          <div>{userActivities.map((activity) => (<ActivityItem key={activity.id} activity={activity} />))}</div>
        </CardContent></Card>
      )}

      {activeTab === "leaderboard" && <LeaderboardSection />}

      {showEditModal && <EditProfileModal user={activeUser} onClose={() => setShowEditModal(false)} onSave={(data) => { setShowEditModal(false); }} />}
      {showPasswordModal && <ChangePasswordModal onClose={() => setShowPasswordModal(false)} />}
    </main>
  );
}
