import React, { useState } from 'react';
import CreateForm from './components/CreateForm';
import UpdateForm from './components/UpdateForm';
import SolutionsForm from './components/SolutionsForm';
import IdChangerForm from './components/IdChangerForm'; // Import the new component

function App() {
  const [activeTab, setActiveTab] = useState('create');

  const tabStyle = "flex items-center gap-2 px-4 md:px-6 py-3 font-semibold rounded-t-lg transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 text-sm md:text-base";
  const activeTabStyle = "bg-gray-800 text-white shadow-md";
  const inactiveTabStyle = "bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white";

  const renderContent = () => {
    switch (activeTab) {
      case 'create':
        return <CreateForm />;
      case 'update':
        return <UpdateForm />;
      case 'solutions':
        return <SolutionsForm />;
      case 'id-changer':
        return <IdChangerForm />; // Render the new component
      default:
        return <CreateForm />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 font-sans">
      <div className="w-full max-w-2xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-300">
            The Coding Question Factory 🏭
          </h1>
          <p className="text-lg text-gray-400 mt-2">A secure server-powered tool to create and update coding questions.</p>
        </header>
        
        <div className="bg-gray-800 rounded-lg shadow-2xl shadow-black/20 overflow-hidden border border-gray-700">
          <div className="flex flex-wrap bg-gray-900/50 border-b border-gray-700">
            {/* Create Tab */}
            <button onClick={() => setActiveTab('create')} className={`${tabStyle} ${activeTab === 'create' ? activeTabStyle : inactiveTabStyle}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
              Create
            </button>
            {/* Update Tab */}
            <button onClick={() => setActiveTab('update')} className={`${tabStyle} ${activeTab === 'update' ? activeTabStyle : inactiveTabStyle}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z" /><path fillRule="evenodd" d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clipRule="evenodd" /></svg>
              Update
            </button>
            {/* Solutions Tab */}
            <button onClick={() => setActiveTab('solutions')} className={`${tabStyle} ${activeTab === 'solutions' ? activeTabStyle : inactiveTabStyle}`}>
               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
              Solutions
            </button>
             {/* ID Changer Tab */}
             <button onClick={() => setActiveTab('id-changer')} className={`${tabStyle} ${activeTab === 'id-changer' ? activeTabStyle : inactiveTabStyle}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1.414-4.586a1 1 0 00-1.414-1.414L8.586 13.414l-1.293-1.293a1 1 0 00-1.414 1.414L7.172 14.828a1 1 0 001.414 0l2.828-2.828zM8 7a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clipRule="evenodd" /></svg>
              ID Changer
            </button>
          </div>
          
          <div className="p-8">
            {renderContent()}
          </div>
        </div>
         <footer className="text-center mt-8 text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} Coding Question Factory.
        </footer>
      </div>
    </div>
  );
}

export default App;
