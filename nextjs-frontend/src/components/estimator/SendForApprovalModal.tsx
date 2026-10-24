import React, { useState, useMemo } from 'react';
import { 
  X, 
  Send, 
  Check, 
  ShieldCheck, 
  HardHat, 
  Compass, 
  Building2, 
  Briefcase, 
  FileText, 
  ChevronDown, 
  ChevronUp, 
  AlertCircle,
  UserCheck,
  Search,
  Sparkles,
  Clock
} from 'lucide-react';
import { ProjectRFQ, BidPackage, BidPackageDocument, BidPackageApprover } from '../../types/crm';
import { REGISTERED_COMPANY_EMPLOYEES, RegisteredCompanyEmployee } from '../../data/mockEmployees';

interface SendForApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: ProjectRFQ;
  bidPackage: BidPackage;
  onConfirmRouting: (updatedPackage: BidPackage, notificationText: string) => void;
}

interface DepartmentAssignment {
  department: string;
  enabled: boolean;
  employeeName: string;
  employeeEmail: string;
  employeeRole: string;
  documentCount: number;
}

export const SendForApprovalModal: React.FC<SendForApprovalModalProps> = ({
  isOpen,
  onClose,
  project,
  bidPackage,
  onConfirmRouting
}) => {
  // Group documents by department
  const departmentDocsMap = useMemo(() => {
    const map: Record<string, BidPackageDocument[]> = {};
    bidPackage.documents.forEach(doc => {
      if (!map[doc.department]) {
        map[doc.department] = [];
      }
      map[doc.department].push(doc);
    });
    return map;
  }, [bidPackage.documents]);

  const departmentsList = useMemo(() => {
    // Prioritize HSE and QA/QC first as explicitly requested
    const order = [
      'HSE',
      'QA/QC',
      'Operations',
      'Procurement',
      'Commercial & Tendering',
      'Corporate / Legal'
    ];
    return order.filter(d => Boolean(departmentDocsMap[d]));
  }, [departmentDocsMap]);

  // Initial department assignments based on any existing approvers or sensible defaults
  const [assignments, setAssignments] = useState<Record<string, DepartmentAssignment>>(() => {
    const initial: Record<string, DepartmentAssignment> = {};

    departmentsList.forEach(dept => {
      // Find default recommended employee from registered staff
      const matching = REGISTERED_COMPANY_EMPLOYEES.filter(e => {
        if (dept === 'HSE') return e.department === 'HSE';
        if (dept === 'QA/QC') return e.department === 'QA/QC';
        if (dept === 'Operations') return e.department === 'Operations';
        if (dept === 'Procurement') return e.department === 'Procurement';
        return e.department === 'Commercial & Tendering' || e.department === 'Executive / Management';
      });

      const defaultEmp = matching[0];
      const count = departmentDocsMap[dept]?.length || 0;

      initial[dept] = {
        department: dept,
        enabled: true,
        employeeName: defaultEmp?.name || '',
        employeeEmail: defaultEmp?.email || '',
        employeeRole: defaultEmp?.role || '',
        documentCount: count
      };
    });

    return initial;
  });

  // Search input per department
  const [searchQueries, setSearchQueries] = useState<Record<string, string>>({});
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [expandedDocs, setExpandedDocs] = useState<Record<string, boolean>>({});

  // Additional routing metadata
  const [priority, setPriority] = useState<'Normal' | 'High' | 'Urgent'>('High');
  const [turnaround, setTurnaround] = useState<string>('48 Hours (Standard Tender Review)');
  const [instructions, setInstructions] = useState<string>(
    'Please review attached estimation & technical documents for compliance with tender requirements and client specifications prior to executive sign-off.'
  );

  if (!isOpen) return null;

  const handleToggleDepartment = (dept: string) => {
    setAssignments(prev => ({
      ...prev,
      [dept]: {
        ...prev[dept],
        enabled: !prev[dept].enabled
      }
    }));
  };

  const handleSelectEmployee = (dept: string, emp: RegisteredCompanyEmployee) => {
    setAssignments(prev => ({
      ...prev,
      [dept]: {
        ...prev[dept],
        employeeName: emp.name,
        employeeEmail: emp.email,
        employeeRole: emp.role
      }
    }));
    setSearchQueries(prev => ({ ...prev, [dept]: '' }));
    setActiveDropdown(null);
  };

  const handleCustomNameChange = (dept: string, val: string) => {
    setSearchQueries(prev => ({ ...prev, [dept]: val }));
    setAssignments(prev => ({
      ...prev,
      [dept]: {
        ...prev[dept],
        employeeName: val,
        employeeEmail: val ? `${val.toLowerCase().replace(/[^a-z0-9]/g, '.')}@radwa.sa` : ''
      }
    }));
  };

  const toggleExpandDocs = (dept: string) => {
    setExpandedDocs(prev => ({ ...prev, [dept]: !prev[dept] }));
  };

  const getDepartmentIcon = (dept: string) => {
    switch (dept) {
      case 'HSE':
        return <HardHat className="w-4 h-4 text-emerald-600" />;
      case 'QA/QC':
        return <ShieldCheck className="w-4 h-4 text-blue-600" />;
      case 'Operations':
        return <Compass className="w-4 h-4 text-amber-600" />;
      case 'Procurement':
        return <Briefcase className="w-4 h-4 text-purple-600" />;
      case 'Commercial & Tendering':
        return <Building2 className="w-4 h-4 text-indigo-600" />;
      default:
        return <FileText className="w-4 h-4 text-slate-600" />;
    }
  };

  const handleConfirm = () => {
    const selectedDepts = departmentsList.filter(d => assignments[d]?.enabled && assignments[d]?.employeeName.trim());

    if (selectedDepts.length === 0) {
      alert('Please enable at least one department and designate a reviewer.');
      return;
    }

    const newApprovers: BidPackageApprover[] = selectedDepts.map(dept => {
      const a = assignments[dept];
      return {
        department: dept,
        employeeName: a.employeeName.trim(),
        employeeEmail: a.employeeEmail.trim(),
        role: a.employeeRole || 'Designated Reviewer',
        status: 'Pending Review',
        assignedAt: new Date().toISOString(),
        documentCount: a.documentCount
      };
    });

    // Update documents with reviewer assignment
    const updatedDocuments = bidPackage.documents.map(doc => {
      const deptAssignment = assignments[doc.department];
      if (deptAssignment && deptAssignment.enabled && deptAssignment.employeeName.trim()) {
        return {
          ...doc,
          status: 'Sent for Review' as const,
          assignedReviewer: deptAssignment.employeeName.trim(),
          assignedReviewerEmail: deptAssignment.employeeEmail.trim()
        };
      }
      return doc;
    });

    const updatedPackage: BidPackage = {
      ...bidPackage,
      status: 'Sent for Approval',
      sentForApprovalAt: new Date().toISOString(),
      documents: updatedDocuments,
      approvers: newApprovers,
      routingNotes: `Priority: ${priority} | Turnaround: ${turnaround} | Note: ${instructions}`
    };

    const reviewersSummary = newApprovers.map(a => `${a.department} → ${a.employeeName}`).join(', ');
    const notification = `✅ Bid package successfully routed for review to: ${reviewersSummary}`;

    onConfirmRouting(updatedPackage, notification);
    onClose();
  };

  const enabledCount = departmentsList.filter(d => assignments[d]?.enabled).length;
  const totalDocsCount = departmentsList.reduce((acc, d) => assignments[d]?.enabled ? acc + (departmentDocsMap[d]?.length || 0) : acc, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] overflow-hidden"
        onClick={() => setActiveDropdown(null)}
      >
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-start justify-between gap-4 bg-slate-50/50">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="p-2 rounded-xl bg-purple-100 text-purple-700">
                <Send className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  Route Bid Package for Review & Approval
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  {project.workOrderNo} — {project.proposedProjectName}
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Select or type the designated company employee/reviewer for each department (e.g. HSE, QA/QC). Only the selected reviewers will receive the documents for sign-off.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* Department Selection & Reviewer Assignment List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Department Reviewers & Designated Personnel
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {enabledCount} of {departmentsList.length} Departments Selected ({totalDocsCount} Documents)
              </span>
            </div>

            {departmentsList.map(dept => {
              const assignment = assignments[dept];
              const docs = departmentDocsMap[dept] || [];
              const isExpanded = Boolean(expandedDocs[dept]);
              const searchQuery = searchQueries[dept] ?? assignment.employeeName;
              const isDropdownOpen = activeDropdown === dept;

              // Filter registered employees for this department or search query
              const deptEmployees = REGISTERED_COMPANY_EMPLOYEES.filter(emp => {
                const matchesDept = 
                  (dept === 'HSE' && emp.department === 'HSE') ||
                  (dept === 'QA/QC' && emp.department === 'QA/QC') ||
                  (dept === 'Operations' && emp.department === 'Operations') ||
                  (dept === 'Procurement' && emp.department === 'Procurement') ||
                  ((dept === 'Commercial & Tendering' || dept === 'Corporate / Legal') && 
                    (emp.department === 'Commercial & Tendering' || emp.department === 'Executive / Management'));
                
                if (!searchQuery) return matchesDept;
                return emp.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                       emp.role.toLowerCase().includes(searchQuery.toLowerCase());
              });

              return (
                <div 
                  key={dept}
                  className={`rounded-xl border transition-all ${
                    assignment.enabled 
                      ? 'bg-white border-slate-300 shadow-2xs' 
                      : 'bg-slate-50/70 border-slate-200 opacity-60'
                  }`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="p-4 space-y-3">
                    
                    {/* Top Row: Checkbox, Department Label, Doc Count, Expand */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          id={`dept-check-${dept}`}
                          checked={assignment.enabled}
                          onChange={() => handleToggleDepartment(dept)}
                          className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 border-slate-300 cursor-pointer"
                        />
                        <label 
                          htmlFor={`dept-check-${dept}`}
                          className="flex items-center gap-2 cursor-pointer font-bold text-sm text-slate-900"
                        >
                          <span className="p-1 rounded bg-slate-100">
                            {getDepartmentIcon(dept)}
                          </span>
                          <span>{dept} Department</span>
                        </label>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700">
                          {docs.length} {docs.length === 1 ? 'doc' : 'docs'}
                        </span>
                        <button
                          type="button"
                          onClick={() => toggleExpandDocs(dept)}
                          className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 transition flex items-center gap-0.5 cursor-pointer"
                        >
                          <span>{isExpanded ? 'Hide files' : 'View files'}</span>
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    {/* Reviewer Input Field with Real-Time Suggestions */}
                    {assignment.enabled && (
                      <div className="relative pt-1">
                        <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                          Assigned Reviewer / Employee Name:
                        </label>
                        
                        <div className="relative">
                          <input
                            type="text"
                            value={searchQuery}
                            onFocus={() => setActiveDropdown(dept)}
                            onChange={(e) => handleCustomNameChange(dept, e.target.value)}
                            placeholder={`Type or select ${dept} reviewer...`}
                            className="w-full pl-3 pr-8 py-2 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-2xs"
                          />
                          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
                        </div>

                        {/* Quick Suggestion Chips */}
                        <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                          <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-purple-500" />
                            Registered Staff:
                          </span>
                          {REGISTERED_COMPANY_EMPLOYEES
                            .filter(emp => {
                              if (dept === 'HSE') return emp.department === 'HSE';
                              if (dept === 'QA/QC') return emp.department === 'QA/QC';
                              if (dept === 'Operations') return emp.department === 'Operations';
                              if (dept === 'Procurement') return emp.department === 'Procurement';
                              return emp.department === 'Commercial & Tendering';
                            })
                            .slice(0, 3)
                            .map(emp => (
                              <button
                                key={emp.id}
                                type="button"
                                onClick={() => handleSelectEmployee(dept, emp)}
                                className={`text-[11px] px-2 py-0.5 rounded-full border transition cursor-pointer font-medium ${
                                  assignment.employeeName === emp.name
                                    ? 'bg-purple-100 text-purple-900 border-purple-300 font-bold'
                                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                                }`}
                              >
                                {emp.name}
                              </button>
                            ))}
                        </div>

                        {/* Dropdown Suggestions Menu */}
                        {isDropdownOpen && (
                          <div className="absolute z-20 left-0 right-0 mt-1 bg-white rounded-xl shadow-xl border border-slate-200 max-h-56 overflow-y-auto divide-y divide-slate-100">
                            <div className="p-2 text-[10px] uppercase font-bold text-slate-400 bg-slate-50">
                              Registered Employees Matching Query ({deptEmployees.length})
                            </div>
                            {deptEmployees.length > 0 ? (
                              deptEmployees.map(emp => (
                                <div
                                  key={emp.id}
                                  onClick={() => handleSelectEmployee(dept, emp)}
                                  className="p-2.5 hover:bg-purple-50/70 transition cursor-pointer flex items-center justify-between"
                                >
                                  <div className="flex items-center gap-2.5">
                                    <span className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[10px] ${emp.avatarBg}`}>
                                      {emp.initials}
                                    </span>
                                    <div>
                                      <div className="text-xs font-bold text-slate-900">
                                        {emp.name}
                                      </div>
                                      <div className="text-[10px] text-slate-500">
                                        {emp.role}
                                      </div>
                                    </div>
                                  </div>
                                  <span className="text-[10px] font-mono text-slate-400">
                                    {emp.email}
                                  </span>
                                </div>
                              ))
                            ) : (
                              <div className="p-3 text-center text-xs text-slate-500">
                                No registered employee matching &quot;{searchQuery}&quot;. Press outside to use &quot;{searchQuery}&quot; as custom reviewer.
                              </div>
                            )}
                          </div>
                        )}

                        {/* Selected Reviewer Confirmation Pill */}
                        {assignment.employeeName && (
                          <div className="mt-2 text-xs flex items-center gap-2 text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                            <UserCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>Will be routed directly to: <strong>{assignment.employeeName}</strong> {assignment.employeeEmail && <code className="text-[11px] text-emerald-700 font-mono">({assignment.employeeEmail})</code>}</span>
                          </div>
                        )}

                      </div>
                    )}

                    {/* Expandable Document Checklist */}
                    {isExpanded && (
                      <div className="mt-2 pt-2 border-t border-slate-100 bg-slate-50/60 p-3 rounded-lg space-y-1.5">
                        <div className="text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-1">
                          Included {dept} Documents ({docs.length}):
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs">
                          {docs.map(doc => (
                            <div key={doc.id} className="flex items-center gap-1.5 text-slate-700">
                              <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0" />
                              <span className="truncate">{doc.order}. {doc.name}</span>
                              {doc.uploadedFile && (
                                <span className="text-[10px] text-emerald-600 font-bold shrink-0">✓ File</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  </div>
                </div>
              );
            })}
          </div>

          {/* Turnaround & Priority Settings */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              Review Turnaround & Instructions
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Routing Priority
                </label>
                <div className="flex items-center gap-2">
                  {(['Normal', 'High', 'Urgent'] as const).map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition cursor-pointer ${
                        priority === p 
                          ? p === 'Urgent' 
                            ? 'bg-rose-600 text-white border-rose-600'
                            : 'bg-purple-600 text-white border-purple-600'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Target Review Turnaround
                </label>
                <select
                  value={turnaround}
                  onChange={(e) => setTurnaround(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-800 cursor-pointer shadow-2xs"
                >
                  <option value="24 Hours (Urgent Tender Close)">24 Hours (Urgent Tender Close)</option>
                  <option value="48 Hours (Standard Tender Review)">48 Hours (Standard Tender Review)</option>
                  <option value="72 Hours (Comprehensive Multi-Discipline)">72 Hours (Comprehensive Multi-Discipline)</option>
                  <option value="5 Working Days">5 Working Days</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Instructions for Designated Reviewers
              </label>
              <textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                rows={2}
                className="w-full p-2.5 rounded-lg border border-slate-300 bg-white text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-2xs"
                placeholder="Enter specific verification requirements or compliance checklists..."
              />
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs text-slate-600">
            <span>Routing <strong className="text-slate-900">{totalDocsCount} documents</strong> to <strong className="text-slate-900">{enabledCount} designated reviewers</strong></span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition cursor-pointer shadow-2xs"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleConfirm}
              style={{ backgroundColor: '#5b4db7' }}
              className="px-5 py-2 rounded-xl text-white text-xs font-bold hover:brightness-95 transition cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-[0.99]"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Confirm & Send to Reviewers</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
