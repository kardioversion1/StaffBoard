import React from 'react';
import RosterPane from '../planner/RosterPane';
import CoverageGrid from '../planner/CoverageGrid';
import NurseDrawer from '../planner/NurseDrawer';
import SwapQueue from '../planner/SwapQueue';

const ShiftPlanner: React.FC = () => {
  return (
    <div className="shift-planner">
      <SwapQueue />
      <div className="planner-body">
        <div className="planner-left">
          <RosterPane />
        </div>
        <div className="planner-center">
          <CoverageGrid />
        </div>
        <div className="planner-right">
          <NurseDrawer />
        </div>
      </div>
    </div>
  );
};

export default ShiftPlanner;
