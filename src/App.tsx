import React, { useEffect, useState } from 'react';
import { HRProvider, useHR } from './context/HRContext';
import { Sidebar, NavTab } from './components/layout/Sidebar';
import { LoginScreen } from './components/auth/LoginScreen';
import { TopHeader } from './components/layout/TopHeader';
import { OverviewDashboard } from './components/dashboard/OverviewDashboard';
import { EmployeeDirectory } from './components/employees/EmployeeDirectory';
import { LeaveManagement } from './components/leave/LeaveManagement';
import { AttendanceTracker } from './components/attendance/AttendanceTracker';
import { PayrollManager } from './components/payroll/PayrollManager';
import { RecruitmentATS } from './components/recruitment/RecruitmentATS';
import { PerformanceReviews } from './components/performance/PerformanceReviews';
import { OrgAndCompany } from './components/org/OrgAndCompany';
import { NewEmployeeModal } from './components/employees/NewEmployeeModal';
import { UserManagement } from './components/admin/UserManagement';

const AppContent: React.FC = () => {
  const { isAuthenticated, permissions } = useHR();
  const [currentTab, setCurrentTab] = useState<NavTab>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [isNewEmployeeModalOpen, setIsNewEmployeeModalOpen] = useState(false);
  const [isNewLeaveModalOpen, setIsNewLeaveModalOpen] = useState(false);

  // Start every sign-in on the overview, and leave admin-only screens when the role no longer allows them.
  useEffect(() => {
    setCurrentTab('overview');
  }, [isAuthenticated]);

  useEffect(() => {
    if (currentTab === 'users' && !permissions.canManageUsers) setCurrentTab('overview');
  }, [currentTab, permissions.canManageUsers]);

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  const handleOpenNewEmployee = () => setIsNewEmployeeModalOpen(true);
  const handleOpenNewLeave = () => {
    setCurrentTab('leaves');
    setIsNewLeaveModalOpen(true);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-neutral-50 text-neutral-900 font-sans selection:bg-neutral-900 selection:text-white">
      {/* Primary Sidebar */}
      <Sidebar currentTab={currentTab} onSelectTab={(tab) => { setCurrentTab(tab); setSearchQuery(''); }} />

      {/* Main View Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <TopHeader
          currentTab={currentTab}
          onOpenNewEmployee={handleOpenNewEmployee}
          onOpenNewLeave={handleOpenNewLeave}
          searchQuery={searchQuery}
          setSearchQuery={(q) => {
            setSearchQuery(q);
            if (q && currentTab !== 'employees') {
              setCurrentTab('employees');
            }
          }}
        />

        {/* Content Viewport with dynamic scrolling */}
        <main className="flex-1 overflow-y-auto px-6 py-8">
          {currentTab === 'overview' && (
            <OverviewDashboard
              onNavigate={setCurrentTab}
              onOpenNewEmployee={handleOpenNewEmployee}
              onOpenNewLeave={handleOpenNewLeave}
            />
          )}

          {currentTab === 'employees' && (
            <EmployeeDirectory
              onOpenNewEmployee={handleOpenNewEmployee}
              externalSearch={searchQuery}
            />
          )}

          {currentTab === 'leaves' && (
            <LeaveManagement
              isModalOpen={isNewLeaveModalOpen}
              setIsModalOpen={setIsNewLeaveModalOpen}
            />
          )}

          {currentTab === 'attendance' && <AttendanceTracker />}

          {currentTab === 'payroll' && <PayrollManager />}

          {currentTab === 'recruitment' && <RecruitmentATS />}

          {currentTab === 'performance' && <PerformanceReviews />}

          {currentTab === 'company' && <OrgAndCompany />}

          {currentTab === 'users' && permissions.canManageUsers && <UserManagement />}
        </main>
      </div>

      {/* Global New Employee Modal */}
      <NewEmployeeModal
        isOpen={isNewEmployeeModalOpen}
        onClose={() => setIsNewEmployeeModalOpen(false)}
        onSuccess={(empId) => {
          setCurrentTab('employees');
        }}
      />
    </div>
  );
};

export default function App() {
  return (
    <HRProvider>
      <AppContent />
    </HRProvider>
  );
}
