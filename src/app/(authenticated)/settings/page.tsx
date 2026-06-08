'use client';

import { useUser } from '@/hooks/useUser';
import Card from '@/components/ui/Card';
import Alert from '@/components/ui/Alert';

export default function SettingsPage() {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-sakura-200 border-t-sakura-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="space-y-6">
        <h1 className="font-display text-3xl font-bold text-gray-900">Settings</h1>
        <Alert type="error">Unable to load user profile</Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="font-display text-3xl font-bold text-gray-900">Settings</h1>
        <p className="mt-2 text-gray-600">Manage your account and preferences</p>
      </div>

      {/* Account Information */}
      <Card>
        <h2 className="font-display text-xl font-semibold text-gray-900 mb-4">
          Account Information
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700">Username</label>
            <p className="mt-1 text-gray-600">{user.username}</p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700">Role</label>
            <p className="mt-1 capitalize text-gray-600">{user.role}</p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700">Account Status</label>
            <p className="mt-1 capitalize text-gray-600">{user.account_status}</p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700">Member Since</label>
            <p className="mt-1 text-gray-600">
              {new Date(user.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
        </div>
      </Card>

      {/* Leaderboard Preferences */}
      <Card>
        <h2 className="font-display text-xl font-semibold text-gray-900 mb-4">
          Privacy & Display
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="block text-sm font-semibold text-gray-700">
                Leaderboard Visibility
              </label>
              <p className="mt-1 text-sm text-gray-600">
                {user.leaderboard_opt_in
                  ? 'Your scores are visible on leaderboards'
                  : 'Your scores are hidden from leaderboards'}
              </p>
            </div>
            <button
              disabled
              className="rounded-lg bg-gray-300 px-4 py-2 text-sm font-semibold text-gray-500 cursor-not-allowed"
            >
              Manage
            </button>
          </div>
        </div>
      </Card>

      {/* Coming Soon Features */}
      <Card>
        <h2 className="font-display text-xl font-semibold text-gray-900 mb-4">
          Other Settings
        </h2>
        <div className="space-y-3 text-sm text-gray-600">
          <p>• Change Password - Coming Soon</p>
          <p>• Two-Factor Authentication - Coming Soon</p>
          <p>• Data Export - Coming Soon</p>
          <p>• Account Deletion - Coming Soon</p>
        </div>
      </Card>
    </div>
  );
}
