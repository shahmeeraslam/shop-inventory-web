import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { InventoryProvider } from './context/InventoryContext';
import Navbar from './components/UI/Navbar';
import AuthScreen from './screens/AuthScreen';
import DashboardScreen from './screens/DashboardScreen';
import AddItemScreen from './screens/AddItemScreen';
import BillingScreen from './screens/BIllingScreen';
import BillingHistoryScreen from './screens/BillingHistoryScreen';
import ImportScreen from './screens/ImportScreen'; // <-- FIXED: Added explicit component reference loading hook

// Core structural child routing component mapping out secure dashboard interfaces
function MainAppLayout() {
  const [currentScreen, setCurrentScreen] = React.useState('dashboard');
  const { user, authLoading } = useAuth();

  // Handle splash loading phase while fetching local cookie storage token profiles
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center gap-3">
        <span className="text-xl animate-spin text-slate-400 font-mono">⏳</span>
        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest font-mono">Verifying Archive Access...</span>
      </div>
    );
  }

  // Intercept render matrix cycle if auth token profile is completely missing
  if (!user) {
    return <AuthScreen />;
  }

  return (
    <InventoryProvider>
      <div className="min-h-screen bg-slate-50 text-slate-800 antialiased flex flex-col">
        <Navbar currentScreen={currentScreen} onNavigate={setCurrentScreen} />
        
        <main className="max-w-7xl w-full mx-auto px-4 py-6 sm:px-6 lg:px-8 flex-1 flex flex-col">
          <div className="bg-white rounded-2xl shadow-xs border border-slate-100 p-4 sm:p-6 md:p-8 flex-1 flex flex-col relative">
            
            {/* Structured Main Route Switch View Selector */}
            {(() => {
              switch (currentScreen) {
                case 'dashboard':
                  return (
                    <DashboardScreen 
                      onNavigateToAdd={() => setCurrentScreen('add-item')} 
                      onNavigateToImport={() => setCurrentScreen('import-sheet')} // Hook up dashboard fast-clicks
                      onNavigateToBilling={() => setCurrentScreen('billing')} 
                      onNavigateToHistory={() => setCurrentScreen('billing-history')} 
                    />
                  );
                case 'add-item':
                  return <AddItemScreen onNavigateBack={() => setCurrentScreen('dashboard')} />;
                  
                case 'import-sheet':
                  return <ImportScreen onNavigateBack={() => setCurrentScreen('dashboard')} />; // <-- FIXED: Explicit rendering block mount
                  
                case 'billing':
                  return <BillingScreen onNavigateBack={() => setCurrentScreen('dashboard')} />;
                  
                case 'billing-history':
                  return <BillingHistoryScreen onNavigateBack={() => setCurrentScreen('dashboard')} />;
                  
                default:
                  // Hard safe fallback routing auto-recovery bounds
                  return (
                    <DashboardScreen 
                      onNavigateToAdd={() => setCurrentScreen('add-item')} 
                      onNavigateToImport={() => setCurrentScreen('import-sheet')}
                      onNavigateToBilling={() => setCurrentScreen('billing')} 
                      onNavigateToHistory={() => setCurrentScreen('billing-history')} 
                    />
                  );
              }
            })()}

          </div>
        </main>
      </div>
    </InventoryProvider>
  );
}

// Master wrapper mounting root context blocks safely
export default function App() {
  return (
    <AuthProvider>
      <MainAppLayout />
    </AuthProvider>
  );
}