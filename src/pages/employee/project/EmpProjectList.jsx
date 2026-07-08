import React, { useState } from 'react'
import "./EmpProjectList.css"
import ProjectListHeader from '../../../component/project-list/ProjectListHeader';
import ProjectListStats from '../../../component/project-list/ProjectListStats';
import ProjectStatusPieChart from '../../../component/project-list/ProjectStatusPieChart';
import ProjectProgressChart from '../../../component/project-list/ProjectProgressChart';
import ProjectFilterBar from '../../../component/project-list/ProjectFilterBar';
import ProjectListGrid from '../../../component/project-list/ProjectListGrid';



const EmpProjectList = () => {
  const [viewMode, setViewMode] = useState("grid");
  const [filters, setFilters] = useState({
    search: "",
    status: "All Status",
    priority: "All Priority",
    sortBy: "Newest First",
  });

  return (
    <div className="epl-page">
      <ProjectListHeader />

      <ProjectListStats />

      <div className="epl-charts-row">
        <ProjectStatusPieChart />
        <ProjectProgressChart />
      </div>

      <ProjectFilterBar
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onFilterChange={setFilters}
      />

      <ProjectListGrid filters={filters} viewMode={viewMode} />
    </div>
  )
}

export default EmpProjectList