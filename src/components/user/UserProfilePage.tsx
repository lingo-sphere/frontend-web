import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SectionHeading } from "@/components/dashboard/SectionHeading";
import { Icon } from "@/components/icons/icon-map";
import {
  currentUser,
  userAchievements,
  userActivities,
  leaderboardData,
  getUserRank,
  getXPForNextLevel,
} from "@/data/user-data";
import type {
  User,
  EditProfileForm,
  Achievement,
  Activity,
} from "@/types/user";

function Avatar({
  src,
  size = "md",
  editable = false,
  onClick,
}: {
  src?: string;
  size?: "sm" | "md" | "lg" | "xl";
  editable?: boolean;
  onClick?: () => void;
}) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-20 h-20",
    xl: "w-28 h-28",
  };

  return (
    <div className="relative group">
      {src ? (
        <img
          src={src}
          alt="Avatar"
          className={`${sizeClasses[size]} rounded-full object-cover ring-2 ring-surface-subtle`}
        />
      ) : (
        <div
          className={`${sizeClasses[size]} rounded-full bg-primary-20 flex items-center justify-center`}
        >
          <Icon
            name="user"
            size={size === "xl" ? 40 : size === "lg" ? 24 : 16}
          />
        </div>
      )}
      {editable && (
        <button
          onClick={onClick}
          className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Icon name="camera" size={20} className="text-white" />
        </button>
      )}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  subtext,
  color = "primary",
}: {
  icon: string;
  label: string;
  value: string | number;
  subtext?: string;
  color?: "primary" | "success" | "warning" | "error" | "info";
}) {
  const colorClasses = {
    primary: "bg-primary-10 text-primary",
    success: "bg-success-10 text-success",
    warning: "bg-warning-10 text-warning",
    error: "bg-error-10 text-error",
    info: "bg-info-10 text-info",
  };

  return (
    <div className="bg-surface-subtle rounded-xl p-4">
      <div
        className={`w-10 h-10 ${colorClasses[color]} rounded-lg flex items-center justify-center mb-3`}
      >
        <Icon name={icon} size={20} />
      </div>
      <div className="text-2xl font-bold text-text-primary">{value}</div>
      <div className="text-sm text-text-secondary">{label}</div>
      {subtext && (
        <div className="text-xs text-text-tertiary mt-1">{subtext}</div>
      )}
    </div>
  );
}

