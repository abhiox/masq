import React, { useEffect, useState } from "react";
import ReactExport from "react-export-excel";
import { Link } from 'react-router-dom';
import moment from 'moment';

const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;

const storage = window.require('electron-json-storage');

export default function Reports(props) {
  const [reportState, setReportState] = useState({ setupPresent: null });
  const [firstReport, setFirstReport] = useState([{ columns: [], data: [] }]);
  const [secondReport, setSecondReport] = useState([{ columns: [], data: [] }]);

  useEffect(() => {
    if (!('initialSetup' in props.initialSetup)) {
      setReportState({ setupPresent: false });
    } else {
      let totalOccupied = 0;
      let setupBarracks = props.initialSetup.initialSetup.barracks;
      let barrackVacantDate = {};
      let barrackData = setupBarracks.map(({ name, vacancy, occupied, occnDate }) => {
        occnDate = occnDate ? moment(occnDate).format("DD-MMM-YY") : '';
        let vacant = occnDate ? moment(occnDate).add(props.initialSetup.quarantineDays, 'd').format("DD-MMM-YY") : '';
        barrackVacantDate[name] = occnDate ? moment(occnDate).add(props.initialSetup.quarantineDays, 'd').unix():'';
        totalOccupied = occupied ? (parseInt(occupied) + totalOccupied) : totalOccupied;
        let bVacancy = vacancy ? vacancy.toString():"0";
        let bOccupied = occupied ? occupied.toString():"0";
        return [
          name,
          bVacancy,
          bOccupied,
          occnDate,
          vacant
        ];
      });

      let barrackColumns = ["BLOCK", "VACANCIES", "OCCUPIED", "OCCN DATE", "VACANT"];

      barrackData.push([ 'Total', props.initialSetup.totalVacancies.toString(), totalOccupied.toString() ]);

      setFirstReport([{ columns: barrackColumns, data: barrackData }]);
      setReportState({ setupPresent: true });

      storage.get('personList', function (error, personList) {
        if (error) {
          console.log('Error occured while fetching personList');
        } else if (personList.length) {
          let unitBarrMapping = {};
          let todayUnix = moment().unix();
          personList.forEach(({unitA, barrackA }) => {
            if(barrackVacantDate[barrackA] && barrackVacantDate[barrackA] > todayUnix){
              if(!(unitA in unitBarrMapping)){
                unitBarrMapping[unitA] = {};
              }
              unitBarrMapping[unitA][barrackA] = unitBarrMapping[unitA][barrackA] ? unitBarrMapping[unitA][barrackA]++ : 1; 
            }
          });

          let columns = [""]; // first header is empty
          setupBarracks.forEach(({name}) => columns.push(name)); // adding barrack names
          columns.push("Total", "Pro Rata Vacancy", "SUR(+)/DEFI(-)"); // adding additional headers
          
          let data = [];
          let units = props.initialSetup.initialSetup.dependentUnits;
          let proRataTotal = 0;
          let overallOccupancy = 0;
          let overallSurDeficit = 0;
          let overallTotalRow = ["G Total"]; // last row
          units.forEach(({ name, vacAllot }) => {
            let row = [name]; // each row after header
            let totalOccupancy = 0;
            setupBarracks.forEach((barr, index) => {
              let header = columns[index + 1];
              let unitBarrVal = 0;
              if(name in unitBarrMapping && unitBarrMapping[name][header]){
                unitBarrVal = unitBarrMapping[name][header];
                totalOccupancy = totalOccupancy + unitBarrVal;
              }
              overallTotalRow[index + 1] = overallTotalRow[index + 1] ? (overallTotalRow[index + 1] + unitBarrVal): unitBarrVal;  
              row.push(unitBarrVal.toString());
            });
            
            let proRata = vacAllot ? parseInt(vacAllot): 0;
            let surDeficit =  totalOccupancy - proRata;
            
            proRataTotal = proRataTotal + proRata;
            overallOccupancy = overallOccupancy + totalOccupancy;
            overallSurDeficit = overallSurDeficit + surDeficit;
            
            row.push(totalOccupancy.toString(), proRata.toString(), surDeficit.toString());

            data.push(row); 
          });
          overallTotalRow.push(overallOccupancy, proRataTotal, overallSurDeficit);
          overallTotalRow = overallTotalRow.map(val => val.toString());
          data.push(overallTotalRow);

          setSecondReport([{ columns, data }]);
        }
      });
    }
  }, [props.initialSetup]);

  return (
    <div className="setup-form">
      {
        reportState.setupPresent === false &&
        <Link className="setup-begin" to="/setup">Please click here to begin the setup</Link>
      }
      {
        reportState.setupPresent === true &&
        <>
          <ExcelFile element={<div className="icon-button report-btn-1">Save Datewise Report</div>}>
            <ExcelSheet dataSet={firstReport} name="Date Wise Vacation" />
          </ExcelFile>

          <ExcelFile element={<div className="icon-button report-btn-2">Save Vacancy Report</div>}>
            <ExcelSheet dataSet={secondReport} name="Vacancy Report" />
          </ExcelFile>
        </>
      }
    </div>
  )
}
