
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { DashboardLayout } from "../layouts/DashboardLayout";

import { DashboardPage } from "../../features/dashboard/pages/DashboardPage";
import { AccountsPage } from "../../features/accounts/pages/AccountsPage";
import { ContentLibraryPage } from "../../features/content/pages/ContentLibraryPage";
import { PublisherPage } from "../../features/publisher/pages/PublisherPage";
import { CalendarPage } from "../../features/calendar/pages/CalendarPage";
import { AnalyticsPage } from "../../features/analytics/pages/AnalyticsPage";
import { InboxPage } from "../../features/inbox/pages/InboxPage";
import { SettingsPage } from "../../features/settings/pages/SettingsPage";

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/accounts" element={<AccountsPage />} />
          <Route path="/content" element={<ContentLibraryPage />} />
          <Route path="/publisher" element={<PublisherPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/inbox" element={<InboxPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