function XPProgress({ currentXP }: { currentXP: number }) {
  const { current, required, progress } = getXPForNextLevel(currentXP);

  return (
    <div className="bg-surface-subtle rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-text-secondary">
          Cấp độ tiếp theo
        </span>
        <span className="text-sm text-text-tertiary">
          {current}/{required} XP
        </span>
      </div>
      <div className="h-2 bg-surface rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

function AchievementCard({ achievement }: { achievement: Achievement }) {
  return (
    <div
      className={`rounded-xl p-4 ${
        achievement.isCompleted ? "bg-primary-10" : "bg-surface-subtle"
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`text-3xl ${
            achievement.isCompleted ? "" : "grayscale opacity-50"
          }`}
        >
          {achievement.icon}
        </div>
        <div className="flex-1">
          <div className="font-medium text-text-primary">
            {achievement.title}
          </div>
          <div className="text-xs text-text-secondary">
            {achievement.description}
          </div>
          {!achievement.isCompleted && (
            <div className="mt-2">
              <div className="h-1.5 bg-surface rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full"
                  style={{
                    width: `${
                      (achievement.progress / achievement.maxProgress) * 100
                    }%`,
                  }}
                />
              </div>
              <div className="text-xs text-text-tertiary mt-1">
                {achievement.progress}/{achievement.maxProgress}
              </div>
            </div>
          )}
        </div>
        {achievement.isCompleted && (
          <div className="w-6 h-6 bg-success rounded-full flex items-center justify-center">
            <Icon name="check" size={14} className="text-white" />
          </div>
        )}
      </div>
    </div>
  );
}

function ActivityItem({ activity }: { activity: Activity }) {
  const typeIcons: Record<string, string> = {
    vocabulary: "book",
    listening: "headphones",
    speaking: "mic",
    exercise: "check-square",
    streak: "flame",
    achievement: "award",
  };

  const typeColors: Record<string, string> = {
    vocabulary: "bg-primary-10 text-primary",
    listening: "bg-info-10 text-info",
    speaking: "bg-warning-10 text-warning",
    exercise: "bg-success-10 text-success",
    streak: "bg-error-10 text-error",
    achievement: "bg-purple-10 text-purple",
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 24) return `${hours} giờ trước`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} ngày trước`;
    return date.toLocaleDateString("vi-VN");
  };

  return (
    <div className="flex items-start gap-3 py-3 border-b border-surface-subtle last:border-0">
      <div
        className={`w-8 h-8 ${
          typeColors[activity.type]
        } rounded-lg flex items-center justify-center flex-shrink-0`}
      >
        <Icon name={typeIcons[activity.type]} size={16} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-text-primary text-sm">
          {activity.title}
        </div>
        <div className="text-xs text-text-secondary">
          {activity.description}
        </div>
        <div className="text-xs text-text-tertiary mt-1">
          {formatTime(activity.timestamp)}
        </div>
      </div>
      <div className="text-sm font-medium text-primary flex-shrink-0">
        +{activity.xpEarned} XP
      </div>
    </div>
  );
}

function EditProfileModal({
  user,
  onClose,
  onSave,
}: {
  user: User;
  onClose: () => void;
  onSave: (data: EditProfileForm) => void;
}) {
  const [form, setForm] = useState<EditProfileForm>({
    displayName: user.displayName,
    bio: user.bio || "",
    phone: user.phone || "",
    dateOfBirth: user.dateOfBirth || "",
    gender: user.gender || "",
    address: user.address || "",
    city: user.city || "",
    country: user.country || "",
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Chỉnh sửa hồ sơ</h3>
            <button
              onClick={onClose}
              className="text-text-tertiary hover:text-text-primary"
            >
              <Icon name="x" size={20} />
            </button>
          </div>

          <div className="flex justify-center mb-6">
            <Avatar src={user.avatar} size="xl" editable />
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Tên hiển thị
              </label>
              <Input
                value={form.displayName}
                onChange={(e) =>
                  setForm({ ...form, displayName: e.target.value })
                }
                placeholder="Nhập tên hiển thị"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Giới thiệu
              </label>
              <textarea
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                placeholder="Viết vài dòng về bạn..."
                className="w-full h-24 px-3 py-2 border border-surface-subtle rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Số điện thoại
                </label>
                <Input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="0912345678"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Ngày sinh
                </label>
                <Input
                  type="date"
                  value={form.dateOfBirth}
                  onChange={(e) =>
                    setForm({ ...form, dateOfBirth: e.target.value })
                  }
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Giới tính
              </label>
              <select
                value={form.gender}
                onChange={(e) =>
                  setForm({
                    ...form,
                    gender: e.target.value as EditProfileForm["gender"],
                  })
                }
                className="w-full px-3 py-2 border border-surface-subtle rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">Chọn giới tính</option>
                <option value="male">Nam</option>
                <option value="female">Nữ</option>
                <option value="other">Khác</option>
                <option value="prefer_not_to_say">Không muốn tiết lộ</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Địa chỉ
              </label>
              <Input
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="123 Đường ABC"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Thành phố
                </label>
                <Input
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  placeholder="TP. Hồ Chí Minh"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Quốc gia
                </label>
                <Input
                  value={form.country}
                  onChange={(e) =>
                    setForm({ ...form, country: e.target.value })
                  }
                  placeholder="Việt Nam"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Hủy
            </Button>
            <Button onClick={() => onSave(form)} className="flex-1">
              Lưu thay đổi
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ChangePasswordModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (form.newPassword !== form.confirmPassword) {
      setError("Mật khẩu mới không khớp");
      return;
    }
    if (form.newPassword.length < 6) {
      setError("Mật khẩu mới phải có ít nhất 6 ký tự");
      return;
    }

    console.log("Change password:", form);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Đổi mật khẩu</h3>
            <button
              onClick={onClose}
              className="text-text-tertiary hover:text-text-primary"
            >
              <Icon name="x" size={20} />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Mật khẩu hiện tại
              </label>
              <Input
                type="password"
                value={form.currentPassword}
                onChange={(e) =>
                  setForm({ ...form, currentPassword: e.target.value })
                }
                placeholder="Nhập mật khẩu hiện tại"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Mật khẩu mới
              </label>
              <Input
                type="password"
                value={form.newPassword}
                onChange={(e) =>
                  setForm({ ...form, newPassword: e.target.value })
                }
                placeholder="Nhập mật khẩu mới"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Xác nhận mật khẩu mới
              </label>
              <Input
                type="password"
                value={form.confirmPassword}
                onChange={(e) =>
                  setForm({ ...form, confirmPassword: e.target.value })
                }
                placeholder="Nhập lại mật khẩu mới"
              />
            </div>

            {error && (
              <div className="text-sm text-error bg-error-10 px-3 py-2 rounded-lg">
                {error}
              </div>
            )}
          </div>

          <div className="flex gap-3 mt-6">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Hủy
            </Button>
            <Button onClick={handleSubmit} className="flex-1">
              Đổi mật khẩu
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function SettingsSection() {
  const [preferences, setPreferences] = useState(currentUser.preferences);

  const toggleNotification = (key: keyof typeof preferences.notifications) => {
    setPreferences({
      ...preferences,
      notifications: {
        ...preferences.notifications,
        [key]: !preferences.notifications[key],
      },
    });
  };

  const togglePrivacy = (key: keyof typeof preferences.privacy) => {
    setPreferences({
      ...preferences,
      privacy: {
        ...preferences.privacy,
        [key]: !preferences.privacy[key],
      },
    });
  };

  return (
    <div className="space-y-4">

      <div className="bg-surface-subtle rounded-xl p-4">
        <h4 className="font-medium text-text-primary mb-4">Thông báo</h4>
        <div className="space-y-3">
          {Object.entries(preferences.notifications).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <span className="text-sm text-text-secondary">
                {key === "email" && "Thông báo qua email"}
                {key === "push" && "Thông báo đẩy"}
                {key === "sound" && "Âm thanh thông báo"}
                {key === "dailyReminder" && "Nhắc nhở hàng ngày"}
                {key === "weeklyReport" && "Báo cáo hàng tuần"}
              </span>
              <button
                onClick={() =>
                  toggleNotification(
                    key as keyof typeof preferences.notifications
                  )
                }
                className={`w-10 h-5 rounded-full transition-colors relative ${
                  value ? "bg-primary" : "bg-surface"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-transform ${
                    value ? "translate-x-5" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-surface-subtle rounded-xl p-4">
        <h4 className="font-medium text-text-primary mb-4">Quyền riêng tư</h4>
        <div className="space-y-3">
          {Object.entries(preferences.privacy).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <span className="text-sm text-text-secondary">
                {key === "showProfile" && "Hiển thị hồ sơ công khai"}
                {key === "showProgress" && "Hiển thị tiến độ học tập"}
                {key === "allowFriendRequests" && "Cho phép lời mời kết bạn"}
              </span>
              <button
                onClick={() =>
                  togglePrivacy(key as keyof typeof preferences.privacy)
                }
                className={`w-10 h-5 rounded-full transition-colors relative ${
                  value ? "bg-primary" : "bg-surface"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-transform ${
                    value ? "translate-x-5" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function LeaderboardSection() {
  const currentRank = getUserRank(currentUser.id);

  return (
    <div className="space-y-4">

      <div className="bg-primary-10 rounded-xl p-4 flex items-center gap-4">
        <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold text-lg">
          #{currentRank}
        </div>
        <div className="flex-1">
          <div className="font-medium text-text-primary">Xếp hạng của bạn</div>
          <div className="text-sm text-text-secondary">
            Top {Math.round((1 - currentRank / leaderboardData.length) * 100)}%
            người học
          </div>
        </div>
      </div>

      {leaderboardData.slice(0, 5).map((user, index) => (
        <div
          key={user.userId}
          className={`bg-surface-subtle rounded-xl p-3 flex items-center gap-3 ${
            user.isCurrentUser ? "ring-2 ring-primary" : ""
          }`}
        >
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
              index === 0
                ? "bg-yellow text-yellow"
                : index === 1
                ? "bg-gray-300 text-gray"
                : index === 2
                ? "bg-amber-600 text-white"
                : "bg-surface text-text-tertiary"
            }`}
          >
            {index + 1}
          </div>
          <Avatar src={user.avatar} size="sm" />
          <div className="flex-1 min-w-0">
            <div className="font-medium text-text-primary truncate">
              {user.displayName}
              {user.isCurrentUser && (
                <span className="text-primary ml-1">(Bạn)</span>
              )}
            </div>
            <div className="text-xs text-text-tertiary">
              Level {user.level} • 🔥 {user.streak} ngày
            </div>
          </div>
          <div className="text-right">
            <div className="font-medium text-primary">
              {user.xp.toLocaleString()} XP
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function UserProfilePage() {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "overview" | "achievements" | "activity" | "settings" | "leaderboard"
  >("overview");

  const tabs = [
    { id: "overview", label: "Tổng quan", icon: "layout" },
    { id: "achievements", label: "Thành tựu", icon: "award" },
    { id: "activity", label: "Hoạt động", icon: "activity" },
    { id: "settings", label: "Cài đặt", icon: "settings" },
    { id: "leaderboard", label: "Bảng xếp hạng", icon: "trophy" },
  ] as const;

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="Hồ sơ"
        title="Trang cá nhân"
        description="Quản lý thông tin và theo dõi tiến độ học tập"
      />

      <Card className="mb-6 overflow-hidden">
        <div className="h-32 bg-linear-to-r from-primary to-primary-hover" />
        <CardContent className="px-6 pb-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 -mt-12">
            <Avatar
              src={currentUser.avatar}
              size="xl"
              editable
              onClick={() => setShowEditModal(true)}
            />
            <div className="flex-1 text-center sm:text-left">
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <h2 className="text-xl font-bold text-text-primary">
                  {currentUser.displayName}
                </h2>
                {currentUser.isVerified && (
                  <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                    <Icon name="check" size={12} className="text-white" />
                  </div>
                )}
              </div>
              <p className="text-sm text-text-secondary">
                @{currentUser.username}
              </p>
              <p className="text-sm text-text-tertiary mt-1 line-clamp-2">
                {currentUser.bio}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowEditModal(true)}>
                <Icon name="edit" size={16} />
                <span className="ml-1 hidden sm:inline">Chỉnh sửa</span>
              </Button>
              <Button
                variant="ghost"
                onClick={() => setShowPasswordModal(true)}
              >
                <Icon name="lock" size={16} />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
            <div className="bg-surface-subtle rounded-xl p-3 text-center">
              <div className="text-xl font-bold text-primary">
                {currentUser.stats.level}
              </div>
              <div className="text-xs text-text-tertiary">Cấp độ</div>
            </div>
            <div className="bg-surface-subtle rounded-xl p-3 text-center">
              <div className="text-xl font-bold text-warning">
                {currentUser.stats.currentStreak}
              </div>
              <div className="text-xs text-text-tertiary">Streak 🔥</div>
            </div>
            <div className="bg-surface-subtle rounded-xl p-3 text-center">
              <div className="text-xl font-bold text-success">
                {currentUser.stats.averageAccuracy}%
              </div>
              <div className="text-xs text-text-tertiary">Độ chính xác</div>
            </div>
            <div className="bg-surface-subtle rounded-xl p-3 text-center">
              <div className="text-xl font-bold text-info">
                {currentUser.stats.totalVocabularyLearned}
              </div>
              <div className="text-xs text-text-tertiary">Từ vựng</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-1 mb-6 bg-surface-subtle rounded-xl p-1 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? "bg-white text-primary shadow-sm"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            <Icon name={tab.icon} size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          <div className="lg:col-span-2 space-y-4">
            <h3 className="font-semibold text-text-primary">
              Thống kê học tập
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatCard
                icon="book"
                label="Bài học"
                value={currentUser.stats.totalExercises}
                color="primary"
              />
              <StatCard
                icon="headphones"
                label="Bài nghe"
                value={currentUser.stats.totalListeningExercises}
                color="info"
              />
              <StatCard
                icon="clock"
                label="Giờ học"
                value={Math.round(currentUser.stats.totalStudyTime / 60)}
                subtext="tổng cộng"
                color="success"
              />
              <StatCard
                icon="target"
                label="Đúng/Sai"
                value={`${currentUser.stats.totalCorrectAnswers}/${currentUser.stats.totalWrongAnswers}`}
                color="warning"
              />
            </div>

            <XPProgress currentXP={currentUser.stats.totalXP} />

            <div className="grid grid-cols-2 gap-3">
              <StatCard
                icon="flame"
                label="Streak hiện tại"
                value={`${currentUser.stats.currentStreak} ngày`}
                color="error"
              />
              <StatCard
                icon="award"
                label="Badge đạt được"
                value={currentUser.stats.badges.length}
                color="warning"
              />
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-text-primary mb-4">
              Huy hiệu của bạn
            </h3>
            <div className="space-y-3">
              {currentUser.stats.badges.map((badge) => (
                <div
                  key={badge.id}
                  className="bg-surface-subtle rounded-xl p-4 flex items-center gap-3"
                >
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      badge.tier === "gold"
                        ? "bg-yellow-100 text-yellow"
                        : badge.tier === "silver"
                        ? "bg-gray-100 text-gray"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    <Icon name={badge.icon} size={20} />
                  </div>
                  <div>
                    <div className="font-medium text-text-primary">
                      {badge.name}
                    </div>
                    <div className="text-xs text-text-tertiary">
                      {badge.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "achievements" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {userAchievements.map((achievement) => (
            <AchievementCard key={achievement.id} achievement={achievement} />
          ))}
        </div>
      )}

      {activeTab === "activity" && (
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold text-text-primary mb-4">
              Hoạt động gần đây
            </h3>
            <div>
              {userActivities.map((activity) => (
                <ActivityItem key={activity.id} activity={activity} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === "settings" && <SettingsSection />}

      {activeTab === "leaderboard" && <LeaderboardSection />}

      {showEditModal && (
        <EditProfileModal
          user={currentUser}
          onClose={() => setShowEditModal(false)}
          onSave={(data) => {
            console.log("Save profile:", data);
            setShowEditModal(false);
          }}
        />
      )}

      {showPasswordModal && (
        <ChangePasswordModal onClose={() => setShowPasswordModal(false)} />
      )}
    </main>
  );
}

export default UserProfilePage;
