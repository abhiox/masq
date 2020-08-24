import React, { useEffect, useState } from "react";
import ReactExport from "react-export-excel";
import { Link } from 'react-router-dom';
import moment from 'moment';

const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;

export default function Reports(props) {
  const [reportState, setReportState] = useState({ setupPresent: null })

  useEffect(() => {
    if (!('initialSetup' in props.initialSetup)) {
      setReportState({ setupPresent: false });
    } else {
      let totalOccupied = 0;
      let barracks = props.initialSetup.initialSetup.barracks.map(({ name, vacancy, occupied, occnDate }) => {
        occnDate = occnDate ? moment(occnDate).format("DD-MMM-YY") : '';
        let vacant = occnDate ? moment(occnDate).add(props.initialSetup.quarantineDays, 'd').format("DD-MMM-YY") : '';
        totalOccupied = occupied ? (parseInt(occupied) + totalOccupied) : totalOccupied;
        return {
          name,
          vacancy,
          occupied,
          occnDate,
          vacant
        }
      });

      barracks.push({ name: 'Total', vacancy: props.initialSetup.totalVacancies, occupied: totalOccupied });
      setReportState({
        setupPresent: true,
        barracks
      });
    }
  }, [props.initialSetup]);

  // const style = { style: { fill: { bgColor: "#FFFF00" }, alignment: { horizontal: "center" } } }

  return (
    <div className="setup-form">
      {
        reportState.setupPresent === false &&
        <Link className="setup-begin" to="/setup">Please click here to begin the setup</Link>
      }
      {
        reportState.setupPresent === true &&
        <>
          <ExcelFile element={<div className="icon-button">Save Report</div>}>
            <ExcelSheet data={reportState.barracks} name="Date Wise Vacation">
              <ExcelColumn label="BLOCK" value="name" />
              <ExcelColumn label="VACANCIES" value="vacancy" />
              <ExcelColumn label="OCCUPIED" value="occupied" />
              <ExcelColumn label="OCCN DATE" value="occnDate" />
              <ExcelColumn label="VACANT" value="vacant" />
            </ExcelSheet>
          </ExcelFile>
        </>
      }
    </div>
  )
}
