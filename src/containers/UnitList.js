import React, { useEffect, useState } from 'react';
import Datatable from 'react-data-table-component';

const storage = window.require('electron-json-storage');

const columns = [
  {
    name: 'Unit Name',
    selector: 'name',
    sortable: true,
  },
  {
    name: 'Vacancy',
    selector: 'vacAllot',
    sortable: true,
  },
  {
    name: 'Occupied',
    selector: 'occupied',
    sortable: true,
  },
  {
    name: 'Sur(+)/Defi(-)',
    selector: 'surDef',
    sortable: true,
    cell: row => <div className={row.surDef < 0 ? 'redSurDef' : 'greenSurDef'}>{row.surDef}</div>,
  },
]

export default function UnitList(props) {
  const [units, setUnits] = useState([]);

  useEffect(() => {
    if ('initialSetup' in props.initialSetup) {
      let totalUnits = props.initialSetup.initialSetup.dependentUnits;
      if (totalUnits.length) {
        storage.get('personList', function (error, personList) {
          if (error) {
            console.log('Error occured while fetching list!');
          } else if (personList.length) {
            let unitsPerMapping = {};
            personList.forEach(person => {
              if (person.unitA) {
                if (unitsPerMapping[person.unitA]) {
                  unitsPerMapping[person.unitA]++;
                } else {
                  unitsPerMapping[person.unitA] = 1;
                }
              }
            });
            let totalVacany = 0, totalOccupied = 0;
            totalUnits.forEach(unit => {
              unit.occupied = 0;
              unit.surDef = unit.vacAllot;
              totalVacany += parseInt(unit.vacAllot);
              if (unitsPerMapping[unit.name]) {
                unit.occupied = unitsPerMapping[unit.name];
                totalOccupied += parseInt(unit.occupied);
                unit.surDef = unit.vacAllot - unit.occupied;
              }
            });
            totalUnits.push({
              name: 'Total',
              vacAllot: totalVacany,
              occupied: totalOccupied,
              surDef: totalVacany - totalOccupied
            });
            setUnits(totalUnits);
          }
        });
      }
    }
  }, [props.initialSetup])

  return (
    <div className="setup-form">
      <div className="unit-table">
        <Datatable
          title=""
          columns={columns}
          data={units}
          defaultSortField="surDef"
          pagination={false}
          highlightOnHover
          striped
          dense
          noDataComponent={<div>No data found!</div>}
        ></Datatable>
      </div>
    </div>
  )
}