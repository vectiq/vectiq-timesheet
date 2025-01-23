const { users, isLoading: isLoadingUsers } = useUsers();
const { projects: allProjects, isLoading: isLoadingProjects } = useProjects();
const { clients, isLoading: isLoadingClients } = useClients();
const { 
  forecasts,
  isLoading: isLoadingForecasts,
} = useForecasts(
  view === 'monthly' ? currentMonth : format(financialYearStart, 'yyyy-MM'),
  view === 'yearly'
);

// Filter for active projects only
const projects = useMemo(() => {
  return allProjects.filter(project => {
    // Get first day of selected month
    const selectedDate = new Date(currentMonth + '-01');
    selectedDate.setHours(0, 0, 0, 0);

    const isActive = project.isActive;
    const hasEndDate = project.endDate && project.endDate.trim().length === 10;
    const endDate = hasEndDate ? new Date(project.endDate + 'T23:59:59') : null;
    const isEndDateValid = endDate ? endDate >= selectedDate : true;
    
    return isActive && (!hasEndDate || isEndDateValid);
  });
}, [allProjects, currentMonth]);