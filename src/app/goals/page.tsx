'use client'

import { useState, useCallback, useEffect } from 'react'
import { 
  Plus, 
  ArrowRight, 
  Home, 
  Car, 
  Briefcase, 
  GraduationCap, 
  Plane,
  Pencil,
  Trash2,
  CircleDollarSign,
  X,
  Calendar,
  Wallet,
  LucideIcon,
  RefreshCw
} from 'lucide-react'
import { useGoalsData, NewGoal } from '../../hooks/useGoalsData'

export default function Goals() {
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingGoal, setEditingGoal] = useState<any>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  
  const {
    activeTab,
    setActiveTab,
    inProgressGoals,
    timelineGoals,
    activeGoals,
    totalMonthlyContribution,
    addGoal,
    updateGoal,
    deleteGoal,
    isLoading,
    error,
    refetch
  } = useGoalsData()

  const handleAddGoal = async (goal: NewGoal) => {
    await addGoal(goal)
    setShowAddModal(false)
  }
  
  const handleEditGoal = (goal: any) => {
    // Find the icon name from the icon component
    let iconName = 'CircleDollarSign';
    
    if (goal.icon === CircleDollarSign) iconName = 'CircleDollarSign';
    else if (goal.icon === Car) iconName = 'Car';
    else if (goal.icon === Home) iconName = 'Home';
    else if (goal.icon === Plane) iconName = 'Plane';
    else if (goal.icon === GraduationCap) iconName = 'GraduationCap';
    else if (goal.icon === Briefcase) iconName = 'Briefcase';
    
    setEditingGoal({
      ...goal,
      iconName
    });
    setShowEditModal(true);
  }
  
  const handleUpdateGoal = async (updatedGoal: any) => {
    await updateGoal({
      ...editingGoal,
      ...updatedGoal,
      // Replace icon with the actual icon component
      icon: getIconByName(updatedGoal.iconName)
    });
    setShowEditModal(false);
    setEditingGoal(null);
  }
  
  const handleDeleteGoal = async (id: number) => {
    if (confirm('Are you sure you want to delete this goal?')) {
      await deleteGoal(id)
    }
  }
  
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  }

  // Helper function to get icon component from name
  const getIconByName = (name: string): LucideIcon => {
    switch (name) {
      case 'CircleDollarSign': return CircleDollarSign;
      case 'Car': return Car;
      case 'Home': return Home;
      case 'Plane': return Plane;
      case 'GraduationCap': return GraduationCap;
      case 'Briefcase': return Briefcase;
      default: return CircleDollarSign;
    }
  }

  if (isLoading) {
    return (
      <div className="w-full flex items-center justify-center py-12">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-8 w-40 bg-gray-200 rounded mb-8"></div>
          <div className="h-32 w-full max-w-3xl bg-gray-200 rounded mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="w-full flex items-center justify-center py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-xl">
          <h2 className="text-lg font-semibold text-red-700 mb-2">Error Loading Goals</h2>
          <p className="text-red-600">{error.message}</p>
          <p className="text-sm text-gray-600 mt-4">Please try refreshing the page or contact support if the problem persists.</p>
          <button 
            onClick={handleRefresh}
            className="mt-4 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#1F3A93] mb-4 md:mb-0">Financial Goals</h1>
        
        <div className="flex space-x-3">
          <button 
            onClick={handleRefresh}
            className="flex items-center bg-gray-100 rounded-md px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200"
            disabled={isRefreshing}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </button>
          
          <button 
            className="flex items-center bg-[#1F3A93] rounded-md px-3 py-2 text-sm font-medium text-white hover:bg-[#172d70] w-fit"
            onClick={() => setShowAddModal(true)}
          >
            <Plus className="mr-2 h-4 w-4 text-white" />
            Add New Goal
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <h2 className="text-sm font-medium text-gray-500 mb-2">Active Goals</h2>
          <p className="text-2xl font-bold text-gray-900">{inProgressGoals.length}</p>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <h2 className="text-sm font-medium text-gray-500 mb-2">Total Saved</h2>
          <p className="text-2xl font-bold text-gray-900">
            ${inProgressGoals.reduce((sum, goal) => sum + goal.currentAmount, 0).toLocaleString()}
          </p>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <h2 className="text-sm font-medium text-gray-500 mb-2">Monthly Contributions</h2>
          <p className="text-2xl font-bold text-gray-900">${totalMonthlyContribution.toLocaleString()}</p>
        </div>
      </div>
      
      {/* View Selector */}
      <div className="flex mb-6 border-b border-gray-200">
        <button 
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'progress' 
              ? 'text-[#1F3A93] border-b-2 border-[#1F3A93]' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('progress')}
        >
          By Progress
        </button>
        <button 
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'timeline' 
              ? 'text-[#1F3A93] border-b-2 border-[#1F3A93]' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('timeline')}
        >
          By Timeline
        </button>
      </div>

      {/* Goals Grid */}
      {activeGoals.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <CircleDollarSign className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No goals yet</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Track your progress toward financial goals by setting up your first savings goal.
          </p>
          <button 
            className="inline-flex items-center bg-[#1F3A93] rounded-md px-4 py-2 text-sm font-medium text-white hover:bg-[#172d70]"
            onClick={() => setShowAddModal(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Your First Goal
          </button>
        </div>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeGoals.map(goal => (
          <div key={goal.id} className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center">
                  <div className={`p-3 rounded-lg ${goal.color} mr-3`}>
                    <goal.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{goal.name}</h3>
                    <p className="text-sm text-gray-500">
                      ${goal.currentAmount.toLocaleString()} of ${goal.targetAmount.toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                    <button 
                      className="p-1 text-gray-400 hover:text-[#1F3A93]"
                      onClick={() => handleEditGoal(goal)}
                    >
                    <Pencil className="h-4 w-4" />
                  </button>
                    <button 
                      className="p-1 text-gray-400 hover:text-red-500"
                      onClick={() => handleDeleteGoal(goal.id)}
                    >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <div className="mb-3">
                <div className="flex justify-between items-center text-sm mb-1">
                  <span className="font-medium text-gray-700">{goal.progressPercent}% Complete</span>
                  <span className="text-gray-500">${goal.remaining.toLocaleString()} to go</span>
                </div>
                <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#1F3A93] rounded-full" 
                    style={{ width: `${goal.progressPercent}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="text-sm text-gray-600">
                <div className="flex justify-between mb-1">
                  <span>Contributing:</span>
                  <span className="font-medium">${goal.contributions.amount}/month</span>
                </div>
                <div className="flex justify-between mb-1">
                  <span>Target date:</span>
                  <span className="font-medium">{new Date(goal.targetDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated completion:</span>
                  <span className={`font-medium ${goal.onTrack ? 'text-green-600' : 'text-red-600'}`}>
                    {goal.completionDate.toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
            
            <div className={`px-6 py-4 border-t border-gray-200 ${goal.onTrack ? 'bg-green-50' : 'bg-yellow-50'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`h-2.5 w-2.5 rounded-full ${goal.onTrack ? 'bg-green-500' : 'bg-yellow-500'} mr-2`}></div>
                  <span className="text-sm font-medium">
                    {goal.onTrack
                      ? `On track, ${goal.monthsToComplete} months to go`
                      : `Will miss target by ${goal.monthsToComplete - goal.monthsRemaining} months`
                    }
                  </span>
                </div>
                <button className="text-[#1F3A93] text-sm font-medium flex items-center hover:underline">
                  Details
                  <ArrowRight className="ml-1 h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      )}
      
      {/* Add Goal Modal */}
      {showAddModal && (
        <GoalFormModal
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddGoal}
          title="Add New Goal"
        />
      )}
      
      {/* Edit Goal Modal */}
      {showEditModal && editingGoal && (
        <GoalFormModal
          onClose={() => {
            setShowEditModal(false)
            setEditingGoal(null)
          }}
          onSubmit={handleUpdateGoal}
          title="Edit Goal"
          initialData={editingGoal}
        />
      )}
    </div>
  )
}

function GoalFormModal({ 
  onClose, 
  onSubmit, 
  title, 
  initialData 
}: { 
  onClose: () => void; 
  onSubmit: (data: any) => void; 
  title: string;
  initialData?: any;
}) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    iconName: initialData?.iconName || 'CircleDollarSign',
    color: initialData?.color || 'bg-blue-100 text-blue-600',
    currentAmount: initialData?.currentAmount || 0,
    targetAmount: initialData?.targetAmount || 0,
    targetDate: initialData?.targetDate || new Date(Date.now() + 31536000000).toISOString().split('T')[0], // Default to 1 year from now
    contributions: {
      frequency: initialData?.contributions?.frequency || 'Monthly',
      amount: initialData?.contributions?.amount || 0
    }
  });
  
  // State for auto-calculation toggle
  const [autoCalculate, setAutoCalculate] = useState(!initialData);
  
  // Function to calculate monthly contribution
  const calculateMonthlyContribution = useCallback(() => {
    const today = new Date();
    const targetDate = new Date(formData.targetDate);
    
    // Calculate months between dates
    const monthsRemaining = 
      (targetDate.getFullYear() - today.getFullYear()) * 12 + 
      (targetDate.getMonth() - today.getMonth());
    
    // If target date is in the past or same month, default to 1 month
    const calculationMonths = monthsRemaining <= 0 ? 1 : monthsRemaining;
    
    // Calculate amount needed to save
    const amountToSave = formData.targetAmount - formData.currentAmount;
    
    // Calculate monthly contribution (rounded to nearest whole dollar)
    const monthlyContribution = Math.ceil(amountToSave / calculationMonths);
    
    // Don't allow negative contributions
    return Math.max(0, monthlyContribution);
  }, [formData.targetAmount, formData.currentAmount, formData.targetDate]);
  
  // Update contribution amount when relevant fields change
  useEffect(() => {
    if (autoCalculate) {
      const monthlyContribution = calculateMonthlyContribution();
      setFormData(prev => ({
        ...prev,
        contributions: {
          ...prev.contributions,
          amount: monthlyContribution
        }
      }));
    }
  }, [formData.targetAmount, formData.currentAmount, formData.targetDate, autoCalculate, calculateMonthlyContribution]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (name === 'autoCalculate') {
      const checked = (e.target as HTMLInputElement).checked;
      setAutoCalculate(checked);
      
      // If turning auto-calculate on, immediately update the contribution amount
      if (checked) {
        const monthlyContribution = calculateMonthlyContribution();
        setFormData(prev => ({
          ...prev,
          contributions: {
            ...prev.contributions,
            amount: monthlyContribution
          }
        }));
      }
      return;
    }
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.')
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent as keyof typeof formData] as any,
          [child]: type === 'number' ? Number(value) : value
        }
      })
    } else {
      setFormData({
        ...formData,
        [name]: name === 'currentAmount' || name === 'targetAmount' ? Number(value) : value
      })
    }
  }
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }
  
  // Icon options with corresponding Lucide icons
  const iconOptions = [
    { name: 'CircleDollarSign', icon: CircleDollarSign, label: 'Money' },
    { name: 'Home', icon: Home, label: 'Home' },
    { name: 'Car', icon: Car, label: 'Car' },
    { name: 'Plane', icon: Plane, label: 'Travel' },
    { name: 'GraduationCap', icon: GraduationCap, label: 'Education' },
    { name: 'Briefcase', icon: Briefcase, label: 'Retirement' },
  ]
  
  // Color options
  const colorOptions = [
    { value: 'bg-blue-100 text-blue-600', label: 'Blue' },
    { value: 'bg-green-100 text-green-600', label: 'Green' },
    { value: 'bg-purple-100 text-purple-600', label: 'Purple' },
    { value: 'bg-yellow-100 text-yellow-600', label: 'Yellow' },
    { value: 'bg-red-100 text-red-600', label: 'Red' },
    { value: 'bg-indigo-100 text-indigo-600', label: 'Indigo' },
  ]
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          <button 
            className="p-1 rounded-full hover:bg-gray-100" 
            onClick={onClose}
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          {/* Goal Name */}
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Goal Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Emergency Fund"
            />
          </div>
          
          {/* Icon & Color Selection */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Icon
              </label>
              <select
                name="iconName"
                value={formData.iconName}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                {iconOptions.map(option => (
                  <option key={option.name} value={option.name}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Color
              </label>
              <select
                name="color"
                value={formData.color}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                {colorOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Current and Target Amount */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="currentAmount" className="block text-sm font-medium text-gray-700 mb-1">
                Current Amount
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <span className="text-gray-500">$</span>
                </div>
                <input
                  type="number"
                  id="currentAmount"
                  name="currentAmount"
                  min="0"
                  required
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={formData.currentAmount}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div>
              <label htmlFor="targetAmount" className="block text-sm font-medium text-gray-700 mb-1">
                Target Amount
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <span className="text-gray-500">$</span>
                </div>
                <input
                  type="number"
                  id="targetAmount"
                  name="targetAmount"
                  min="1"
                  required
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={formData.targetAmount}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
          
          {/* Target Date */}
          <div className="mb-4">
            <label htmlFor="targetDate" className="block text-sm font-medium text-gray-700 mb-1">
              Target Date
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Calendar className="h-4 w-4 text-gray-500" />
              </div>
              <input
                type="date"
                id="targetDate"
                name="targetDate"
                required
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={formData.targetDate}
                onChange={handleChange}
              />
            </div>
          </div>
          
          {/* Auto-calculate toggle */}
          <div className="flex items-center mb-4">
            <input
              type="checkbox"
              id="autoCalculate"
              name="autoCalculate"
              checked={autoCalculate}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="autoCalculate" className="ml-2 block text-sm text-gray-700">
              Auto-calculate monthly contribution
            </label>
          </div>
          
          {/* Monthly Contribution */}
          <div className="mb-6">
            <label htmlFor="contributions.amount" className="block text-sm font-medium text-gray-700 mb-1">
              Monthly Contribution
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Wallet className="h-4 w-4 text-gray-500" />
              </div>
              <input
                type="number"
                id="contributions.amount"
                name="contributions.amount"
                min="0"
                required
                disabled={autoCalculate}
                className={`w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${autoCalculate ? 'bg-gray-100' : ''}`}
                value={formData.contributions.amount}
                onChange={handleChange}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <span className="text-gray-500">/month</span>
              </div>
            </div>
            {autoCalculate && (
              <p className="mt-1 text-xs text-gray-500">
                Based on your target of ${formData.targetAmount} by {new Date(formData.targetDate).toLocaleDateString()}
              </p>
            )}
          </div>
          
          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#1F3A93] rounded-md text-sm font-medium text-white hover:bg-[#172d70]"
            >
              {initialData ? 'Update Goal' : 'Create Goal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 