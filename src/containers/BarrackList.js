import React, { useState, useEffect } from 'react';
import Datatable from 'react-data-table-component';
import { useToasts } from 'react-toast-notifications';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import moment from 'moment';

const storage = window.require('electron-json-storage');

export default function BarrackList(props) {
  const [barracks, setBarracks] = useState([]);
  const [initialSetup, setInitialSetup] = useState({});

  const columns = [
    {
      name: 'Barrack Name',
      selector: 'name',
      sortable: true,
    },
    {
      name: 'Vacancy',
      selector: 'vacancy',
      sortable: true,
    },
    {
      name: 'Occupied',
      selector: 'occupied',
      sortable: true,
      cell: row => row.occupied ? row.occupied : 0,
    },
    {
      name: 'Occn Date',
      selector: 'occnDate',
      sortable: true,
      cell: row => {
        return (
          <div className="barrack-date">
            <DatePicker
              selected={row.occnDate}
              maxDate={new Date()}
              dateFormat="dd MMM yyyy"
              onChange={e => changeOccnDate(e.getTime(), row.name)}
            ></DatePicker>
          </div>
        )
      }
    },
    {
      name: 'Vacant',
      selector: 'vacant',
      sortable: true,
      cell: row => {
        return <div>
          {
            row.occnDate ?
              moment(row.occnDate).add(props.initialSetup.quarantineDays, 'd').format("DD MMM YYYY")
              : ''
          }
        </div>
      }
    },
  ];

  const changeOccnDate = (time, rowName) => {
    let tempBarracks = [...barracks];
    let index = tempBarracks.findIndex(barr => barr.name === rowName);
    tempBarracks[index].occnDate = time;
    setBarracks(tempBarracks);
    saveBarracks(tempBarracks);
  }

  const { addToast } = useToasts();
  const showToast = (msg, appearance) => {
    addToast(msg, {
      appearance,
      autoDismiss: true,
    });
  }
  const saveBarracks = tempBarracks => {
    storage.set('initialSetup', {
      ...initialSetup,
      initialSetup: {
        ...initialSetup.initialSetup,
        barracks: tempBarracks
      }
    }, function (error) {
      if (error) {
        showToast('Error occured while saving changes!', 'warning');
      } else {
        showToast('Changes saved successfully!', 'success');
      }
    });
  }

  useEffect(() => {
    if ('initialSetup' in props.initialSetup) {
      let data = props.initialSetup;
      setBarracks(data.initialSetup.barracks);
      setInitialSetup(data);
    }
  }, [props.initialSetup]);

  return (
    <div className="setup-form">
      <div className="barrack-table">
        <Datatable
          title=""
          columns={columns}
          data={barracks}
          defaultSortField="name"
          pagination={false}
          highlightOnHover
          striped
          overflowY
          dense
          progressPending={false}
          noDataComponent={<div>No data found!</div>}
        ></Datatable>
      </div>
    </div>
  )
}